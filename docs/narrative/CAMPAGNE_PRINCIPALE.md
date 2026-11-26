# Aliens: Tantalus Frontier — Bible des campagnes

> **Document de conception narrative, source uniquement.** Il n'est pas copié dans le build public.
> **Intrigue, lieux et personnages originaux du projet** (`provenance: tantalus-project-original`, `canonExact: false`). Aucune scène, aucun lieu et aucun personnage d'un film ou d'un jeu existant n'est repris. Les noms hérités d'un jeu existant dans le catalogue sont remplacés par des noms originaux (§1.5) ; les identifiants techniques restent inchangés pour préserver les sauvegardes.
> L'intrigue respecte les règles de l'univers *Alien* (§1.3). Les noms de la franchise restent la propriété de leurs ayants droit (`LICENSE_NOTICE.md`).

## Sommaire

- **Partie I — Campagne principale (Cocyte)** : §0 lecture · §1 cadre et prémisse · §2 personnages · §3 chronologie · §4 prologue · §5 enquête · §6 colonie Port-Méridien · §7 station Asphodèle · §8 quêtes du Tantalus · §9 opérations secondaires · §10 cinématiques · §11 raccordement · §12 points ouverts
- **Partie II — Campagnes annexes** : §13 voyager dans le Reach · §14 La Saison des Reines · §15 Directive zéro · §16 Les Bâtisseurs · §17 Fièvre noire · §18 Le banc d'essai · §19 le fil QZ17 · §20 synthèse de production
- **Partie III — Missions uniques sur les mondes du catalogue** : §21 principes et chronologie · §22 opérations Héritage et préquelles · §23 mondes sous licence · §24 mondes du projet · §25 sites frontaliers · §26 archives MIRE · §27 intégration
- **Partie IV — Besoins de production** : §28 méthode et socle présent · §29 campagne principale · §30-34 campagnes annexes · §35 archives MIRE · §36 missions par planète · §37 récapitulatif
- **Partie V — Audit complet des manques** : §38 corrections, personnages, ennemis, véhicules, armes, costumes, props, décors, animations, VFX, systèmes, audio, interface, cinématiques
- **Partie VI — Missions sur les lieux originaux de la bible** : §39
- **Partie VII — Vues et organisation des hubs** : §40 trois vues (latérale, couloir de profondeur, plan au sol à 35°) · §41 Tantalus pièce par pièce · §42 Asphodèle · §43 Port-Méridien · §44 liste complète de ce qui reste à faire et à générer
- **Décisions validées** : §45, cadrage des deuxième et troisième séries §45.1-45.2 · registres des missions §0.3 · origines d'Echo-9 §2.4
- **Partie VIII — Musique : prompts pour Google Flow Music** : §46 méthode et palette · §47 hub et voyage · §48 campagne principale · §49 campagnes annexes · §50 archives et missions spéciales · §51 récapitulatif
- **Partie IX — Feuille de route pour rendre le jeu attractif** : §52 principes, état et renommage · §53 feuille de route détaillée · §54 ordre de travail · §55 conception technique des décisions de cadrage · §56 priorités P0 et P1 (validées le 2026-11-12)

# PARTIE I — Campagne principale : Cocyte

## 0. Comment lire ce document

| Statut | Signification |
| --- | --- |
| **[EXISTANT]** | Élément jouable aujourd'hui ; le module source est cité. Ce statut ne signifie pas que toute la promesse d'une opération est achevée. Le texte du code fait foi. |
| **[PARTIEL]** | Système ou opération avec `implementationStatus: 'partial'` dans le registre courant `src/special-operations-v131.js`, chargé par `src/app.js`. Un chapitre peut être jouable tout en restant partiel (art dédié, actes supplémentaires). |
| **[PROPOSÉ]** | Conception à valider, puis à raccorder au contenu, au chargement, au jeu, à l'interface et à la sauvegarde. |
| **[À DÉCIDER]** | Point ouvert à trancher par le propriétaire. |

Les identifiants existants (`special-archive-relay`, `special-c12-horde`, `special-black-cocoon`, `special-apc-convoy`, `special-narrative-qz17`, `crew-09-inez-harlow`…) sont conservés. Les nouveaux identifiants proposés commencent par `story-`, `colony-`, `station-` ou `ship-`.

### 0.1 Types de missions

| Type | Rôle | Durée | Rejouable |
| --- | --- | --- | --- |
| **Intro** | Ouvre une partie : un lieu, ses personnages, ses règles. | Courte | Non |
| **Principale** | Fait avancer l'histoire. | Longue | Non |
| **Annexe** | Histoire secondaire écrite, liée à un personnage ou un lieu. | Moyenne | Non |
| **Locale** | Contrat court sur un lieu, pour l'entretenir ou le défendre. | Courte | Oui |

Les missions locales reprennent les objectifs déjà définis dans `content-core-v50.js` : `rescue survivors`, `restore atmospheric processing`, `seal the hive`, `recover black-box data`, `escort a colony convoy`, `purge a reactor nest`, `board a drifting vessel`, `hold the extraction zone`, `track an apex specimen`, `recover a synthetic`, `capture a live organism`, `defend the colony`, `navigate the vent network`, `secure the power loader`, `escape the quarantine`.

### 0.2 Règle d'écriture des missions

Chaque mission de ce document indique son **ancrage Alien** : l'élément de l'univers qui la justifie (cycle biologique, matériel des Marines, procédure de la compagnie, isolement, synthétique, infrastructure coloniale). Une mission sans ancrage n'est pas retenue.

### 0.3 Registre de chaque mission — validé le 2026-11-06

**Décision (§45.1, §45.2) :** le ton varie selon la mission ; Claude propose un registre par mission, le propriétaire valide.

| Registre | Ce que le joueur vit | Rythme des ennemis | Ressources | Sauvegarde (§45.2) |
| --- | --- | --- | --- | --- |
| **Horreur** | Peu de combats, beaucoup de signes ; fuir est souvent le bon choix | Rares, imprévisibles, souvent invisibles | Munitions rares | Checkpoints et **terminaux de sauvegarde physiques** uniquement |
| **Tension** | Montée lente, puis un ou deux combats intenses | Dosés par le directeur de tension (§53.3) | Normales | Checkpoints, terminaux, **sauvegarde libre hors combat** |
| **Action** | Vagues, défense, poursuite | Nombreux, annoncés | Abondantes, ravitaillement | Checkpoints, sauvegarde libre hors combat |
| **Calme** | Dialogue, enquête, hub, sans combat | Aucun | — | Libre |

Le registre est une donnée de la fiche de mission ; il règle le directeur de tension, la musique (alerte ou silence) et la règle de sauvegarde. Il n'est pas réglable par le joueur ; la difficulté l'est (§45.2).

**Campagne principale (Partie I) :**

| Mission | Registre proposé | Raison |
| --- | --- | --- |
| P-1 Réveil en cryostase | Calme | Création du personnage, aucun ennemi |
| P-2 Qualification au pas de tir | Calme | Entraînement |
| P-3 / `colony-intro-quai` Le quai des vivants | Tension | Premier contact avec la menace, triage sous pression |
| Acte I — La cargaison fantôme | **Horreur** | Le texte prévoit « peu de combats, beaucoup de signes » et un parasite |
| Acte II — Le dernier relais | Tension | Enquête au relais, menace en arrière-plan |
| Acte III A — Ramener le blindé | **Action** | Convoi, horde, Crushers, Reine en barrage |
| Acte III B — C-12 | Tension | 45 secondes à tenir, conteneur qui frappe |
| Interlude — Quarantaine à bord | **Horreur** | Traque dans les ponts, conduits, créature unique |
| Acte IV — Cocon noir | **Horreur** | Réveil dans la résine, sans arme garantie |
| Acte V — Non viable | **Action** | Course APC, poursuite de Reine, face-à-face |
| Épilogue | Calme | Visite sans combat |
| `colony-intro-doyenne` | Calme | Visite du port |
| `colony-c1` Tenir le port | Action | Défense et soudure des sas |
| `colony-c2` L'air du port | Tension | Descente technique, nid dans la chaleur |
| `colony-c3` Le convoi des rescapés | Horreur | Un embryon parmi les arrivants, aucune panique possible |
| `colony-c4` Le culte du port | Tension | Enquête de nuit, puis choix |
| `colony-c5` La nuit des murs | Action | Défense jusqu'à l'aube |
| `colony-a-quai` | Tension | Escorte d'un témoin |
| `colony-a-ferro` | Horreur | Patients disparus, hôtes non diagnostiqués |
| `colony-a-abri` | Tension | Escorte civile sans arme lourde |
| `colony-a-seegson` | Tension | Entrepôt abandonné, synthétique bloqué |
| `colony-a-balise` | Horreur | Fermes isolées, silence radio |
| `colony-a-crucible` | Calme | Négociation |
| `colony-a-converti` | Horreur | Descente vers les galeries |
| `station-intro-silence` | Calme | Écoute de l'enregistrement, à bord |
| `station-s1` L'arrimage | Horreur | Station morte, détecteur saturé |
| `station-s2` La voix de CASSIUS | Tension | Rétablir l'énergie, dialogue avec l'IA |
| `station-s3` Les ponts scellés | Horreur | Laboratoire, berceaux ouverts |
| `station-s4` Le hub Asphodèle | Action | Dernière purge |
| `station-a-echo8` | Horreur | Suivre les traces d'une équipe perdue |
| `station-a-grue` | Calme | Négociation |
| `station-a-journaux` | Horreur | Ponts vides, journaux |
| `station-a-hydro` | Tension | Remise en route de la serre |
| `station-a-sonde` | Tension | Récupération en extérieur |
| `station-a-cassius` / `station-a-bishop` | Calme | Archives et dialogue |
| Quêtes `ship-*` | Calme | Hub, sauf `ship-doyle` et `ship-orlov` (Tension : sortie de récupération) et `ship-park` (Horreur : conduits) |
| Contrats locaux de Port-Méridien | Selon l'objectif | Purge et ronde : Action · escorte, filtres, récupération, chargeur : Tension · recherche de disparus, sceller une ouverture : Horreur |

**Répartition proposée hors quêtes de bord :** 11 Horreur, 11 Tension, 5 Action, 9 Calme (36 missions). Les quatre nouvelles missions principales et les huit nouvelles annexes du §5.9 ont leur registre dans les tableaux du §5.9. Les autres parties sont au §0.4.

### 0.4 Registres des autres parties — validé le 2026-11-06

Abréviations : **H** Horreur · **T** Tension · **A** Action · **C** Calme (définitions au §0.3). Les numéros renvoient aux tableaux des arcs.

**Campagnes annexes (§14-18) :**

| Campagne | Missions d'histoire | Annexes |
| --- | --- | --- |
| 1 · La Saison des Reines | Arc 1 : 1.1 H · 1.2 T · 1.3 H · 1.4 A · 1.5 A — Arc 2 : 2.1 T · 2.2 A · 2.3 A · 2.4 A · 2.5 C — Arc 3 : 3.1 H · 3.2 H · 3.3 A · 3.4 A · 3.5 A | `queens-a-navarre` H · `-filets` H · `-phare` T · `-mineurs` H · `-rask` T · `-sorensen` T · `-grue` T · `-ombelle` T · `-echantillon` A |
| 2 · Directive zéro | Arc 1 : 1.1 H · 1.2 A · 1.3 T · 1.4 A — Interlude : I.1 C · I.2 H — Arc 2 : 2.1 H · 2.2 T · 2.3 A · 2.4 T · 2.5 A — Arc 3 : 3.1 T · 3.2 H · 3.3 T · 3.4 A | `synth-a-grue` T · `-oasis` T · `-david` C · `-cuves` T · `-bishop` C · `-joe` T · `-hyperdyne` T · `-echoa` C |
| 3 · Les Bâtisseurs | Arc 1 : 1.1 C · 1.2 H · 1.3 H · 1.4 T · 1.5 A — Arc 2 : 2.1 H · 2.2 T · 2.3 A · 2.4 T · 2.5 A — Arc 3 : 3.1 T · 3.2 T · 3.3 T · 3.4 H · 3.5 A | `builders-a-grue` H · `-sonde` T · `-fresque` T · `-viret` T · `-troupeau` T · `-david` C · `-viret2` C |
| 4 · Fièvre noire | Arc 1 : 1.1 H · 1.2 T · 1.3 H · 1.4 H · 1.5 T — Arc 2 : 2.1 H · 2.2 A · 2.3 T · 2.4 T — Arc 3 : 3.1 T · 3.2 A · 3.3 C · 3.4 A | `fever-a-ecole` T · `-foreuse` H · `-noor` T · `-maternite` T · `-park` T · `-moreau` C · `-szabo` H |
| 5 · Le banc d'essai | Arc 1 : 1.1 T · 1.2 T · 1.3 H · 1.4 H · 1.5 A — Arc 2 : 2.1 H · 2.2 H · 2.3 T · 2.4 A — Arc 3 : 3.1 T · 3.2 A · 3.3 A · 3.4 C · 3.5 T · 3.6 A | `bench-a-fiches` C · `-enfant` H · `-palimpste` T · `-noor` T · `-capitaine` C · `-bishop` C · `-cages` T |

Les quêtes du Tantalus liées aux campagnes annexes (`ship-q-*`, `ship-s-*`, `ship-b-*`, `ship-f-*`, `ship-e-*`) sont en **C**.

**Missions de planète de la franchise (§22) :**

| Monde | Registres |
| --- | --- |
| Acheron / LV-426 | `legacy-acheron-1` H · `-2` H · `-3` T |
| LV-223 | `legacy-lv223-1` T · `-2` H · `-3` T |
| Fiorina 161 | `legacy-fury-1` H · `-2` H · `prequel-fury-auriga` T |
| Sevastopol | `legacy-sevastopol-1` T · `-2` T |
| Nostromo (route de Zeta) | `legacy-nostromo-1` T |
| Jackson's Star, Renaissance | `legacy-jackson-1` T · `legacy-renaissance-1` T |
| USM Auriga | `prequel-auriga-1` T · `-2` H |
| Épave de même classe que le Sulaco | `legacy-sulaco-1` T · `-2` H |
| Gateway Station | `active-gateway-1` C · `-2` T |
| LV-895, Katanga | `legacy-lv895-1` T · `-2` T · `legacy-katanga-1` T |
| Purdan | `legacy-purdan-1` H · `-2` T |
| LV-1201 | `prequel-lv1201-1` T · `-2` H |
| BG-386 | `bg386-1` T · `-2` H |
| Ryushi | `ryushi-1` T · `-2` H |
| LV-742 | `lv742-1` A · `-2` T |
| Lien *Yautja : la Longue Chasse* | `avp-hunt-1` H · `-2` H · `-3` A |

**Mondes sans œuvre et mondes originaux (§23-24) :** Ceto H · Hiémale H · New Galveston H · New Albion H · Capua VII H · Korari T · MIRE-9 T · Echo Basin A · Palimpste T · Pallas Rift T · Sable Meridian T · Nacre-7 A · Khepri Forge T.

**Contrats frontaliers (§25) et missions des lieux inventés (§39) :** registre déduit de l'objectif, comme pour les contrats locaux de Cocyte (§0.3) :

| Registre | Objectifs |
| --- | --- |
| A | `defend the colony`, `hold the extraction zone`, `purge a reactor nest`, `destroy a neuro-link relay` |
| T | `escort a colony convoy`, `recover black-box data`, `restore atmospheric processing`, `board a drifting vessel`, `secure the power loader`, `recover a synthetic`, `track an apex specimen`, `capture a live organism` |
| H | `seal the hive`, `navigate the vent network`, `escape the quarantine`, `rescue survivors` |

Les missions **D** (défi) du §39 gardent le registre de leur objectif ; seule leur difficulté augmente.

**Archives MIRE (§26) :**

| Archive | Registres |
| --- | --- |
| 001 Nostromo (chapitre existant) | H |
| 002 Sevastopol | M2-1 T · M2-2 T · M2-3 H · M2-4 H |
| 003 Renaissance | M3-1 T · M3-2 T · M3-3 H · M3-4 H |
| 004 Acheron | M4-1 C · M4-2 C · M4-3 T · M4-4 H · M4-5 H |
| 005 Fiorina 161 | M5-1 C · M5-2 T · M5-3 T · M5-4 H |
| 006 Katanga | M6-1 C · M6-2 T · M6-3 H · M6-4 H |

Les archives originales jouent des civils ou des techniciens : aucune n'est en Action. Les **archives fidèles** (§26.10) prennent le registre de l'œuvre, mission par mission, quand elles seront écrites. Ordre indicatif : *Alien*, *Alien: Isolation*, *Alien: Romulus*, *Alien 3* en H ; *Prometheus* en T ; *Aliens* (Hadley's Hope, première à produire) en T puis A ; *Aliens: Fireteam Elite* et *Alien Resurrection* en A.

---

## 1. Cadre

### 1.1 Pourquoi le Tantalus est envoyé

La prémisse suit la logique de l'univers : **une colonie perd le contact, la compagnie qui la finance a intérêt à ce qu'on n'y regarde pas de trop près, et ce sont les Marines coloniaux qu'on envoie.**

1. **La colonie.** Port-Méridien est une colonie portuaire de Cocyte, fondée sous charte de l'Administration coloniale et financée par un contrat de développement Weyland-Yutani. La charte comporte une clause classique : si la colonie est déclarée *non viable*, ses installations reviennent au financeur.
2. **Le réseau QZ.** Les communications de Cocyte passent par le réseau de relais QZ, exploité par Weyland-Yutani. Ses relais au sol (QZ-17, QZ-18…) sont pilotés depuis la **station Asphodèle**, en orbite. Le réseau sert aussi de **réseau de quarantaine sanitaire** : il peut retenir des messages et bloquer des départs.
3. **La perte de contact.** Pendant des semaines, les appels de Port-Méridien arrivent en retard. Puis la station Asphodèle émet un **code de quarantaine rouge** sur tout Cocyte et cesse de répondre.
4. **La réquisition.** Un code de quarantaine interdit l'approche aux navires civils : seule une unité militaire peut l'appliquer, enquêter ou le lever. L'Administration coloniale réquisitionne l'unité des Marines coloniaux la plus proche, l'**USS Tantalus**, en patrouille dans le secteur.
5. **L'ordre de mission** officiel : *rétablir le contact, évaluer la situation sanitaire, faire appliquer la quarantaine, évacuer les civils si nécessaire.*
6. **Les consignes de la compagnie** arrivent avec plusieurs jours de retard, par le réseau QZ lui-même : *préserver le « matériel sous scellés » en transit sur Cocyte.* BISHOP-9, synthétique de la compagnie embarqué comme officier scientifique, reçoit en parallèle une directive qu'il n'a pas à commenter tant qu'on ne l'interroge pas.
7. **La relève.** À l'arrivée, le Tantalus envoie une équipe de reconnaissance, **Echo-8**, aborder la station Asphodèle. Le contact est perdu après six heures. MU/TH/UR sort alors une relève d'hypersommeil : **Echo-9**, le joueur.

Ce montage justifie, sans artifice, tout ce que le jeu contient déjà : la salle de briefing, les relais QZ à remettre en service, l'enquête sur les messages retardés, les évacuations, le contrôle biologique au retour et la méfiance envers BISHOP-9.

### 1.2 Pitch

**2204.** Sur Cocyte, les messages de détresse arrivent en retard. Pas à cause des pannes : à cause des priorités. Quand un relais doit choisir entre une cargaison et des vivants, quelqu'un a déjà choisi.

Ce que la Relève Echo-9 découvre : Weyland-Yutani fait transiter par le réseau QZ des **organismes vivants sous scellés**. Les relais retardent les appels de détresse pour garder ce trafic hors des registres. Port-Méridien en paie le prix, et la compagnie compte sur l'effondrement de la colonie pour la déclarer non viable et récupérer ce qui s'y trouve.

La campagne avance sur trois fronts liés :

| Front | Question | Enjeu |
| --- | --- | --- |
| **L'enquête** (principale) | Qui a fait passer le fret avant les vivants, et qu'est-ce que c'était ? | Le dossier qui peut faire tomber la clause de non-viabilité. |
| **La colonie** | Port-Méridien peut-il survivre, puis tenir seul ? | Une colonie viable garde sa charte ; une colonie effondrée revient à la compagnie. |
| **La station perdue** | Que s'est-il passé sur Asphodèle, et qui la contrôlera ? | Le contrôle du réseau QZ, donc des messages, des départs et de la quarantaine. Futur second hub. |

### 1.3 Règles de l'univers à respecter

1. **Isolement et lenteur.** Les messages passent par des relais ; un relais muet isole une colonie. Pas d'appel instantané entre systèmes. Les ordres de la compagnie arrivent toujours en retard et toujours datés.
2. **Hypersommeil.** Les équipages dorment, se relaient, se réveillent désorientés. Une relève sortie de cryostase ne connaît pas ce qui s'est passé avant elle.
3. **La compagnie.** Weyland-Yutani protège ses actifs par des contrats, des clauses et des directives. Elle ne ment presque jamais frontalement : elle cite. Ses représentants sont polis, procéduriers et prêts à sacrifier des vies si le contrat le permet.
4. **Les synthétiques.** Ils suivent leurs directives. BISHOP-9, DAVID-8R et ECHO-A ne trahissent pas par méchanceté ; leurs priorités sont écrites par d'autres, et la question est toujours *qui a écrit quoi*.
5. **Le cycle biologique.** Œuf, parasite, gestation, éclosion, croissance (le projet a déjà `enemy-ovomorph-cycle-v66.js` et `enemy-facehugger-combat-v65.js`). Un contrôle biologique au retour n'est jamais une formalité. Une ruche se nourrit d'hôtes.
6. **Les Marines.** Professionnels fatigués, matériel lourd et daté : fusil M41A, smartgun, détecteur de mouvement (`motion-tracker-v160.js`), tourelles sentinelles, M577, dropship, chargeur. Humour sec, peu de discours.
7. **La technologie industrielle.** Écrans monochromes, sas, conduits, soudure de portes, processeurs atmosphériques, alarmes. Rien de propre ni de lisse.
8. **L'horreur avant l'action.** Une mission commence par des signes (résine, silence, traces d'acide, bip du détecteur) avant le premier contact. Les combats coûtent des munitions, des blessures et du moral.
9. **Une preuve n'est pas une accusation.** Ton déjà établi par Inez Harlow et MU/TH/UR : on sépare le fait établi, la pièce manquante et la supposition.

### 1.4 Lieux de la campagne et provenance

| Lieu | Nature | Statut |
| --- | --- | --- |
| **USS Tantalus** | Vaisseau des Marines coloniaux, hub mobile : 4 ponts, 16 salles d'équipage, annexes (`npc-dialogue-v62.js`, `hub-v52-runtime.js`). | **[EXISTANT]** |
| **Cocyte** (désignation TR-417) | Monde colonial du Tantalus Reach, nom original remplaçant « Lethe » (§1.5). Identifiant technique conservé : `world-05-lethe`. Relais QZ, Port-Méridien, complexe C-12 et galeries du dépôt. | **[EXISTANT]** dans les missions / nom **[PROPOSÉ]** |
| **Port-Méridien** | Colonie portuaire, « quai des vivants » : triage, sas, civils (`port-meridien-v90.js`). La colonie à sauver et reconstruire. | **[EXISTANT]** (intro) / **[PROPOSÉ]** (reconstruction) |
| **Relais QZ-17 et QZ-18** | Postes au sol du réseau QZ : quais, fret, archives locales. | **[PARTIEL]** / **[EXISTANT]** |
| **Corridor du convoi et ascenseur C-12** | Axe terrestre vers le complexe industriel, galerie à trois voies. | **[EXISTANT]** |
| **Le dépôt** | Installation souterraine absente des registres officiels, destination des conteneurs QZ17. | **[PROPOSÉ]** |
| **Station Asphodèle** | Station de contrôle du réseau QZ, en orbite. Silencieuse. La station perdue, futur hub. | **[PROPOSÉ]** |

*Cocyte* et *Asphodèle* prolongent la logique mythologique du Tantalus (fleuve des lamentations, plaine des ombres). Une recherche rapide n'a trouvé aucun lieu de la franchise portant ces noms ; elle n'est pas exhaustive. Le préfixe **TR-** (Tantalus Reach) remplace les désignations « LV- », dont beaucoup sont déjà prises par la franchise (LV-1113, par exemple).

Le renommage des noms hérités du catalogue est décrit au §1.5.

### 1.5 Noms originaux et renommage du code — [PROPOSÉ]

Les noms hérités d'un jeu existant sont remplacés par des noms originaux. **Ce document applique déjà les nouveaux noms.** Dans le code, seul le texte affiché change : les identifiants (`world-05-lethe`, modules `campaign-lethe-*`, identifiants `special-*`, clés de sauvegarde) restent tels quels.

| Nom hérité | Nom original | Où dans le code | Remarque |
| --- | --- | --- | --- |
| Lethe | **Cocyte** (TR-417) | `content-core-v50.js` (graine de monde), libellés `LETHE · …` des scènes (`campaign-story-v160.js`, `campaign-convoy-story-v161.js`, `campaign-lethe-story-v163.js`, `campaign-lethe-continuity-v163.js`, interfaces associées), `app.js`, `save.js`, `mission-insertion-ui-v62.js` | L'identifiant `world-05-lethe` est dérivé du nom : il doit être figé explicitement avant le renommage, sinon les sauvegardes et 16 références cassent. |
| Secteur Cerberus | **Tantalus Reach** | `content-core-v50.js` | Secteur déjà utilisé par les mondes originaux du projet. |
| « Dead Hills, Olduvai, Pharos et Tantalus Base » | **« Port-Méridien, relais QZ, complexe C-12 et galeries du dépôt »** | `content-core-v50.js` (description de Cocyte) | Description alignée sur la campagne. |
| Pioneer Station | **Station Orphée** — station de recherche et réseau de défense du Tantalus Reach | `content-core-v50.js` | Utilisée par la campagne annexe 4 (§17). |
| Darwin Era (culte) | **Enfants de l'Hôte Parfait** (faction existante « Children of the Perfected Host ») | `enemy-source-adaptations-v118.js`, `enemy-coverage-v117.js`, `enemy-import-admissions-v106.js`, `xeno-trials-ui-v96.js` | « Cultiste de l'Hôte Parfait », « Gardien de l'Hôte Parfait ». **Les visuels actuels sont adaptés d'un concept du jeu d'origine** (note de référence dans `enemy-source-adaptations-v118.js`) : renommer ne suffit pas, l'art doit être refait pour être original. |
| Maeko Hayes | **Solène Ivarsson** — administratrice du réseau QZ sur Asphodèle, disparue | `premium-personnel-v119.js` | Ses journaux sont retrouvés dans `station-a-journaux`. |
| Jonas Harper | **Sergent Dario Kessler** — chef de l'équipe Echo-8 | `premium-personnel-v119.js` | Donne un visage à l'équipe perdue. |
| « Incident de Lethe » | **« Incident de Cocyte »** | `premium-personnel-v119.js` | — |
| « LV-XENO » (titre de chapitre) | **« TR-0 · La Ruche-monde »** | `ecosystem-missions-v131.js`, `special-operations-v67.js` | Évite le préfixe « LV- » de la franchise ; identifiant `hive-world` conservé. |

**Limite technique à connaître :** 13 des 17 fichiers concernés ont une empreinte figée par les audits du dépôt, et 6 scripts de test (`verify-campaign-story-v160.mjs`, `verify-campaign-lethe-v163.mjs`, `verify-campaign-convoy-history-v162.mjs`, `qa-campaign-lethe-v163.py`, `qa-reload-branches-v163.py`, `qa-harpoon-native-v162.py`) vérifient les textes actuels. Le renommage dans le code est donc un chantier à part : changer les textes, mettre à jour les tests, puis enregistrer une nouvelle succession d'audit.

### 1.6 Factions et institutions

Factions du jeu (`FACTIONS`, `content-core-v50.js`) ; rôle narratif **[PROPOSÉ]**.

| Faction | Rôle |
| --- | --- |
| **USCMC** | L'équipage du Tantalus. Ordres de sauvetage, moyens limités, chaîne de commandement lente. |
| **Weyland-Yutani** | Financeur de la colonie, exploitant du réseau QZ, commanditaire du fret. Présente par contrats, directives retardées, une représentante (§2.3) et, à l'Acte V, une équipe de récupération (« Weyland-Yutani Commando » existe déjà au catalogue). |
| **Frontier Colonies** | Les habitants de Port-Méridien : endettés envers la compagnie, méfiants envers tout uniforme. |
| **Seegson** | Fournisseur bon marché de la colonie et constructeur du système de gestion de la station Asphodèle : pannes fréquentes, pièces disponibles. |
| **Crucible Salvage Compact** | Récupérateurs. Ont profité du silence pour piller l'anneau extérieur d'Asphodèle. Partenaires possibles. |
| **Children of the Perfected Host** | Culte qui voit dans les organismes une élévation. Ici : des colons de Port-Méridien convertis pendant l'isolement. |
| **UPP** | Hors trame principale ; présence possible en annexe (balise, épave). |

Institutions mentionnées dans le récit **[PROPOSÉ]**, sans entrée de faction dans le code :

| Institution | Rôle |
| --- | --- |
| **Administration coloniale** | Délivre et retire les chartes de colonie ; a réquisitionné le Tantalus. |
| **ICC (Commission du commerce interstellaire)** | Arbitre les litiges de charte. C'est devant elle que le dossier de l'enquête peut faire tomber la clause de non-viabilité. |
| **Marshals coloniaux** | Police des colonies. Peuvent arrêter un responsable si le dossier le désigne. |

---

## 2. Personnages

### 2.1 Le joueur

**Echo-9 (« la Relève Echo-9 »)** — Marine colonial sorti d'hypersommeil pour remplacer l'équipe Echo-8, disparue sur la station Asphodèle. Apparence définie au créateur de personnage. **Passé au choix du joueur** parmi 20 origines écrites (§2.4) ; l'origine choisie modifie certaines répliques, sans changer l'histoire principale. Parle peu, décrit ses actions, garde toujours un trajet de retour en vue. Il ne sait de la mission que ce que le briefing lui dit : il découvre le reste en même temps que le joueur.

### 2.2 L'équipage du Tantalus

Postes et salles : `HUB_NPC_ROSTER` (`src/hub-v52-runtime.js`). Fonctions narratives : **[PROPOSÉ]**.

| Pont | Salle | Personnage | Rôle | Fonction dans la campagne |
| --- | --- | --- | --- | --- |
| 0 | Passerelle | **Mara Vega** | Commandante | Porte l'ordre de l'Administration ; finit par devoir choisir entre l'ordre et les colons. |
| 0 | Briefing | **Tamsin Velez** | Sergente | Mentor de terrain ; a perdu des Marines avec Echo-8. |
| 0 | Info. de combat | **ECHO-A** | Synthétique tactique | Affecté à Echo-8 à l'origine, resté à bord. Se demande ce qu'est une relève. |
| 0 | Baie cryo | **DAVID-8R** | Synthétique récupéré | Gère les réveils ; mémoire endommagée, ancien poste du réseau QZ. |
| 1 | Quartiers | **Asha Mbaye** | Liaison coloniale | Voix de Port-Méridien ; pilote la reconstruction. |
| 1 | Mess | **Leila Sørensen** | Éclaireuse | Routes de survie autour de la colonie. |
| 1 | Infirmerie | **Noor Okafor** | Infirmier | Triage, contrôles biologiques, registre des morts. |
| 1 | Laboratoire | **BISHOP-9** | Officier scientifique synthétique | Fourni par la compagnie ; porte une directive de préservation des spécimens. |
| 2 | Quarantaine | **Inez Harlow** | Xénobiologiste, liaison science | Conscience méthodologique de l'enquête ; première à comprendre ce que contiennent les scellés. |
| 2 | Armurerie | **Sanaa Doyle** | Smartgunner | Défense des murs et des sas. |
| 2 | Atelier | **Pablo Reyes** | Démolitions | Brèches, déblaiement, chantiers lourds. |
| 2 | Baie véhicules | **Cal Mercer** | Chef véhicules | Le M577 et les convois. |
| 3 | Hangar | **Maksim Orlov** | Pilote | Dropship et navettes vers la colonie et la station. |
| 3 | Réacteur | **Idris Kwan** | Ingénieur | Énergie du Tantalus, puis de la station. |
| 3 | Support-vie | **Jun Park** | Technicien | Air, eau, filtres ; processeur atmosphérique de la colonie. |
| 3 | Capteurs | **Rook** | Marine de reconnaissance | Voix radio de toutes les sorties ; c'est lui qui a perdu le signal d'Echo-8. |

**MU/TH/UR** — ordinateur de bord. Neutre, exact. Ne valide aucune action non prouvée.

**Recrues** (`crew-recruitment-v85.js`) : Mara Voss « RIVET » (chantier orbital), Nadia Bensaïd « SUTURE » (colonie isolée), Jonas Reed « BASTION » (réseau de cargos), Jun Seo « BALISE » (convois terrestres). Leurs origines existantes les rattachent chacune à un front (§8.3).

### 2.3 Nouveaux personnages — [PROPOSÉ]

| Personnage | Lieu | Rôle |
| --- | --- | --- |
| **Adèle Sarrazin** | Port-Méridien | Doyenne élue. Pragmatique, épuisée, ne fait confiance à aucun uniforme ni à aucun contrat. |
| **Tomas Wren** | Port-Méridien | Chef de quai. A vu passer les conteneurs scellés ; se tait pour ne pas perdre son contrat. |
| **Lucia Ferro** | Port-Méridien | Médecin de la colonie. A vu les premiers cas « d'intoxication » qui n'en étaient pas. |

**Portraits de Sarrazin, Wren et Ferro (V188, continuation du 16 novembre 2026).** La demande de génération du propriétaire succède au choix provisoire Q78/Q79. Trois PNG originaux sont maintenant raccordés par `src/colony-portraits-v188.js`, dans les dialogues et les sous-titres des cinématiques (`cin-p3-wren` sur le quai, `cin-p3-ferro` au triage, `cin-doyenne`). Leur cadrage tête-épaules, fond transparent, lumière principale en haut à droite et signes distinctifs reprennent la définition ci-dessous. Les primitives de `src/placeholder-portraits-v188.js` restent le repli pendant le chargement et en cas d'échec. Les choix physiques sont des adaptations du projet **[PROPOSÉ]**, sans ressemblance d'acteur revendiquée. Les images gardent la même identité dans tous les réglages daltoniens ; les variantes de couleurs décrites dans la table concernent le repli Canvas. La table de reconstruction ne montre aujourd'hui ni nom ni portrait. Provenance, contrôles à 80 px et limites : [rapport du lot](../development/COLONY_ART_QA_20261116.md).

| Personnage | Documenté | Adapté **[PROPOSÉ]** | À définir |
| --- | --- | --- | --- |
| **Adèle Sarrazin** | Doyenne élue, pragmatique, épuisée (§2.3) ; légère voûte de la silhouette en cinématique (§56.11). | Environ 68 ans ; cheveux argentés en chignon bas ; visage marqué de quelques rides ; manteau de laine sombre. **Signe :** écharpe de doyenne nouée au cou, deux pans rayés et frangés. Couleurs rouille et crème, conservées en mode daltonien, où elles restent contrastées. | Âge exact, origine, coiffure, couleur et motif définitifs de l'écharpe, et sens de ce signe dans la colonie. |
| **Tomas Wren** | Chef de quai (§2.3) ; gilet haute visibilité et tablette (§56.12, passe de cohérence du quai). | Environ 45 ans ; cheveux courts grisonnants, barbe de quelques jours ; veste de travail anthracite. **Signe :** gilet haute visibilité, avec deux bretelles et deux bandes réfléchissantes qui forment un « H ». Orange haute visibilité, vermillon en mode daltonien. La tablette n'est pas dessinée dans le portrait. | Âge, origine, couleur exacte du gilet et logo éventuel de l'employeur du port. |
| **Lucia Ferro** | Médecin de la colonie (§2.3) ; brassard à croix (§56.12). | Environ 38 ans ; cheveux sombres noués en chignon ; veste de terrain olive sur une tenue de soins claire. **Signe :** brassard blanc sur le haut du bras droit, avec une croix pleine. Croix rouge, vermillon en mode daltonien. Les proportions de la croix ne reprennent pas l'emblème protégé de la Croix-Rouge. | Âge, origine, blouse ou tenue d'isolement (§2.4.4 : variantes de `hazmat-suit` à créer) et emblème médical définitif. |

Les trois portraits de base sont produits et intégrés. Les autres portraits prévus au §2.4.4 et les expressions (question 84) restent à produire ; ce lot ne crée ni pose corporelle ni nouveau PNJ.
| **I. Voss** | QZ-18 | Contremaître dont le badge a signé la priorité de fret à 18:43 (`archive-relay-state-v122.js`). Disparu. |
| **Directrice Halloran** | Weyland-Yutani | Responsable régionale du réseau QZ. Ne s'adresse au Tantalus que par messages différés. Cite toujours une clause. |
| **CASSIUS** | Station Asphodèle | Système de gestion Seegson de la station. Applique la quarantaine à la lettre depuis des semaines, sans personne pour la corriger. Ni malveillant ni conscient : obéissant. |
| **Grue** | Crucible Salvage Compact | Capitaine récupératrice installée sur l'anneau extérieur d'Asphodèle. |

### 2.4 Origines d'Echo-9 — validé le 2026-11-06, avec capacités

**Décision (§45.2) :** 20 origines au choix, rédigées ici. Echo-9 reste un Marine colonial sorti d'hypersommeil pour remplacer Echo-8 ; l'origine décrit **ce qu'il était avant** son affectation au Tantalus.

**Règles communes :**

1. **Choix au créateur de personnage**, après l'apparence. Une fiche de 4 à 6 lignes, un portrait d'archive (photo de dossier) et la réplique d'entrée.
2. **L'histoire principale ne change pas.** L'origine change des répliques, ajoute une option de dialogue dans certaines scènes et donne un petit avantage.
3. **Avantage modeste.** Une seule capacité, utile dans une situation précise, jamais indispensable. Les recrues actuelles ont des traits sans effet mécanique (`TRAITS_V119`, `mechanicalBonus: false`, `crew-recruitment-v85.js`) ; si le propriétaire préfère la même règle pour Echo-9, la colonne « Capacité » devient purement descriptive.
4. **Trois répliques écrites par origine**, en français et en anglais (règle §45.1) : *Réveil* (P-1, réponse à DAVID-8R), *Réaction* (une scène de la campagne principale), *Retour* (épilogue ou scène de mess).
5. **Une scène de reconnaissance** : un personnage de la campagne réagit à l'origine (colonne « Écho dans la campagne »). Elle n'ouvre aucune récompense, conformément à la règle des quêtes (§8).
6. **Identifiants** : `origin-01` à `origin-20`, stockés dans le profil du personnage. Une valeur absente ou inconnue revient à `origin-20` (dossier caviardé), qui fonctionne sans texte propre à l'origine.

#### 2.4.1 Vue d'ensemble

| ID | Origine | Capacité proposée | Écho dans la campagne |
| --- | --- | --- | --- |
| `origin-01` | Survivant d'une section anéantie | **Sang-froid** : la visée tremble moins pendant une alerte | Tamsin Velez (*Ceux d'Echo-8*) |
| `origin-02` | Ancien garde de colonie | **Calmer les civils** : une escorte civile panique moins vite | Adèle Sarrazin (*La doyenne*) |
| `origin-03` | Adjoint des Marshals coloniaux | **Procès-verbal** : une pièce du dossier se lit avec un indice supplémentaire | Mara Vega (*La ligne de commandement*) |
| `origin-04` | Docker de frontière | **Cariste** : manœuvre plus rapide du chargeur (`secure the power loader`) | Tomas Wren (*Ce que le quai a vu*) |
| `origin-05` | Technicien de terraformation | **Processeur** : réparation plus rapide des systèmes atmosphériques | Jun Park (C2 *L'air du port*) |
| `origin-06` | Enfant d'une colonie évacuée | **Réflexe d'abri** : repère les abris et sas sûrs sur la carte | Asha Mbaye (*Les noms de Port-Méridien*) |
| `origin-07` | Mineur sous contrat endetté | **Galeries** : se déplace plus vite dans les conduits et galeries étroites | Grue (*Le prix de Grue*) |
| `origin-08` | Infirmier de vaisseau-hôpital | **Triage** : soins sur un coéquipier plus rapides | Noor Okafor (*Le registre des pertes*) |
| `origin-09` | Pilote de navette suspendu | **Approche** : fenêtre d'extraction un peu plus longue | Maksim Orlov (*Fenêtre de tir*) |
| `origin-10` | Ancien agent de sécurité de la compagnie | **Codes périmés** : une porte de la compagnie par mission s'ouvre sans piratage | Halloran (message de l'Acte II), BISHOP-9 |
| `origin-11` | Transfuge de l'UPP | **Matériel de l'Union** : utilise sans pénalité les armes et balises UPP | Rook (*La balise rouge*) |
| `origin-12` | Récupérateur de frontière | **Fouille** : un peu plus de matériaux par caisse ouverte | Grue (*Le pacte de l'anneau*) |
| `origin-13` | Opérateur de relais | **Triangulation** : le détecteur de mouvement filtre mieux les échos | Rook (*Six heures*) |
| `origin-14` | Condamnation commuée en engagement | **Débrouille** : crochetage des casiers et armoires sans outil | Sanaa Doyle (*Les sentinelles*) |
| `origin-15` | Mécanicien de blindés | **Atelier** : réparation de terrain du M577 et des tourelles | Cal Mercer (*Remettre le M577 en état*) |
| `origin-16` | Biologiste de terrain | **Échantillons** : un prélèvement par mission sans contamination | Inez Harlow (*Le sceau*) |
| `origin-17` | Enfant de Marines | **Discipline** : ordres d'escouade exécutés plus vite | Tamsin Velez, Pablo Reyes |
| `origin-18` | Garde de convoi | **Formation de convoi** : l'escorte de véhicules subit moins de dégâts | Cal Mercer (Acte III) |
| `origin-19` | Survivant d'un abordage | **Combat rapproché** : dégâts accrus dans les couloirs étroits | Pablo Reyes (*La charge de trop*) |
| `origin-20` | Dossier caviardé | **Aucune** ; fil secondaire propre (§2.4.3) | DAVID-8R, CASSIUS |

Les valeurs chiffrées des capacités (pourcentages, durées) sont à fixer au réglage, avec les mêmes scènes avant/après (`AGENTS.md`).

#### 2.4.2 Fiches

**`origin-01` · Survivant d'une section anéantie**
Engagé à 19 ans, affecté à une section de garnison sur un poste de frontière. Une nuit, le poste cesse d'émettre ; Echo-9 est retrouvé seul, deux jours plus tard, dans un sas de maintenance, sans souvenir clair. Le rapport officiel parle de « contamination industrielle » et le classe. Il a demandé une réaffectation sur un vaisseau, n'importe lequel. *Ancrage : unité perdue, rapport étouffé par la compagnie ; rien n'y nomme une créature.*
- Réveil — FR : « Echo-8 perdue. Ça me rappelle quelque chose. » · EN : "Echo-8 lost. That rings a bell."
- Réaction (Acte IV, cocons) — FR : « C'est ça qu'ils appelaient contamination. » · EN : "So that's what they called contamination."
- Retour — FR : « Cette fois, quelqu'un écrit le vrai rapport. » · EN : "This time, someone writes the real report."

**`origin-02` · Ancien garde de colonie**
Six ans de sécurité civile dans une colonie agricole : bagarres de cantine, fuites de serre, enfants perdus dans les champs. Pas d'arme lourde, beaucoup de patience. La colonie a fermé faute de rendement ; il s'est engagé pour ne pas monter dans le cargo de rapatriement. *Ancrage : colonies sous charte, sécurité civile sous-équipée.*
- Réveil — FR : « Des civils à protéger ? Alors je sais par où commencer. » · EN : "Civilians to protect? Then I know where to start."
- Réaction (`colony-a-abri`) — FR : « On ne court pas. On marche vite, et on se tient la main. » · EN : "Nobody runs. We walk fast, and we hold hands."
- Retour — FR : « Une colonie, ça tient par ses gens. Pas par ses murs. » · EN : "A colony holds because of its people. Not its walls."

**`origin-03` · Adjoint des Marshals coloniaux**
Adjoint auxiliaire d'un Marshal colonial pendant trois ans : constats, saisies, témoins qui changent de version. Il a vu des enquêtes fermées par un simple courrier de la compagnie. Il a rejoint les Marines par un programme de transfert. *Ancrage : Colonial Marshals, institution gardée au §1.6.*
- Réveil — FR : « Qui a écrit l'ordre de mission ? Je voudrais le lire. » · EN : "Who wrote the mission order? I'd like to read it."
- Réaction (Acte I, PDA contre courriel) — FR : « Deux versions. Une seule a l'heure exacte. » · EN : "Two versions. Only one has the exact time."
- Retour — FR : « Un dossier ne sauve personne. Mais il empêche de recommencer. » · EN : "A file saves no one. But it stops it happening again."

**`origin-04` · Docker de frontière**
Dix ans sur les quais d'un port de transit : chargeurs, conteneurs scellés, bons de fret signés sans regarder. Un jour, un conteneur est arrivé froid alors qu'il devait être chaud ; il a posé la question, et perdu sa place. *Ancrage : chargeur, fret scellé, priorité de fret (§5.2).*
- Réveil — FR : « Un chargeur à bord ? Bien. On en aura besoin. » · EN : "A loader aboard? Good. We'll need one."
- Réaction (Acte I, conteneur givré) — FR : « Givré de l'intérieur, froid coupé. Ce n'est pas de la roche. » · EN : "Frosted inside, cooling off. That's not rock."
- Retour — FR : « Je regarderai toujours ce qu'il y a dans les caisses. » · EN : "I'll always check what's in the crates."

**`origin-05` · Technicien de terraformation**
Technicien de maintenance sur un processeur atmosphérique : quarts de nuit, filtres, alarmes de pression. Il connaît l'odeur d'un processeur qui chauffe trop. Son contrat a pris fin quand l'usine est passée en automatique. *Ancrage : processeurs atmosphériques, colonies en terraformation.*
- Réveil — FR : « Quelle est l'atmosphère de Cocyte ? Respirable, ou presque ? » · EN : "What's Cocyte's atmosphere like? Breathable, or nearly?"
- Réaction (C2, nid dans la chaleur) — FR : « Ils aiment la chaleur. Le processeur en produit plus que tout le port. » · EN : "They like heat. The processor makes more than the whole port."
- Retour — FR : « Le processeur tourne. Ils respireront demain aussi. » · EN : "The processor's running. They'll breathe tomorrow too."

**`origin-06` · Enfant d'une colonie évacuée**
Sa colonie natale a été évacuée quand il avait neuf ans, « pour raison sanitaire ». Il a grandi dans un camp de transit, puis dans des foyers. Il ne sait pas ce qui est arrivé à ceux qui sont restés. *Ancrage : évacuation de colonie, information retenue.*
- Réveil — FR : « Une colonie en quarantaine ? Combien de personnes encore dedans ? » · EN : "A quarantined colony? How many people still inside?"
- Réaction (CIN-61, l'appel des colons) — FR : « Lisez tous les noms. Même ceux qui ne répondent pas. » · EN : "Read every name. Even the ones who don't answer."
- Retour — FR : « Personne n'est venu pour nous. Moi, je suis venu. » · EN : "No one came for us. I came."

**`origin-07` · Mineur sous contrat endetté**
Né dans une colonie minière, endetté auprès de la compagnie avant même son premier quart. L'engagement chez les Marines efface une partie de la dette. Il connaît les galeries étroites, l'eau qui monte, le bruit d'une poutre qui cède. *Ancrage : contrats de la compagnie, colonies minières.*
- Réveil — FR : « Combien de temps de service avant que la dette soit effacée ? » · EN : "How long until the debt's cleared?"
- Réaction (Acte IV, galerie basse) — FR : « Une galerie, ça parle avant de tomber. Écoutez. » · EN : "A tunnel talks before it falls. Listen."
- Retour — FR : « Ma dette est payée. La leur aussi, j'espère. » · EN : "My debt's paid. Theirs too, I hope."

**`origin-08` · Infirmier de vaisseau-hôpital**
Quatre ans sur un vaisseau-hôpital civil des routes de frontière : brûlures, décompressions, maladies de colonie. Il a vu un patient se plaindre de la poitrine sans qu'aucun examen ne montre rien ; le vaisseau a ensuite été mis en quarantaine, et il a été réaffecté. *Ancrage : vaisseau-hôpital (lien avec* Clémence*, §17), symptômes non diagnostiqués.*
- Réveil — FR : « Le blessé du quai, je peux le voir avant qu'on parte ? » · EN : "The injured man from the dock — can I see him before we go?"
- Réaction (C3, contrôle biologique) — FR : « Douleur à la poitrine, pas de fièvre. Isolez-le. Maintenant. » · EN : "Chest pain, no fever. Isolate him. Now."
- Retour — FR : « Noor tient le registre. Je tiens la liste de ceux qu'on a sauvés. » · EN : "Noor keeps the register. I keep the list of the ones we saved."

**`origin-09` · Pilote de navette suspendu**
Pilote de navette de transfert, suspendu pour avoir posé son appareil hors zone afin de récupérer des ouvriers. La compagnie a payé l'amende et l'a licencié. Il s'est engagé pour voler encore ; on l'a mis dans l'infanterie. *Ancrage : dropship, ordre contre vies.*
- Réveil — FR : « Qui pilote le dropship ? Je voudrais le rencontrer. » · EN : "Who flies the dropship? I'd like to meet them."
- Réaction (Acte V, fenêtre d'Orlov) — FR : « Trente secondes de plus. Il peut les tenir. » · EN : "Thirty more seconds. He can hold them."
- Retour — FR : « Un jour, je reprendrai les commandes. Pas aujourd'hui. » · EN : "Someday I'll fly again. Not today."

**`origin-10` · Ancien agent de sécurité de la compagnie**
Cinq ans dans la sécurité d'un complexe de recherche de la compagnie. Il a escorté des caisses sans manifeste et signé des registres d'accès qu'on lui a ensuite demandé de détruire. Il a démissionné ; l'engagement est arrivé peu après, avec une recommandation qu'il n'a pas demandée. *Ancrage : sécurité de la compagnie, dossiers détruits. Ce n'est pas un agent infiltré : la campagne ne le transforme pas en traître.*
- Réveil — FR : « Le Tantalus est sous contrat avec qui, exactement ? » · EN : "Who exactly holds the Tantalus contract?"
- Réaction (message d'Halloran, Acte II) — FR : « Je connais ce ton. C'est celui d'un ordre qu'on ne signera pas. » · EN : "I know that tone. It's an order no one will sign."
- Retour — FR : « J'ai ouvert les caisses, cette fois. » · EN : "This time, I opened the crates."

**`origin-11` · Transfuge de l'UPP**
Ancien soldat de l'Union des Peuples Progressistes, passé du côté de l'Alliance après la perte de son unité, abandonnée par son commandement. Accent conservé, loyauté vérifiée trois fois. Certains marines ne lui parlent pas. *Ancrage : rivalité UPP (§1.6, balise UPP de* La balise rouge*).*
- Réveil — FR : « Mon dossier est arrivé avant moi, je suppose. » · EN : "My file got here before me, I suppose."
- Réaction (`station-a-sonde`) — FR : « Cette balise appelle un poste qui n'existe plus. Je peux la faire taire. » · EN : "That beacon calls a post that's gone. I can silence it."
- Retour — FR : « Deux drapeaux. Les mêmes bureaux. » · EN : "Two flags. Same offices."

**`origin-12` · Récupérateur de frontière**
Équipier d'un remorqueur de récupération : épaves, cargos à la dérive, pièces revendues sans poser de question. L'équipage a abordé une épave de trop ; il est le seul à être ressorti. Il s'est engagé pour avoir des armes la prochaine fois. *Ancrage : récupérateurs (Crucible, Grue), épaves.*
- Réveil — FR : « On fouille avant de tirer, ou après ? » · EN : "Do we search before we shoot, or after?"
- Réaction (`station-a-grue`) — FR : « Grue ne ment pas. Elle ne dit juste pas tout. » · EN : "Grue doesn't lie. She just doesn't tell it all."
- Retour — FR : « Ce qu'on récupère ici, on le garde pour eux. » · EN : "What we salvage here, we keep for them."

**`origin-13` · Opérateur de relais**
Opérateur d'une station de relais isolée : files de messages, priorités de fret, alertes météo. Il a déjà vu un message de détresse rester en attente derrière une priorité commerciale, et n'a rien dit. *Ancrage : réseau de relais, cœur de l'Acte II.*
- Réveil — FR : « Le relais de Cocyte, il émet encore ? » · EN : "Is Cocyte's relay still transmitting?"
- Réaction (CIN-20, « Treize minutes ») — FR : « J'aurais pu être celui qui a appuyé sur « en attente ». » · EN : "I could have been the one who pressed 'hold'."
- Retour — FR : « Plus aucun message ne reste en attente. Pas sur ma ligne. » · EN : "No message stays on hold. Not on my line."

**`origin-14` · Condamnation commuée en engagement**
Condamné pour vol de matériel sur un chantier spatial, il a accepté un engagement en échange d'une peine réduite. Il n'en parle pas. Il ouvre les casiers plus vite que ses propriétaires. *Ancrage : programmes d'engagement contre remise de peine, sans référence à un lieu de la franchise.*
- Réveil — FR : « Mon dossier dit beaucoup de choses. Lisez la dernière ligne. » · EN : "My file says a lot. Read the last line."
- Réaction (`ship-armory`, inventaire contradictoire) — FR : « Quelqu'un a pris sur le registre, pas dans les râteliers. » · EN : "Someone stole from the ledger, not the racks."
- Retour — FR : « Ma peine est finie. Je reste quand même. » · EN : "My sentence is over. I'm staying anyway."

**`origin-15` · Mécanicien de blindés**
Mécanicien de parc dans un dépôt de véhicules de l'armée coloniale : chenilles, tourelles, moteurs qui gèlent. Il connaît les blindés comme le M577 par leurs pannes. *Ancrage : APC, tourelles sentinelles.*
- Réveil — FR : « Il y a un M577 à bord ? Dans quel état ? » · EN : "There's an M577 aboard? What shape is it in?"
- Réaction (Acte III, manifeste du M577) — FR : « Trois conteneurs, c'est six places et une suspension cassée. » · EN : "Three containers is six seats and a broken suspension."
- Retour — FR : « Il a tenu. On lui doit au moins une révision complète. » · EN : "It held. We owe it a full service at least."

**`origin-16` · Biologiste de terrain**
Biologiste sur des mondes sans vie complexe : lichens, bactéries, carottes de glace. Il s'est engagé quand son programme a été racheté et fermé. Il n'a jamais vu d'organisme comme ceux de Cocyte, et ne prétend pas savoir ce qu'ils sont. *Ancrage : la science de la franchise découvre, elle ne sait pas d'avance.*
- Réveil — FR : « On a des kits de prélèvement ? Stériles ? » · EN : "Do we have sampling kits? Sterile ones?"
- Réaction (Acte I, berceau ouvert) — FR : « Ces fixations retiennent quelque chose de vivant. Je ne sais pas quoi. » · EN : "Those restraints hold something alive. I don't know what."
- Retour — FR : « Inez a raison. On ne conclut pas. On rapporte. » · EN : "Inez is right. We don't conclude. We report."

**`origin-17` · Enfant de Marines**
Fils ou fille de deux Marines coloniaux, élevé sur des bases et dans des vaisseaux de transport. Il connaît les règles avant de les apprendre ; on attend de lui qu'il les applique mieux que les autres. *Ancrage : tradition des Marines coloniaux.*
- Réveil — FR : « Relève Echo-9, au rapport. Quels sont les ordres ? » · EN : "Echo-9 relief, reporting. What are the orders?"
- Réaction (Acte V, conseil de guerre) — FR : « Les ordres disent une chose. Les gens, une autre. Je suis les gens. » · EN : "The orders say one thing. The people say another. I'm with the people."
- Retour — FR : « Ma mère aurait fait pareil. Je crois. » · EN : "My mother would've done the same. I think."

**`origin-18` · Garde de convoi**
Garde armé sur des convois terrestres entre colonies et sites miniers : routes longues, embuscades rares, ennui permanent. Il sait où placer les véhicules, et quand ne pas s'arrêter. *Ancrage : convoi, APC (Actes III et V).*
- Réveil — FR : « Il y a des routes sur Cocyte, ou seulement de la boue ? » · EN : "Are there roads on Cocyte, or just mud?"
- Réaction (Acte V, pont qui cède) — FR : « On ne laisse pas une remorque. On laisse du poids. Videz-la. » · EN : "We don't leave a trailer. We leave weight. Empty it."
- Retour — FR : « Tout le convoi est arrivé. C'est rare. » · EN : "The whole convoy made it. That's rare."

**`origin-19` · Survivant d'un abordage**
Membre d'équipage d'un cargo abordé par des pillards dans une zone sans patrouille. Combat au couteau dans les coursives ; il a survécu caché dans un conduit de ventilation pendant deux jours. Il s'est engagé pour ne plus jamais se cacher. *Ancrage : couloirs étroits, conduits ; la menace était humaine.*
- Réveil — FR : « Les conduits du Tantalus sont assez grands pour quelqu'un ? » · EN : "Are the Tantalus vents big enough for a person?"
- Réaction (Interlude, conduits) — FR : « J'ai passé deux jours dans un conduit. Je sais où il ne faut pas être. » · EN : "I spent two days in a vent. I know where not to be."
- Retour — FR : « Je ne me suis pas caché, cette fois. » · EN : "I didn't hide this time."

**`origin-20` · Dossier caviardé**
Le dossier d'Echo-9 est presque entièrement noirci. DAVID-8R ne peut en lire que le matricule et la date d'engagement. Le joueur ne choisit pas de passé : il le découvre (§2.4.3). *Ancrage : dossiers de la compagnie, synthétiques qui citent leurs restrictions.*
- Réveil — FR : « Mon dossier ? Qu'est-ce qu'il dit ? » DAVID-8R : « Très peu de choses lisibles. » · EN : "My file? What does it say?" DAVID-8R: "Very little that's legible."
- Réaction (S2, CASSIUS) — FR : CASSIUS : « Votre matricule figure dans une liste de transfert. Je n'ai pas l'autorisation de la lire. » · EN: CASSIUS: "Your service number is on a transfer list. I'm not cleared to read it."
- Retour — FR : « Je ne sais toujours pas d'où je viens. Je sais où je vais. » · EN : "I still don't know where I'm from. I know where I'm going."

#### 2.4.3 Fil secondaire du dossier caviardé — [PROPOSÉ]

Réservé à `origin-20`. Quatre fragments, un par lieu, sans combat propre :

| Fragment | Où | Ce qu'il dit |
| --- | --- | --- |
| 1 | DAVID-8R, quête *Mémoire récupérée* | Le matricule d'Echo-9 a été réaffecté deux fois avant le Tantalus. |
| 2 | CASSIUS, S2 | Le matricule figure sur une liste de transfert de la station Asphodèle, non exécutée. |
| 3 | Salle des relais d'Asphodèle | Un message retenu, adressé à Echo-9 par un expéditeur inconnu, jamais livré. |
| 4 | Épilogue | Le joueur choisit l'une de quatre origines (`origin-01`, `-06`, `-10` ou `-13`) comme passé retrouvé, ou garde le dossier fermé. |

**Règle :** le fil ne révèle aucun secret qui changerait l'histoire principale ; Echo-9 n'est pas un synthétique ni un agent de la compagnie. Le passé retrouvé ne débloque que les répliques *Retour* de l'origine choisie.

#### 2.4.4 Production

| Élément | Nombre | Remarque |
| --- | --- | --- |
| Fiches d'origine (FR + EN) | 20 | Texte ci-dessus |
| Répliques | 60 + 4 fragments | Toutes en FR et EN |
| Portraits d'archive (photo de dossier) | 20 | Génération par IA (§45.1) ; ils montrent un cadre de dossier, pas le visage du joueur |
| Scènes de reconnaissance | 20 | Une réplique de PNJ chacune, dans une scène existante |
| Capacités | 19 | À régler et tester ; `origin-20` n'en a pas |

---

## 3. Chronologie

| Ordre | Enquête (principale) | Colonie (Port-Méridien) | Station (Asphodèle) |
| --- | --- | --- | --- |
| 1 | **Prologue** — Relève Echo-9 | **Intro** — Le quai des vivants | (Echo-8 perdu, hors champ) |
| 2 | **Acte I** — La cargaison fantôme | C1 — Tenir le port | — |
| 3 | **Acte II** — Le dernier relais | C2 — L'air du port | **Intro** — Six heures de silence |
| 4 | **Acte III** — Corridor de feu | C3 — Le convoi des rescapés | S1 — L'arrimage |
| 5 | **Interlude** — Quarantaine à bord | Reconstruction, phase 2 | S2 — La voix de CASSIUS |
| 6 | **Acte IV** — Cocon noir | C4 — Le culte du port | S3 — Les ponts scellés |
| 7 | **Acte V** — Non viable | C5 — La nuit des murs | S4 — Le hub Asphodèle |
| 8 | **Épilogue** | État final de la colonie | Second hub actif |

---

## 4. Prologue — « Relève Echo-9 »

**But :** apprendre les commandes, comprendre pourquoi le Tantalus est là, rencontrer l'équipage et poser la question centrale (le fret contre les vivants) avant le premier contact.

### CIN-00 · Ouverture — [EXISTANT] (V188, `story-cinematics-v188.js`)

60 à 75 s, passable. Jouée à chaque nouvelle partie avant le créateur (65 s). Plans dessinés en primitives Canvas ; l'espace, la planète et le Tantalus reprennent les couches existantes de l'écran titre.

| Plan | Image | Son / texte |
| --- | --- | --- |
| 1 | Noir. Une ligne de télémétrie verte. | Bip de relais régulier. |
| 2 | Relais QZ-18 sous la pluie de Cocyte. | `COCYTE · RELAIS QZ-18 · 18:41` |
| 3 | Pupitre : un brouillon de détresse s'écrit, puis passe en `EN ATTENTE`. | Le bip ralentit. |
| 4 | Un badge sur le pupitre, nom illisible. Une main hors champ le prend. | Aucune voix. |
| 5 | Le message part : `18:54`. | `TREIZE MINUTES` |
| 6 | Orbite. La station Asphodèle, feux éteints. Un seul voyant rouge : `QZ · QUARANTAINE`. | Silence. |
| 7 | L'USS *Tantalus* entre en orbite, lumières de veille. | Thème principal (compositions originales, `assets/audio/`). |
| 8 | `ALIENS: TANTALUS FRONTIER` | — |

### P-1 · Intro — Réveil en cryostase — [EXISTANT]

Le poste de cryostase attend la confirmation ; DAVID-8R accueille la Relève Echo-9. Création du personnage. Tamsin Velez rappelle la règle : avant une sortie, on identifie l'objectif et la voie de retour.

**Mise en scène en jeu [EXISTANT] (V188) · [PROPOSÉ]** — avant la reprise du contrôle, dans la baie cryo réelle : l'image passe du noir à un flou froid puis se précise. Le terminal affiche `MU/TH/UR · RELÈVE ECHO-9 · CAPSULE 03 · RÉVEIL D'URGENCE`. Le sous-titre sonore dit « [La capsule siffle. Le givre fond sur la verrière.] ». Le journal de bord : « Relève Echo-9 sortie d'hypersommeil. Fonctions vitales stables. Confirmez votre réveil au poste de cryostase. »

**Ajout [EXISTANT] (V188)** — DAVID-8R, pendant le réveil : « Vous remplacez l'équipe Echo-8. Elle a abordé la station Asphodèle il y a trente et une heures. Le contact a été perdu à la sixième. Je n'ai pas d'autre information. » **CIN-01 « Le casier vide »** (20 s) : le casier `ECHO-8`, vidé et scellé. Elle est jouée juste après la confirmation du réveil, une seule fois par partie.

*Ancrage Alien : réveil d'hypersommeil, relève d'une équipe perdue, synthétique de bord.*

### P-2 · Intro — Qualification au pas de tir — [EXISTANT]

`hub-opening-exercise-v89.js` : échelle, pas de tir, cibles, rétablissement de la liaison prioritaire.

**[EXISTANT] (V188, séquence `cin-p2`)** La liaison prioritaire, rétablie à la fin de l'exercice, laisse passer un paquet de messages de Port-Méridien vieux de plusieurs jours, d'un coup. Le dernier date de quatre heures. Mara Vega coupe l'exercice.

**Mise en scène en jeu [EXISTANT] (V188) · [PROPOSÉ]** — quand le signal prioritaire interrompt la qualification, une alerte ambre passe sur le pas de tir.

> **Rook** (radio) — Velez, un signal prioritaire force la liaison. Il demande la console du pas de tir.
>
> **Tamsin Velez** — Echo-9, arme au repos. Rejoignez la console.

*Ancrage Alien : communications retardées, colonie isolée.*

### CIN-02 · Le briefing — [EXISTANT] (V188)

Jouée une fois, avant le premier embarquement vers Port-Méridien (42 s), sur une carte holographique de Cocyte et d'Asphodèle dessinée en primitives.

Salle de briefing. Mara Vega projette Cocyte et la station.

> **Mara Vega** — L'Administration nous a réquisitionnés : code de quarantaine rouge, émis par Asphodèle, plus de contact avec la station depuis trois semaines. Nos ordres : rétablir le contact, évaluer, appliquer la quarantaine, évacuer si nécessaire.
>
> **Mara Vega** — La compagnie a ajouté une consigne : préserver le matériel sous scellés en transit. Elle est arrivée avec quatre jours de retard. Par leur propre réseau.
>
> **Inez Harlow** — Personne ne déclenche une quarantaine rouge pour une panne de relais.
>
> **Tamsin Velez** — Echo-8 est monté voir. On n'a plus de nouvelles. Port-Méridien appelle encore. On commence par ceux qui répondent.

*Ancrage Alien : réquisition des Marines, consigne de la compagnie, quarantaine.*

### CIN-03 · Descente sur Port-Méridien — [EXISTANT] (V188) · [PROPOSÉ]

Jouée une fois, entre CIN-02 et le débarquement (33 s). Le dropship d'Orlov descend sous la pluie ; la soute est éclairée en rouge et les hublots ruissellent.

> **Maksim Orlov** — Turbulences jusqu'à deux mille mètres. Le port n'émet plus de balise : je pose à vue.
>
> **Tamsin Velez** — Quand la rampe touche, Echo-9 sort en premier. Les vivants d'abord. Le matériel ensuite.

Dernier plan : les lumières du port sous la pluie, le processeur atmosphérique qui fume, les balises rouges de l'aire de pose. `PORT-MÉRIDIEN · QUAI SUD`.

*Ancrage Alien : descente en dropship, colonie sans balise, Marines qui passent en premier.*

### P-3 · Intro — Le quai des vivants (Port-Méridien) — [EXISTANT]

`port-meridien-v90.js` (reçu existant `port-meridien:quai-des-vivants:v90`) : porter un lot au triage, assister un blessé, réalimenter le sas, rassembler trois habitants et les guider vers le sas éclairé.

**[EXISTANT] (V188, séquences `cin-p3-wren` à l'arrivée et `cin-p3-ferro` après le triage)** C'est aussi l'intro du front colonie (§6). Premier choix « vivants ou matériel » : lot médical ou batterie de sas. Tomas Wren, en passant : « Les conteneurs scellés partent avant nous depuis trois semaines. » Lucia Ferro montre un blessé dont la poitrine est bandée : « Il est tombé malade après une nuit au quai nord. Il ne se souvient pas de la nuit. » Le joueur ne voit rien de plus. Noor Okafor, à la radio : « Ramenez-le en quarantaine. Pas au triage. »

**Mise en scène en jeu [EXISTANT] (V188) · [PROPOSÉ]** — à la descente de la rampe, sous la pluie et avant la réplique de Wren : « [Les vérins de la rampe. La pluie sur la tôle.] »

> **Tamsin Velez** (radio) — Rampe au sol. Echo-9, le quai est à vous. Trouvez qui tient encore ce port.

Au constat :

> **Rook** (radio) — La balise automatique du port annonce toujours « aucun survivant ». Elle se trompe de trois.
>
> **Tamsin Velez** (radio) — Notez-le. Tout ce qui ment ici finira dans le rapport.

*Ancrage Alien : premier signe du cycle biologique (hôte qui ne se souvient pas), évacuation de colons.*

---

## 5. Enquête — campagne principale

### 5.1 Acte I — « La cargaison fantôme » (QZ-17)

**Ordre conseillé (décision du 2026-11-23)** : après le prologue, l'objectif et l'étoile ★ de la table tactique recommandent l'Acte I (QZ-17), puis l'Acte II (QZ-18). QZ-18 n'est pas verrouillé : une sauvegarde qui l'a joué d'abord reste valide (`deriveStoryCampaignV188`).

**Statut :** **[PARTIEL]** — `special-narrative-qz17`, `narrative-collectables-v68.js`. Intérieur vertical, 4 routes, 2204.

**Question :** qu'est-ce qui a été déplacé sur QZ-17, et pourquoi le bon officiel ment-il ?

**Preuves existantes :**

| Pièce | Ce qu'elle établit |
| --- | --- |
| PDA de quai — relève 02:00 | Transfert effectué malgré une validation de sécurité incomplète. |
| Courriel logistique — annulation QZ17-04 | Le responsable affirme que le transfert a été annulé avant tout déplacement. |
| Boîte noire FL-09 | Le chariot a bougé, avec une masse anormale, vers une destination absente du bon. |
| Sceau QZ17-04 — fragment intérieur | Sceau coupé après le monte-charge, avant l'arrivée annoncée en chambre froide. |

Preuve secondaire du code (`narrative-evidence-v132.js`) : *la colonie reçoit un conteneur scellé et une référence QZ17-04 ; le personnel n'identifie pas son transporteur.* **[PROPOSÉ]** Cette colonie est Port-Méridien : c'est par ce conteneur que l'infestation a atteint le port.

**Déroulé [PROPOSÉ] :**

1. **CIN-10 « Les quais déserts »** (30 s) — **[EXISTANT] (V188)**, à la prise de contrôle de QZ-17 : dropship d'Orlov, approche sous la pluie. Rook : « Quatre accès. Aucun ne répond. Le détecteur est calme. Trop calme. »
2. Exploration verticale, peu de combats, beaucoup de signes : un conteneur réfrigéré marqué « échantillons géologiques », du givre à l'intérieur alors que le froid est coupé, des traces d'acide dans un conduit.
3. **Choix existant** : *suivre la trace par la maintenance* ou *sécuriser la preuve en quarantaine*.
   - Maintenance → l'alcôve : un berceau de transport réfrigéré, ouvert de l'intérieur. Contact avec un parasite (facehugger, déjà au catalogue).
   - Quarantaine → le fragment de sceau revient intact ; Inez peut l'analyser (annexe *Le sceau*).
4. **CIN-11 « Ouvert de l'intérieur »** (25 s) — **[EXISTANT] (V188)**, au déverrouillage de la route de maintenance : sur la paroi du berceau, des fixations faites pour retenir quelque chose de vivant. Inez : « Ne concluez pas. Rapportez. »

**Retour** avec Inez — **[EXISTANT] (V188, séquence `cin-qz17-retour` à la table tactique)** : *qu'est-ce qui a bougé* (une charge vivante, réfrigérée, non déclarée), *qui ment* (le PDA et le courriel ne peuvent pas être vrais ensemble ; la boîte noire soutient le PDA), *que transportait-on* (**non établi** sans prélèvement).

*Ancrage Alien : cargaison biologique déguisée en fret, parasite, la compagnie qui ment par procédure.*

**Conséquence :** `story-qz17-route` = `maintenance` | `quarantine`.

### 5.2 Acte II — « Le dernier relais » (QZ-18)

**Statut :** **[EXISTANT]** — `campaign-story-v160.js`, `archive-relay-state-v122.js`.

Contenu existant : briefing « Le message arrivé trop tard » ; protocoles *Audit technique* (+2 recherche) ou *Prévention à bord* (+2 moral), versés seulement avec le dossier complet et un retour validé ; six pièces ; conclusion juste : *détresse retardée par la priorité de fret*. Brouillon saisi à 18:41, mis en attente à 18:42, libéré à 18:54 ; badge de I. Voss laissé à 18:39, utilisé à 18:43 sans image exploitable.

**Tissage [PROPOSÉ] :**

- Le message retenu (« Secours immédiat, personnel coincé au quai nord ») venait du quai nord de QZ-18, où partaient les navettes vers Port-Méridien. Les treize minutes ont laissé une navette partir avec un conteneur QZ17 et sans les blessés.
- Quatrième question optionnelle au retour, si l'Acte I est terminé : *« Quel fret avait la priorité ? »* — la série de scellés QZ17.
- Le profil « priorité cargaison » ne s'active pas au relais : il est **autorisé à distance par la station Asphodèle**. Rook identifie la signature. Cela débloque l'intro du front station.
- **CIN-20 « Treize minutes »** (40 s) — **[EXISTANT] (V188)**, avec la réponse de Halloran en dernier plan, au premier compte rendu de QZ-18 : Asha Mbaye lit le message libéré à 18:54. Les noms du personnel du quai nord défilent. Pas de musique.
- Mara Vega transmet le dossier par le seul canal disponible, le réseau QZ. Réponse différée de la Directrice Halloran : « Priorité cargaison maintenue, conformément à la clause d'acheminement. Toute ouverture de scellé engage la responsabilité de l'unité. »

*Ancrage Alien : la compagnie contrôle les communications ; la vie humaine passe après le contrat.*

### 5.3 Acte III — « Corridor de feu » (M577 → C-12)

**Mission A · Ramener le blindé — [EXISTANT]** (`campaign-convoy-story-v161.js`, chapitre `special-apc-convoy`) : ordre de convoyage, manifeste du M577, trois voies, barrages, tourelle, Crushers et Reine en barrage final (`apc-convoy-state-v121.js`), bilan au retour.

**Mission B · Une sortie plutôt qu'une victoire (C-12) — [EXISTANT]** (`campaign-lethe-story-v163.js`) : relais, quatre secondes d'avertissement, quarante-cinq secondes de rétablissement, sas à droite.

**Tissage [PROPOSÉ] :**

- **[EXISTANT] (V188)** **Le manifeste du M577 est le choix moral de l'acte.** Une boîte de dialogue s'ouvre avant le départ du convoi ; le choix est enregistré dans `storyCampaignV188.m577Manifest`. La consigne de la compagnie exige de ramener trois conteneurs scellés du complexe ; Asha demande des places pour les ouvriers retranchés à C-12. Chaque conteneur retire deux places.
- **[EXISTANT] (V188)** Pendant les 45 secondes de C-12, si un conteneur est à bord, il **frappe de l'intérieur** (son seul, son original `container-knock`). Inez : « Notez l'heure. »
- **CIN-31 « Le sas refermé »** — **[EXISTANT] (V188)**, au premier passage à la table tactique après C-12, dessinée d'après le manifeste : les rescapés descendent à Port-Méridien, ou les conteneurs partent sous scellés vers le Tantalus, sur ordre. Écran de quarantaine du Tantalus : `CONTRÔLE BIOLOGIQUE · 1 ANOMALIE`.

*Ancrage Alien : APC, horde, Reine, choix entre fret et vivants.*

**Conséquence :** `story-m577-manifest` = colons (0-6) et conteneurs (0-3). Les colons ramenés rejoignent la population de Port-Méridien. **[EXISTANT] (V188)** : la population du monde de C-12 est augmentée une seule fois. Les conteneurs restent consignés pour l'Interlude (§5.4), qui n'est pas encore jouable.

### 5.4 Interlude — « Quarantaine » (à bord du Tantalus) — [PARTIEL] V188

**Pont 2 (décision du 2026-11-23)** : les menaces de la crise apparaissent autour de la salle de quarantaine du pont 2 et y attendent ; le joueur doit s'y rendre. Sur un autre pont, le relevé du hub les nomme (« … AU PONT 2 »). Les autres crises du hub ne changent pas.

**Raccordé (V188)** : après CIN-31, CIN-40 se joue, puis une crise xénomorphe forcée s'ouvre dans la salle de quarantaine du pont 2. Elle utilise le système de crise du hub existant. Une fois la crise résolue dans le niveau, le choix détruire ou capturer s'affiche ; il ne peut pas être esquivé et revient s'il a été interrompu. CIN-41 suit, et la loyauté de BISHOP-9 baisse de 20, soit un niveau de confiance. Un objectif dédié s'affiche au hub. Pendant la crise, tout l'équipage suit la routine `alert`, qui prend fin quand la crise est résolue. Jun Park est coincé dans le conduit du support-vie (pont 3) : le joueur doit l'y rejoindre par le réseau de conduits. Le choix ne s'ouvre qu'une fois la créature neutralisée et Jun ramené, dans n'importe quel ordre (§56.9). **Pas encore fait** : Jun Park visible dans le conduit et blessé à l'infirmerie (pose à créer).

Le projet référence déjà une « Ruche expérimentale du Tantalus » (`hive-missions-v131.js`) et des crises à bord par route de salles (`world-crisis-core.js`, type `xenomorph`).

1. **Déclencheur** : un conteneur ramené s'est ouvert en quarantaine. Sans conteneur, le blessé du prologue, gardé en observation, n'était pas seulement malade.
2. **CIN-40 « Jun Park ne répond plus »** : alerte au support-vie ; les PNJ passent en routine `alert` (`NPC_ROUTINE_PHASES_V62`).
3. Traque dans les ponts 2 et 3 avec les systèmes de survie **[EXISTANT]** comme système (soudure de portes, routage d'énergie, caméras, acide persistant).
4. Sauver Jun Park dans les conduits.
5. **Choix** : détruire la créature, ou la capturer pour Inez et BISHOP-9.
6. **CIN-41 « Ce que BISHOP-9 savait »** : les journaux de quarantaine montrent que BISHOP-9 a ralenti la procédure d'incinération, conformément à sa directive de préservation. Il ne l'a pas cachée ; personne ne l'a interrogé. Sa confiance baisse d'un niveau (`NPC_TRUST_LEVELS_V62`).

*Ancrage Alien : créature à bord, conduits, synthétique dont la directive passe avant l'équipage.*

**Conséquence :** `story-quarantine-outcome` = `destroyed` | `captured`.

### 5.5 Acte IV — « Cocon noir »

**Statut :** **[EXISTANT]** pour le chapitre jouable `special-black-cocoon` (`black-cocoon-state-v121.js`, `campaign-lethe-story-v163.js`) ; promesse globale **[PARTIEL]** dans `special-operations-v131.js`. L'opérateur reprend conscience dans la résine, sans témoin de sa capture ; sac, relais, sortie industrielle ou circuit de refroidissement, transport Kappa, 90 secondes, contrôle biologique à bord.

**Tissage [PROPOSÉ] :**

- **CIN-50 « Les dernières images »** (35 s) — **[EXISTANT] (V188)**, au réveil dans le cocon : caméra casque dégradée. Echo-9 suit la destination absente du bon de QZ-17 jusqu'au **dépôt**. Silhouette au plafond. Coupure. La capture n'est pas jouée : elle reste « sans témoin exploitable », comme dans le code.
- Dans la galerie basse : des **berceaux réfrigérés de la série QZ17**, vides, et des cocons humains (le libellé « COCON HUMAIN » existe déjà dans `hive-missions-v131.js`) portant des badges de Port-Méridien et de QZ-18. **Révélation :** le dépôt n'expédiait pas des organismes, il les **élevait**. Les conteneurs amenaient des œufs ; les disparus de la colonie servaient d'hôtes. La priorité de fret gardait ces départs et ces disparitions hors des registres.
- Un enregistreur fixé aux berceaux porte la signature de la station Asphodèle : les ordres de livraison venaient de là (lien avec S2-S3).
- **CIN-51 « Contrôle biologique »** — **[EXISTANT] (V188)**, au premier passage à la table tactique après l'Acte IV : scanner, Noor Okafor attend. `NÉGATIF`. « Bon retour. Cette fois, je l'écris. »

*Ancrage Alien : cocons, hôtes humains, ruche nourrie par la compagnie, contrôle biologique.*

### 5.6 Acte V — « Non viable »

**Statut :** **[PARTIEL] V188** (spec 006, 2026-11-15) — conseil de guerre, choix final, trois missions finales, face-à-face au quai, CIN-60, CIN-61 et les trois fins sont jouables ; détail et valeurs au §5.11. **[PARTIEL] V188 (2026-11-21)** : *Dernier départ* est une course APC dédiée (M577, remorques physiques, largage, pont jouable qui s'effondre) et *La Reine du dépôt* une poursuite de la Reine (§5.11, « Course du convoi ») ; la Reine reste un **substitut Canvas** en attente de son art. Le registre `special-operations-v131.js` rattache toujours `last-course-tantalus` au chapitre de l'Acte III.

**Situation [PROPOSÉ] :** Halloran déclare Port-Méridien **non viable** au titre de la charte, avec effet à l'arrivée d'une équipe de récupération de la compagnie. L'équipe (commandos Weyland-Yutani, déjà au catalogue) vient « sécuriser les actifs » du dépôt et de la colonie. Pendant ce temps, la ruche du dépôt, privée de livraisons, sort vers la surface et coupe la route du complexe au port.

1. **Conseil de guerre** au Tantalus : chaque membre dont la confiance est *solide* propose un avantage (tourelles de Sanaa, blindage de Cal, fenêtre d'Orlov, route de Leila).
2. **Choix final du joueur** (décision §45.2) : Echo-9 recommande une ligne à Mara Vega. Les options proposées dépendent des choix cumulés de la campagne (§5.7.1). Vega suit la recommandation si sa confiance envers l'escouade est au moins *operationnel* (`NPC_TRUST_LEVELS_V62`) ; sinon elle tranche elle-même selon le dossier : protéger la colonie avec 5 pièces ou plus, laisser la compagnie récupérer le dépôt en dessous.
3. **CIN-60 « Dernier départ »** : le M577 quitte le complexe sous la pluie avec les derniers ouvriers.
4. Course APC **[PARTIEL] V188** : `act5-last-run`, M577 et deux remorques attelées (§5.11).
5. Point médian **[PARTIEL] V188** : le pont cède sous les deux remorques ; lâcher celle du fret ou celle des colons en retard, en conduisant.
6. Poursuite de Reine **[PARTIEL] V188** : `act5-depot-queen`, la Reine du dépôt poursuit le convoi ; sprite à produire (substitut Canvas).
7. Arrivée aux murs de Port-Méridien : la course débouche sur C5 (§6.2).
8. Si la colonie est protégée : face-à-face au quai avec l'équipe de récupération. Le joueur ne gagne pas en tirant : il gagne si le dossier est assez solide pour que les commandos reçoivent l'ordre de se retirer (ou si l'ICC est saisie via Asphodèle, §7). **[PARTIEL] V188 (spec 010, 2026-11-22)** : avec *Tenir la colonie*, ce face-à-face est une audience sans tir avec la Directrice Halloran, par la liaison QZ du quai (§5.11, « Audience au quai »).

**CIN-61 « Les portes du port »** : Rook fait l'appel des colons arrivés. Le nombre affiché est la somme réelle des sauvetages de la campagne.

*Ancrage Alien : clause de charte, équipe de récupération de la compagnie, Reine, APC, dernière évacuation.*

### 5.7 Dossier, identité et fins

**Dossier `story-dossier` :**

| Pièce | Source |
| --- | --- |
| Contradiction PDA / courriel | Acte I |
| Fragment de sceau ou berceau ouvert | Acte I (selon la piste) |
| Priorité de fret à 18:43 autorisée depuis Asphodèle | Acte II |
| Directive de préservation de BISHOP-9 | Interlude |
| Berceaux et cocons du dépôt | Acte IV |
| Ordres de livraison archivés par CASSIUS | Station S2 |
| Témoignage de Tomas Wren | Colonie, annexe *Ce que le quai a vu* |

**[EXISTANT] V188 (`story-dossier-v188.js`)** : le dossier est calculé uniquement depuis l'état enregistré, et affiché au Commandement (« DOSSIER QZ17 · n/7 »). Pièces lisibles aujourd'hui :
- les deux pièces de l'Acte I : la contradiction PDA / courriel découverte, puis la piste choisie ;
- le verdict de QZ-18, avec la signature de Rook ;
- l'issue de l'Interlude ;
- l'Acte IV terminé.

Les pièces de CASSIUS (S2) et de Wren (annexe colonie) étaient affichées « pas encore jouables ». *Mise à jour V188 : CASSIUS est jouable depuis la spec 005 ; le témoignage de Wren s'obtient avec `colony-a-quai` depuis le lot colonie et équipage (§6.4) : les 7 pièces sont jouables.*

**Validé (2026-11-05) :** l'identité du signataire du badge est établie seulement si le joueur réunit 6 pièces sur 7. Le texte de retour rappelle alors ce qui reste non prouvé. Avec moins de pièces, elle reste « non établie ».

**Fins [PROPOSÉ] :**

| Fin | Condition | Résultat |
| --- | --- | --- |
| **« Le relais parle »** | Option *Transmettre* choisie (ou décision de Vega : protéger, avec dossier ≥ 5 pièces et Asphodèle reprise) | Le dossier part vers l'ICC et les Marshals coloniaux depuis Asphodèle. La clause de non-viabilité tombe si la colonie a atteint le palier *Autonome*. Port-Méridien garde sa charte. |
| **« Le fret d'abord »** | Option *Céder le dépôt* choisie, ou décision de Vega avec un dossier de moins de 5 pièces | La colonie passe sous administration de la compagnie. Inez démissionne. Le dossier est classé « incident technique ». |
| **« Les vivants, sans preuve »** | Option *Tenir la colonie* choisie | La colonie tient cette nuit-là, mais la clause s'applique. Vega est relevée à l'arrivée. |

#### 5.7.1 Choix final : options ouvertes par les choix cumulés — validé le 2026-11-06

**Un seul conteneur (décision du 2026-11-23)** : le conseil écrit « Un seul conteneur à rendre : insuffisant pour une restitution. » ; la restitution demande toujours 2 conteneurs ou plus.

**Logique [EXISTANT] V188** (`finalChoiceOptionsV188`, `resolveFinalChoiceV188`, testée) :
- *Transmettre* n'est ouvert que si Asphodèle est reprise et sa salle des relais ouverte ; **V188** : la salle est fournie par le hub Asphodèle (`asphodeleRelayReadyV188`) et lue par défaut par `finalChoiceOptionsV188` ; l'Acte V (§5.11) s'appuie dessus.
- Les modificateurs sont appliqués : *restitution* avec 2 conteneurs ou plus, tentative de récupération à bord si la créature a été capturée.
- Vega suit la recommandation si la loyauté de Mara Vega est d'au moins 55 (niveau *operationnel*).
- Sinon, avec 5 pièces mais sans canal sûr, Vega tient la colonie (**[PROPOSÉ]**, cas non écrit).

Le conseil de guerre et les fins sont jouables depuis V188 (spec 006) : §5.11.

| Option recommandée par Echo-9 | Toujours proposée ? | Condition pour qu'elle apparaisse | Fin |
| --- | --- | --- | --- |
| **Transmettre** : protéger la colonie et envoyer le dossier à l'ICC et aux Marshals coloniaux | Non | Asphodèle reprise (S4) **et** salle des relais ouverte (*Relais en dérive* ×3) **et** dossier ≥ 5 pièces | « Le relais parle » |
| **Tenir la colonie** : bloquer l'équipe de récupération sans canal sûr | Oui | — | « Les vivants, sans preuve » |
| **Céder le dépôt** : laisser la compagnie récupérer le dépôt et négocier l'évacuation | Oui | — | « Le fret d'abord » |

**Ce qui ferme ou change une option :**

| Choix cumulé | Effet sur le choix final |
| --- | --- |
| Conteneurs ramenés à l'Acte III (`story-m577-manifest`) | Chaque conteneur à bord est une pièce que la compagnie réclame : avec 2 ou 3 conteneurs, *Céder le dépôt* est présenté par Halloran comme « restitution » et ne coûte aucun moral à l'équipage. **Décision du 2026-11-22** : les conteneurs voyagent dans la remorque de fret de l'Acte V ; si elle est lâchée (au pont, choix ou délai, ou plus tard sur la route), ils ne comptent plus comme ramenés. Halloran ne parle alors plus de « restitution » : la cession coûte le moral de *Céder* sans restitution (une fois, au passage à la fin) et la fin comme l'épilogue mentionnent le fret perdu (§5.11). |
| Créature capturée à l'Interlude (`story-quarantine-outcome` = `captured`) | Halloran l'exige en plus du dépôt ; *Tenir la colonie* déclenche une tentative de récupération à bord du Tantalus pendant C5. |
| Palier de la colonie (§6.3) | Avec *Autonome*, la clause de non-viabilité tombe dans « Le relais parle ». En dessous, la charte est seulement suspendue en attente d'enquête. |
| Choix CASSIUS (S2-S4) | CASSIUS conservé : il confirme les ordres de livraison devant Halloran (réplique au conseil). Effacé : la pièce *Ordres de livraison archivés par CASSIUS* n'est acquise que si elle a été récupérée en S2. |
| Confiance de Vega | En dessous de *operationnel*, la recommandation n'est pas suivie : Vega décide (§5.6, étape 2). |
| Origine `origin-03` ou `origin-10` | Réplique supplémentaire au conseil de guerre, sans effet sur les conditions. |

La fin affichée et le nombre de colons arrivés (CIN-61) viennent toujours de l'état réel de la sauvegarde ; aucune option n'est accordée par une cinématique.

### 5.8 Épilogue — « Ce que le retour devra raconter » — [PARTIEL] V188 (§5.11)

Jouable, sans combat. Visite du Tantalus, de Port-Méridien et, si elle est reprise, d'Asphodèle. Chaque personnage a une réplique finale selon la fin. Le Tantalus se prépare à repartir : la baie cryo rouvre ses caissons. Sur le casier de l'Echo-8 : `RETOUR CONFIRMÉ` ou `POSTE LIBÉRÉ` (§7.4).

### 5.9 Durée de la campagne principale et extension vers 25 h — validé le 2026-11-06

**Décision (§45.1, §45.2) :** 25 h et plus, avec les quatre leviers.

**Méthode d'estimation.** Les missions de la campagne principale n'ont pas de durée écrite (§0.1 dit seulement « courte », « moyenne », « longue »). Les campagnes annexes en ont : en moyenne **25 min** pour une intro (15 missions chiffrées), **35 min** pour une principale (51), **47 min** pour une finale (5) et **20 à 30 min** pour les missions courtes chiffrées des arcs. Ces moyennes sont appliquées ci-dessous. Ce sont des ordres de grandeur à confirmer par les tests de jeu (§53.11), pas des mesures.

**Contenu actuel, estimé :**

| Bloc | Missions | Durée unitaire | Total |
| --- | --- | --- | --- |
| Intros (P-1, P-2, P-3, *La doyenne*, *Six heures de silence*) | 5 | 25 min | ≈ 2 h 05 |
| Principales (Actes I à IV, Acte III en deux missions, Interlude, C1-C5, S1-S4) | 15 | 35 min | ≈ 8 h 45 |
| Finale (Acte V) | 1 | 47 min | ≈ 0 h 47 |
| Annexes de la colonie et de la station | 14 | 25 min | ≈ 5 h 50 |
| **Total estimé** | 35 | — | **≈ 17 h 30** |

Ne sont pas comptés : les 22 quêtes du Tantalus (§8), dont la durée dépend du hub ; l'épilogue ; les contrats locaux ; la gestion de la colonie. **Écart à combler : ≈ 7 h 30.**

**Plan d'extension par levier :**

| Levier | Ajout proposé | Estimation |
| --- | --- | --- |
| 1. Missions principales | 4 nouvelles missions (tableau ci-dessous) | 4 × 35 min ≈ 2 h 20 |
| 2. Annexes écrites | 8 nouvelles annexes (tableau ci-dessous) | 8 × 25 min ≈ 3 h 20 |
| 3. Contrats locaux générés | Un contrat proposé à chaque cycle de colonie ; on compte qu'un joueur en fait environ 6 sur la campagne | 6 × 20 min ≈ 2 h |
| 4. Gestion de la colonie et de la station | Un cycle par retour au hub (§45.1), soit environ 25 cycles de quelques minutes : chantiers, affectations, événements | ≈ 2 h |
| **Total ajouté** | — | **≈ 9 h 40**, soit **≈ 27 h** au total |

**Nouvelles missions principales :**

| ID | Titre | Placement | Résumé | Registre (§0.3) | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `story-quai-nord` | **Le quai nord** | Après l'Acte II | Retourner au quai nord de QZ-18, d'où la navette est partie à 18:54 sans les blessés. Chercher le personnel du message libéré : survivants retranchés ou traces de leur sort. Ramène des colons à Port-Méridien ; n'ajoute pas de pièce au dossier (qui reste à 7). | Horreur | Message de détresse arrivé trop tard, ceux qu'on a laissés. |
| `story-route-depot` | **La route du dépôt** | Avant l'Acte IV | Suivre en surface la destination absente du bon de QZ-17 jusqu'aux abords du dépôt : pistes de chariot, clôture, ventilations chaudes. La mission s'arrête au signal perdu qui ouvre CIN-50 ; la capture reste hors champ. | Tension | Installation de la compagnie qui n'apparaît sur aucune carte. |
| `story-moyeu` | **Le moyeu** | Entre S3 et S4 | Atteindre le cœur de CASSIUS au centre de la station par les rayons, en gravité réduite, pour préparer la remise en pression. | Horreur | Station tournante, IA de gestion, conduits. |
| `story-recuperation` | **L'atterrissage** | Début de l'Acte V, avant le conseil de guerre | Observer l'atterrissage de l'équipe de récupération de la compagnie au dépôt sans être vu : effectifs, matériel, ordre écrit. Ce que l'escouade rapporte s'ajoute aux avantages du conseil de guerre. Aucun combat contre les commandos n'est requis. | Tension | Équipe de récupération de la compagnie, actifs biologiques. |

**Nouvelles annexes :**

| ID | Titre | Donneur | Résumé | Registre |
| --- | --- | --- | --- | --- |
| `colony-a-ecole` | **La salle de classe** | Adèle Sarrazin | Rouvrir l'école du port après C1 ; trouver un local sûr et ramener le matériel d'un bâtiment évacué. | Tension |
| `colony-a-pluie` | **Les citernes** | Lucia Ferro | L'eau de pluie stockée a un goût d'acide : suivre les gouttières jusqu'à une citerne percée par le haut. | Horreur |
| `colony-a-registre` | **Le registre du port** | Tomas Wren | Récupérer le registre des arrivées de navettes dans la capitainerie, ouverte aux intempéries. | Tension |
| `colony-a-ferme` | **La dernière ferme** | Leila Sørensen | Après *La balise du hameau*, ramener une famille qui refuse de quitter ses serres. | Tension |
| `station-a-kessler` | **Le casier de Kessler** | ECHO-A | Après S3, retrouver les effets personnels du sergent Kessler dans les quartiers d'Echo-8 à bord du dropship resté au sas. | Calme |
| `station-a-ivarsson` | **L'administratrice** | Asha Mbaye | Après *Les journaux de l'équipage*, fouiller le bureau de Solène Ivarsson, dont le journal s'arrête avec ceux des survivants (§7.4) : les autorisations qu'elle a signées et celles qu'on lui a imposées. N'ajoute pas de pièce au dossier. | Tension |
| `station-a-anneau` | **La nuit de l'anneau** | Grue | Si le pacte de l'anneau est conclu : défendre le marché pendant une coupure d'énergie. | Action |
| `station-a-sas` | **Le sas 7** | Idris Kwan | Un sas extérieur se cycle seul la nuit : trouver ce qui l'actionne. | Horreur |

Les nouvelles missions ne réutilisent aucun identifiant existant et ne changent pas les 7 pièces du dossier (§5.7). Leur registre complète la répartition du §0.3.

### 5.10 Fiches des missions ajoutées — validé le 2026-11-06

Statuts de production : **[PRÉSENT]** dans le dépôt, **[À CRÉER]**, comme au §28.

#### `story-quai-nord` · Le quai nord (Horreur, ≈ 35 min)

**Placement :** après l'Acte II, avant C2. **Donneur :** Asha Mbaye, qui a lu le message libéré (CIN-20).

1. **CIN-21 « Le quai nord »** (25 s) : le dropship d'Orlov se pose sur la dalle du quai nord de QZ-18. Une navette manque à son emplacement ; une civière est restée au bord du quai.
2. Exploration des abris du quai, de la salle d'attente et du hangar de maintenance. Le détecteur de mouvement s'affole puis se tait.
3. Les noms du message libéré sont écrits à la craie sur une porte blindée : le personnel s'est enfermé dans la chambre froide du quai.
4. Ouvrir la chambre froide demande de rétablir l'énergie du quai (`restore atmospheric processing`) ; le bruit attire des drones.
5. Selon le temps mis et les choix de route : de 0 à 4 survivants ramenés.

**Conséquences :** `story-quai-nord-survivors` = 0-4, ajoutés à la population de Port-Méridien ; ils apparaissent à l'appel de CIN-61. Aucune pièce de dossier.
**Ancrage Alien :** ceux qu'une priorité de fret a laissés derrière.
**Besoins :** décor du quai nord (dalle, abris, chambre froide) [À CRÉER] ; drones [PRÉSENT] ; civière, inscriptions à la craie, porte blindée [À CRÉER] ; CIN-21 [À CRÉER].

#### `story-route-depot` · La route du dépôt (Tension, ≈ 35 min)

**Placement :** après C3, avant l'Acte IV. **Donneur :** Inez Harlow, qui veut savoir où mène la destination absente du bon (Acte I).

1. Suivre en surface les traces de chariot depuis QZ-17 : ornières dans la boue, bornes de compagnie sans nom.
2. Une clôture électrifiée, coupée de l'intérieur. Des ventilations chaudes sortent du sol.
3. Contourner une patrouille de drones par un fossé de drainage, ou la nettoyer (bruit).
4. Atteindre une grille de ventilation du dépôt : la caméra casque se dégrade (transition directe vers CIN-50).

**Conséquences :** ouvre l'Acte IV ; `story-depot-approach` = `drain` | `fence` change le point de départ de la sortie de l'Acte IV.
**Ancrage Alien :** une installation de la compagnie qui n'existe sur aucune carte.
**Besoins :** extérieur de surface pluvieux, clôture, bornes, ventilations [À CRÉER] ; drones [PRÉSENT] ; effet de dégradation de caméra casque [À CRÉER, partagé avec CIN-50].

#### `story-moyeu` · Le moyeu (Horreur, ≈ 35 min)

**Placement :** entre S3 et S4. **Donneur :** Idris Kwan, à la radio.

1. **CIN-73 « Le moyeu »** (20 s) : vue des rayons de la station depuis l'anneau ; les lumières s'éteignent section par section vers le centre.
2. Monter un rayon par l'échelle de service : la gravité baisse à chaque palier (déplacement plus lent, sauts plus longs).
3. Au moyeu, en gravité très faible : les objets flottent, le détecteur repère tout ce qui bouge, y compris les débris.
4. Atteindre le cœur de CASSIUS et lancer la remise en pression préparée pour S4.

**Conséquences :** S4 commence avec la remise en pression amorcée ; si CASSIUS a été conservé, il parle pendant la montée et indique les pièges de pression.
**Ancrage Alien :** station tournante, IA de gestion, le détecteur qui ment.
**Besoins :** rayon, échelle, moyeu en gravité faible [À CRÉER] ; mécanique de gravité variable [À CRÉER] ; débris flottants (VFX) [À CRÉER] ; CIN-73 [À CRÉER].

#### `story-recuperation` · L'atterrissage (Tension, ≈ 35 min)

**Placement :** début de l'Acte V, avant le conseil de guerre. **Donneur :** Mara Vega.

1. Prendre position sur une crête au-dessus du dépôt avant l'arrivée de l'équipe de récupération.
2. **CIN-59 « L'atterrissage »** (20 s) : un transport de la compagnie se pose ; des commandos débarquent en ordre.
3. Observer sans être vu : compter les effectifs, identifier le matériel (caisses de confinement, armes), photographier l'ordre affiché sur la tablette d'un officier.
4. Être repéré met fin à l'observation : repli sous le feu, sans obligation de combat.

**Conséquences :** chaque information rapportée devient un avantage au conseil de guerre (§5.6, étape 1) : effectifs connus, matériel connu, ordre écrit. L'ordre écrit **n'est pas** une pièce du dossier : il prouve l'intention de récupérer, pas ce qui s'est passé.
**Ancrage Alien :** l'équipe de récupération de la compagnie et ses « actifs ».
**Besoins :** commandos Weyland-Yutani [PRÉSENT au catalogue] ; transport de la compagnie [À CRÉER] ; mécanique d'observation (photographie, comptage) [À CRÉER] ; CIN-59 [À CRÉER].

#### Annexes ajoutées

| ID | Déroulé | Conséquence | Besoins |
| --- | --- | --- | --- |
| `colony-a-ecole` | Après C1. Trouver un local sans conduit ouvert, puis ramener tables, tableau et réserves de l'école évacuée, sous alerte. | Moral de la colonie + ; scène de classe au hub de Port-Méridien | Intérieur d'école [À CRÉER], props de classe [À CRÉER] |
| `colony-a-pluie` | Après C2. Suivre les gouttières jusqu'à la citerne du toit ; une ouverture faite par le haut, de l'acide sur le bord. Sceller la citerne (`seal the hive`). | Chantier Eau + ; Lucia Ferro écarte l'eau comme cause des « malaises » : la piste des hôtes (`colony-a-ferro`) se confirme | Toits et citernes [À CRÉER], acide [PRÉSENT] |
| `colony-a-registre` | Après l'Acte II. Récupérer dans la capitainerie inondée le registre des navettes ; une page manque. | Ajoute un détail au témoignage de Wren (aucune nouvelle pièce) | Capitainerie [À CRÉER] |
| `colony-a-ferme` | Après *La balise du hameau*. Convaincre une famille de quitter ses serres ; l'escorter de nuit (`escort a colony convoy`). | Population + ; nourriture + si les semences sont emportées | Serres de ferme [À CRÉER], famille (3 PNJ) [À CRÉER] |
| `station-a-kessler` | Après S3. Ouvrir le casier de Kessler dans le dropship d'Echo-8 resté au sas : photos, lettre non envoyée, ordre de mission. | Le casier vide du Tantalus reçoit ses effets ; réplique de Tamsin Velez | Intérieur du dropship d'Echo-8 [À CRÉER], effets personnels [À CRÉER] |
| `station-a-ivarsson` | Après *Les journaux de l'équipage*. Fouiller le bureau d'Ivarsson : autorisations signées, demandes de levée de quarantaine refusées par la compagnie. | Complète §7.4 ; aucune nouvelle pièce | Bureau [À CRÉER], terminaux Seegson [PRÉSENT] |
| `station-a-anneau` | Si le pacte de l'anneau est conclu. Coupure d'énergie sur le marché ; défendre les étals et les récupérateurs jusqu'au retour du courant (`hold the extraction zone`). | Commerce de Grue + | Marché de l'anneau (§42.2) [À CRÉER] |
| `station-a-sas` | Un sas extérieur se cycle seul la nuit. Trouver ce qui l'actionne : un câble rongé, puis un nid dans la gaine (`navigate the vent network`). | Sécurité de la station + | Sas extérieur [À CRÉER], gaine technique [À CRÉER] |

**Cinématiques ajoutées :** CIN-21, CIN-59, CIN-73 (CIN-49 n'est pas nécessaire : `story-route-depot` enchaîne sur CIN-50). Elles suivent les contraintes du §10.

### 5.11 Acte V jouable, fins et épilogue — [PARTIEL] V188 (spec 006, 2026-11-15)

Décisions par défaut appliquées (questionnaire `QUESTIONS_PROPRIETAIRE_V188.md`, option recommandée faute de réponse) : Q1 A adaptée, Q2 A, Q3 A, Q4 A, Q5 A, Q12 A, Q79 A. Feature : `specs/006-acte-v-fins/`. Code : `src/story-act5-v188.js`, `src/story-act5-state-v188.js`, `src/act5-slots-v188.js`, `src/story-cinematics-v188.js` ; sauvegarde additive `storyCampaignV188.act5` (absente des anciennes sauvegardes). Tests : `scripts/verify-act5-endings-v188.mjs`.

**Enchaînement.**

1. **Seuil** : Actes II, III et IV terminés (`special-archive-relay`, `special-apc-convoy`, `special-c12-horde`, `special-black-cocoon`), retour de l'Acte IV lu (CIN-51), aucune étape de l'Interlude en attente.
2. **Conseil de guerre** (table tactique, non refermable) : ordre de Halloran ; avantages des membres en confiance *solide* ; réplique de CASSIUS s'il est conservé ou mention de son effacement ; réplique d'Echo-9 pour `origin-03` et `origin-10` ; dossier n/7 ; options et raisons d'une option fermée.
3. **Décision** : Echo-9 recommande ; `resolveFinalChoiceV188` décide (Vega suit à 55). Q3 A validée par défaut : avec 5 pièces sans canal sûr, Vega tient la colonie. CIN-60 suit.
4. **Missions finales**, dans l'ordre : `act5-last-run` *Dernier départ* (`escort a colony convoy`, extérieur) → `act5-depot-queen` *La Reine du dépôt* (`track an apex specimen`, boss) → `act5-port-walls` *Les portes du port* (`defend the colony`) pour *Transmettre* et *Tenir*, ou `act5-evacuation` *L'évacuation* (`hold the extraction zone`) pour *Céder*. Registre Action.
5. **Pont** (Q2 A) : choix sans pause entre le fret et les colons en retard. Depuis la course dédiée (2026-11-21), il se joue sur le tablier en conduisant (`C` / `X`) ; la boîte chronométrée au premier checkpoint reste un repli hors course.
6. **Quai** (Q4 A) : *Transmettre* → ICC saisie, retrait ; *Tenir* → audience sans tir avec Halloran (spec 010, ci-dessous) : gagnée → retrait des commandos, perdue → siège jusqu'à l'aube, sans tir ; sans audience jouée (ancien flux), 5 pièces → retrait. *Céder* : pas de face-à-face.
7. **CIN-61** : appel des arrivés = civils du quai (P-3) + colons du M577 + colons en retard arrivés.
8. **Fin** (CIN-90) : texte de la fin du §5.7 ; avec « Le relais parle », clause levée au palier *Autonome*, charte suspendue en dessous (§5.7.1).
9. **Épilogue** (Q5 A) : au Tantalus, « ÉPILOGUE · Dernier mot » dans la conversation de huit membres de l'équipage ; le casier d'Echo-8 porte `RETOUR CONFIRMÉ` (plaque de Kessler ramenée de S3) ou `POSTE LIBÉRÉ`. Le lire joue CIN-92 : Port-Méridien, Asphodèle (éclairée si reprise), la baie cryo, puis les faits de la partie (colonie, appel, CASSIUS, dossier et ce qui reste non prouvé, confiance de l'équipage, créature de l'Interlude, réplique « Retour » de l'origine d'Echo-9, §2.4.2).
10. **Générique** dans le style du crédit d'ouverture (« A fan game by Darknigthmare »), puis **partie libre** sur la même sauvegarde (§45.2) : missions, colonie et station restent ouvertes ; les missions finales se rejouent sans effet d'histoire.

**Reprise** : chaque phase (`council`, `final`, `ending`, `epilogue`, `credits`, `complete`) est enregistrée avant la cinématique qui la suit ; un rechargement rejoue l'étape en cours. Le pont n'est jamais redemandé.

**Valeurs et textes [PROPOSÉ]** (réglables sans nouvelle décision, §56.1) :

| Élément | Valeur |
| --- | --- |
| Confiance *solide* d'un conseiller | loyauté ≥ 75 (bande `NPC_TRUST_LEVELS_V62`) |
| Sanaa Doyle · tourelles | +120 munitions au départ de chaque mission finale |
| Cal Mercer · blindage | blindage porté à 100 au départ |
| Maksim Orlov · fenêtre | +6 s au pont |
| Leila Sørensen · route | 2 colons en retard sur 4 rejoignent le port si leur remorque est lâchée |
| Pont | 15 s ; sans réponse, le fret cède ; 4 colons dans la remorque en retard |
| *Céder* sans restitution | stress +10 pour chaque membre de l'équipage |
| Textes | ordre de Halloran, répliques des conseillers, de CASSIUS et d'Echo-9 au conseil, textes du pont et du quai, répliques de Cal (CIN-60) et de Rook (CIN-61), 24 derniers mots (Vega, Harlow, Rook, DAVID-8R, BISHOP-9, Okafor, Orlov, Mbaye × 3 fins), faits de l'épilogue |

**Fidélité** : aucune fidélité « 1:1 ». Repères documentés cités dans la spec 006 : cofinancement de la colonie avec l'Administration coloniale et audience de l'ICC (*Aliens*, 1986) ; Marshals coloniaux (*Alien: Isolation*, 2014) ; équipe de la compagnie venue récupérer l'« actif » (*Alien 3*, 1992, dernière scène) ; « Special Order 937 » (*Alien*, 1979) ; M577 sous la pluie, Reine et retour en hypersommeil (*Aliens*, 1986). Adaptations du projet : charte et clause, conseil, pont, appel, casier d'Echo-8. À définir : sprite de la Reine (substitut Canvas dans la course, voir « Course du convoi »), art des 15 emplacements (`src/act5-slots-v188.js`).

**Salle des relais** : condition de *Transmettre* fournie par le hub Asphodèle (`asphodeleRelayReadyV188`), lue par défaut par `finalChoiceOptionsV188` ; l'Acte V ne la reconstruit pas.

**Course du convoi — [PARTIEL] V188 (2026-11-21, Q1 A au sens strict).** Code : `src/act5-convoy-race-v188.js` (règles pures, textes FR/EN, emplacements d'art, substituts Canvas), `src/act5-convoy-race-runtime-v188.js` (mission, composé juste au-dessus de la chaîne V158, sous toutes les couches V188) ; écritures de sauvegarde dans `src/story-act5-v188.js` ; tests `scripts/verify-act5-convoy-race-v188.mjs` ; parcours navigateur `scripts/qa-act5-convoy-race-v188.mjs`.

- **Lancement** : depuis la ligne décidée au conseil, comme avant (identifiants `act5-last-run` et `act5-depot-queen` inchangés). Le M577 est attribué d'office ; insertion et extraction passent par le UD-4L en mode `apc` (gabarit `planet-exterior`).
- **Remorques** (ordre M577 → colons → fret) : la remorque des colons porte les 4 colons en retard ; celle du fret porte les conteneurs scellés du manifeste de l'Acte III (`storyCampaignV188.m577Manifest.containers`) ; les colons du manifeste voyagent dans le M577 et ne sont pas largables. Chaque remorque suit sur un timon à ressort amorti avec butées ; masse, roulement et traînée réduisent la vitesse du convoi.
- **Largage** : `C` lâche les colons, `X` le fret. Pendant *Dernier départ*, la première remorque lâchée **est** la décision du pont (`act5.bridge`, même règle Q2 A) ; une remorque lâchée sur la route arrête les poursuivants qui l'atteignent. Pendant la poursuite, la remorque restante peut servir de leurre : la Reine s'arrête pour la déchiqueter.
- **Pont jouable** : à 24 m sur le tablier avec deux remorques, le tablier s'affaisse et le convoi s'enlise ; la fenêtre de décision reste 15 s (+6 avec Orlov). Sans décision, l'attelage arrière (fret) cède seul. L'effondrement progresse derrière le convoi ; un convoi arrêté sur le tablier y bascule (échec, reprise au checkpoint du pont, la décision enregistrée restant acquise). La boîte de choix chronométrée précédente reste en repli hors de cette course.
- **Reine** : admise seulement si le profil du catalogue est `enemy-008-queen`, de caste royale (`royal`/`boss`) et de la classe de stature 4,8 m (`creature-scale-v188.js`) ; elle est dessinée à **245 px** (1 m ≈ 51 px). Machine à états explicite : traque → préparation → bond → reprise, déséquilibre sous le feu, recul, festin sur une remorque abandonnée, mort. Elle n'entre pas dans `this.enemies` : aucune logique commune (tactiques, castes, horde) ne lui est appliquée. **Décision du 2026-11-22 : elle atteint toujours le carrefour.** Pendant la poursuite, elle est blessée et déséquilibrée, mais sa santé s'arrête à un plancher ; touchée à ce plancher, elle est repoussée (`recoil`) puis revient. Elle ne peut mourir qu'au carrefour du port, où le convoi s'arrête et doit l'abattre.
- **M577 à l'échelle (décision du 2026-11-22)** : `src/m577-scale-v188.js`, 8,8 m **[À VÉRIFIER]** à 51 px/m = **449 px** (boîte de collision 449 × 112, coque de 2,2 m [PROPOSÉ] ; 140 px dessinés avec la tourelle), dans les deux missions de la course et le convoi de l'Acte III (`special-apc-convoy`, voies comprises). Substitut Canvas derrière l'emplacement nommé `m577-mission-side-scale` (aucun fichier demandé tant qu'il est absent) : deux roues par flanc sur la ligne des pieds, porte latérale entre elles, tourelle de toit arrière à deux canons, affût de nez, attelage arrière à 24 px du sol où s'accroche le premier timon. Remorques : 4,6 m [PROPOSÉ] (235 px). Cadrage : M577 de la course à x 780 (nez à 1 229 px), convoi entier dans la vue ; M577 de l'Acte III à x 805, nez à gauche (une reprise enregistrée avec l'ancienne boîte, x 955, reste acceptée). Sources de la longueur, divergentes et sans source primaire : question au propriétaire (≈ 8,8 m ≈ 450 px) ; AvP Central, « M577 APC » (9,22 m tourelle rentrée, 8,58 m tourelle levée) ; wiki de fans Weyland-Yutani (environ 7 m). La miniature de tournage (Propstore, lot 6) reste la référence de morphologie, pas de mesure.
- **Le M577 à l'échelle partout (second tour du 2026-11-22)** : le M577 conduit dans les niveaux ordinaires (véhicules 001 et 002, la variante de commandement partage la coque) et celui que le UD-4L descend ont la même coque de 449 × 112 px. Garé sans toucher à la géométrie sur une voie de sol continue qui mène à l'extraction (jamais sur une cabine d'ascenseur ni sous un pont plus bas que ses 140 px, jamais au travers d'une porte), conduit dans cette voie, sortie par la porte latérale. Le UD-4L reste en vol stationnaire (150 px [PROPOSÉ]) pour le descendre ou le hisser : sur ses patins, son ventre est à 36 px du sol. Le M577 de transport repart hissé avec le vaisseau. Cadrage de la poursuite [PROPOSÉ] : quand la Reine approche, la caméra garde sa silhouette entière et la tourelle du M577 dans la vue (décalage, puis recul jusqu'à 0,78 avec deux remorques). Détail : `docs/development/QUESTIONS_PROPRIETAIRE_V188.md`, D5 et D8.
- **Checkpoints** : un par phase (route, pont, rive nord, approche du port ; poursuite, carrefour).
- **Sauvegarde additive** : `storyCampaignV188.act5.convoyV188 = { drops: [{ trailer, mission, cause, metres }], bridgeCrossed, queen }`, absent des anciennes sauvegardes, validé par `normalizeAct5ConvoyV188` ; le validateur de `src/save.js` n'est pas modifié. Conséquence : des colons en retard perdus après le pont ne rejoignent pas le port (appel de CIN-61) ; la route de Leila ne ramène que ceux laissés pendant *Dernier départ*.
- **Retours** : sons existants V188 (tourelle, cri du coureur et de la Reine, alarme du pont, attelage), particules de la couche VFX V188, journal radio FR/EN.

| Valeur [PROPOSÉ] | Réglage |
| --- | --- |
| M577 | 22 t, traction 62 kN, blindage 340 |
| Remorque | 9 t, timon 1,6 m, ressort 120 kN/m, amortisseur 24 kN·s/m, intégrité 100 |
| Tracé | course 1 500 m, pont à 700 m sur 90 m, effondrement 2 m/s (enlisé) puis 7 m/s ; poursuite 1 600 m |
| Tourelle arrière | 8 coups/s, 12 dégâts, portée 70 m, surchauffe à 100 % |
| Coureurs | `enemy-006-runner`, 80 PV, 19 m/s, vagues de 2 toutes les 7 s, arrêtés 4 s par une remorque |
| Reine | santé du catalogue × 12, traque 20 m/s, bond 24 m/s, 34 dégâts à une remorque, dégâts du catalogue au blindage, festin 6 s ; avant le carrefour, plancher de santé 30 %, recul de 8 m en 0,8 s |
| M577 et remorques (2026-11-22) | M577 8,8 m [À VÉRIFIER] = 449 px, coque 2,2 m = 112 px ; remorque 4,6 m = 235 px |

**Fidélité** : documenté (*Aliens*, 1986) — le M577 et sa fuite du processeur, la Reine qui poursuit les survivants jusqu'à la plate-forme d'évacuation du *Sulaco*. Adaptation du projet — remorques, pont, poursuite routière, tourelle tirant vers l'arrière, festin sur une remorque. À définir — sprite de la Reine (emplacement `act5-queen-chase-side`, 520 × 245, aucun fichier demandé tant qu'il est absent), sprite de mission du M577 (emplacement `m577-mission-side-scale`, 449 × 140) et sa longueur documentée (8,8 m [À VÉRIFIER]). Aucune fidélité « 1:1 ».

- **Fret perdu (décision du 2026-11-22)** : les conteneurs du manifeste voyagent dans la remorque de fret. Une remorque de fret lâchée au pont (choix ou délai) ou sur la route les emporte : `act5ContainersBroughtBackV188` vaut alors 0, *Céder le dépôt* n'est plus une « restitution » (`act5RestitutionHeldV188`), le coût moral s'applique une fois au passage à la fin (champ additif `act5.restitutionLostV188`), la fin ajoute « Le fret perdu en route ne revient pas : Halloran ne parle plus de « restitution »… » et l'épilogue un fait « Fret perdu : … au fond du ravin du pont / sur la route du port avec n conteneur(s) QZ17 » (FR + EN). Avec le fret ramené, la fin dit « Halloran présente la cession du dépôt comme une « restitution » : n conteneurs QZ17 rendus ».

**Audience au quai — [PARTIEL] V188 (spec 010, 2026-11-22).** Première mécanique nouvelle de Q17 A (« face-à-face sans tir »). Code : `src/confrontation-state-v188.js` (règles), `src/confrontation-entries-v188.js` (données FR/EN), `src/confrontation-v188.js` (registre, sauvegarde), `src/confrontation-ui-v188.js` (présentation) ; raccordement dans `src/story-act5-v188.js` et `src/app.js` ; tests `scripts/verify-confrontation-v188.mjs`, parcours `scripts/qa-confrontation-v188.mjs`.

- **Déroulé** : ligne *Tenir la colonie*, après les trois missions finales, à la table tactique. L'officier des commandos tient la liaison QZ ; la Directrice Halloran répond depuis la direction régionale (§2.3 : elle ne s'adresse au Tantalus que par messages). Sept échanges : elle cite une clause (charte, clause 14 ; manifeste QZ17 ; protocole d'expédition, article 3 ; délégation d'Asphodèle ; protocole des synthétiques ; annexe de viabilité ; règlement des enquêtes internes). Echo-9 répond par une pièce du dossier QZ17 détenue, ou se tait.
- **Règles [PROPOSÉ]** : pièce décisive +2 de terrain, partielle +1 (pièce dépensée), hors sujet −1 de crédibilité (pièce gardée), silence sans effet ; crédibilité 3 ; cible 10 ; gagnée dès la cible, perdue à crédibilité 0 ou après le dernier échange. Chaque pièce est décisive à un seul échange : l'audience est impossible sous 5 pièces et gagnable à partir de 5 (borne de Q4 A conservée). Avec 5 pièces exactement, il faut chacune au bon moment.
- **Issue** : gagnée → `act5.standoff = 'withdrawn'`, perdue → `'held'` ; la scène du quai, CIN-61, la fin et l'épilogue existants suivent. Aucune fin nouvelle. *Transmettre* et *Céder* inchangés.
- **Sauvegarde additive** : `storyCampaignV188.confrontationsV188['act5-halloran-quay']`, écrite à chaque échange ; un rechargement reprend à l'échange suivant ; absente des anciennes sauvegardes, qui gardent la règle Q4 A.
- **Accessibilité** : aucune limite de temps ; mouvement réduit respecté ; clavier (1-9, S), souris, toucher ; texte lisible hors du Canvas ; Échap ne ferme pas l'audience.
- **Fidélité** : ton de la compagnie qui « cite » (§1.3) ; audience de l'ICC (*Aliens*, 1986). Clause 14 reprise du §21 (CE-05) ; autres numéros de clause et répliques **[PROPOSÉ]**. Portrait de Halloran : substitut Canvas (buste sur écran CRT, emplacement `confrontation-halloran-crt`), aucune fidélité « 1:1 ».
- **Entrée prête pour S2** : interrogatoire de CASSIUS (`station-s2-cassius`, §7.2), non raccordé (lot des niveaux de la station) ; voir spec 010.

**Reste à faire** : art de la Reine en poursuite et du M577 de mission, longueur documentée du M577, palier *Libre* après « Le relais parle », effets durables de la relève de Vega et de la démission d'Inez en partie libre, nouvelle partie +.

---

## 6. Front colonie — Port-Méridien : sauver, puis reconstruire

### 6.1 Concept

Port-Méridien est le seul port civil de Cocyte encore habité. Sa charte peut être retirée s'il est déclaré non viable. Le joueur doit d'abord **le sauver** (tenir, soigner, contenir l'infestation, évacuer), puis **le reconstruire** jusqu'à ce qu'il remplisse seul les critères de viabilité : air, eau, énergie, communications, défense, population.

C'est ce qui relie la reconstruction à l'intrigue : **chaque chantier terminé retire un argument à la compagnie.**

**Raccordement [PROPOSÉ] :** la colonie utilise les valeurs stratégiques déjà présentes par monde (`stability`, `infestation`, `quarantine`) et les ressources existantes (`credits`, `alloy`, `medical`, `research`, `fuel`). Les conséquences d'opération (`campaign-consequences.js`) modifient déjà stabilité et infestation ; la reconstruction ajoute des chantiers qui consomment ces ressources.

### 6.2 Missions

> **État V188 (lot colonie et équipage, 2026-11-16) — [PARTIEL].** C1-C4, les 7 annexes et les 8 contrats locaux sont jouables (`src/colony-missions-v188.js`) ; C5 se joue comme la mission de l'Acte V `act5-port-walls` (§5.6, étape 7). Accès, récompenses, décisions et valeurs au §6.4. `colony-intro-*` inchangés.

**Intro**

| ID | Titre | Statut | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `colony-intro-quai` (ID proposé) | **Le quai des vivants** | Séquence **[EXISTANT]** / raccordement **[PROPOSÉ]** | Triage, blessé, sas, trois civils (`port-meridien-v90.js`). Rencontre de Tomas Wren et Lucia Ferro. | Évacuation de colons, premier hôte. |
| `colony-intro-doyenne` | **La doyenne** | **[EXISTANT] V188 en visite guidée** (séquence `cin-doyenne` à la fin du quai ; la visite libre attend un hub Port-Méridien, §43) | Asha présente Echo-9 à Adèle Sarrazin. Visite du port : quais, infirmerie, processeur atmosphérique, mur nord. Adèle montre la dette de la colonie envers la compagnie : « S'ils nous déclarent non viables, ils reprennent tout, nous compris. » | Colonie endettée envers la compagnie. |

**Principales**

| ID | Titre | Placement | Résumé | Objectif de base | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `colony-c1` | **Tenir le port** | Après Acte I | Le conteneur QZ17-04 reçu par la colonie s'est ouvert dans l'entrepôt du quai. Contenir la zone, évacuer l'infirmerie de Lucia Ferro, souder les sas. | `defend the colony` | Infestation qui part d'un conteneur, sas soudés. |
| `colony-c2` | **L'air du port** | Après Acte II | Le processeur atmosphérique tombe : des drones ont niché dans sa chaleur. Descendre dans ses niveaux techniques avec Jun Park, purger le nid, relancer le processeur. Débloque la reconstruction. | `restore atmospheric processing` | Processeur atmosphérique, nid dans la chaleur. |
| `colony-c3` | **Le convoi des rescapés** | Pendant Acte III | Les ouvriers ramenés par le M577 arrivent. Contrôle biologique de chacun ; un arrivant porte un embryon. Le repérer sans provoquer de panique et l'amener à Noor avant l'éclosion. | `rescue survivors` | Gestation, contrôle biologique, compte à rebours de l'éclosion. |
| `colony-c4` | **Le culte du port** | Après Acte IV | Des colons convertis aux Children of the Perfected Host ouvrent les sas la nuit et livrent des « élus » aux galeries. Enquêter (méthode de l'Acte II), puis choisir : arrestation par les Marshals, exil ou médiation par Adèle. | `navigate the vent network` | Culte des organismes, hôtes volontaires. |
| `colony-c5` | **La nuit des murs** | Fin de l'Acte V | Les rescapés du dernier convoi franchissent les portes ; la ruche du dépôt suit. Tenir les murs reconstruits jusqu'à l'aube. Le niveau des chantiers détermine la difficulté. | `hold the extraction zone` | Siège, tourelles sentinelles, détecteur de mouvement. |

**Annexes**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `colony-a-quai` | **Ce que le quai a vu** | Tomas Wren | Protéger Wren pendant qu'il récupère ses carnets de quai. Il témoigne sur les conteneurs QZ17 (pièce du dossier). | Témoin qui risque son contrat. |
| `colony-a-ferro` | **Les intoxications** | Lucia Ferro | Ses dossiers parlent de « malaises » après des nuits au quai. Retrouver les patients sortis de l'infirmerie : où sont-ils allés ? | Hôtes non diagnostiqués. |
| `colony-a-abri` | **L'abri du processeur** | Adèle Sarrazin | Escorter les familles vers l'abri pressurisé pendant une alerte. Pas d'arme lourde dans les zones civiles. | Civils, abri pressurisé. |
| `colony-a-seegson` | **Pièces Seegson** | Jun Park | Récupérer du matériel Seegson dans un entrepôt abandonné ; un synthétique de service y est resté bloqué sur une ancienne consigne. | Matériel Seegson bas de gamme, synthétique de service. |
| `colony-a-balise` | **La balise du hameau** | Rook | Rétablir une balise de colonie isolée (« Balise de colonie » existe au catalogue) pour retrouver les fermes éloignées. | Isolement, balise de détresse. |
| `colony-a-crucible` | **Le prix de Grue** | Grue | Les récupérateurs proposent des alliages contre un accès au quai. Négocier, ou refuser et chercher ailleurs. | Récupérateurs de frontière. |
| `colony-a-converti` | **Mon frère est parti** | Un colon | Retrouver un jeune converti avant qu'il ne descende dans les galeries. Change l'issue de C4. | Culte, hôte volontaire. |

**Locales (rejouables)**

| Contrat | Objectif existant | Effet |
| --- | --- | --- |
| Purge du réservoir | `purge a reactor nest` | Infestation −, chantier Eau + |
| Escorte des moissonneurs | `escort a colony convoy` | Population +, nourriture |
| Ronde des murs | `defend the colony` | Chantier Murs et sas + |
| Filtres du processeur | `restore atmospheric processing` | Chantier Processeur + |
| Récupération en périphérie | `recover black-box data` | Alliage, crédits |
| Recherche de disparus | `rescue survivors` | Population +, moral + |
| Chargeur bloqué | `secure the power loader` | Vitesse des chantiers + |
| Sceller une ouverture | `seal the hive` | Infestation − |

### 6.3 Reconstruction — [PARTIEL] V188

> **État V188.** La table existe dans la vue Commandement (« RECONSTRUCTION DE PORT-MÉRIDIEN », `src/colony-reconstruction-v188.js`, sauvegarde `colonyV188`). Les adaptations et valeurs retenues sont au §56.8.

Après C2, Asha ouvre la **table de reconstruction** (salle commune de Port-Méridien, ou console des quartiers du Tantalus). Chaque chantier a trois niveaux et correspond à un **critère de viabilité** de la charte.

| Chantier | Critère de viabilité | Niveau 1 | Niveau 2 | Niveau 3 | Référent |
| --- | --- | --- | --- | --- | --- |
| **Processeur atmosphérique** | Air | Air respirable au port | Serres pressurisées | Exportation d'air vers les hameaux | Jun Park |
| **Infirmerie** | Santé | Triage stable | Bloc et contrôle biologique | Isolement complet | Lucia Ferro, Noor Okafor |
| **Murs et sas** | Sécurité | Sas soudés | Mur nord | Tourelles sentinelles | Sanaa Doyle, Pablo Reyes |
| **Énergie** | Énergie | Générateurs de secours | Réseau du port | Réseau partagé avec Asphodèle | Idris Kwan |
| **Communications** | Contact | Balise locale | Relais indépendant du réseau QZ | Liaison directe hors compagnie | Rook, Asha Mbaye |
| **Quais** | Ravitaillement | Une plate-forme | Dépôt de ravitaillement | Port ouvert aux convois civils | Cal Mercer, Maksim Orlov |
| **Habitat** | Population | Dortoirs | Quartiers familiaux | Accueil de nouveaux colons | Adèle Sarrazin |

**Règles :**

- Un chantier consomme des ressources existantes et du temps stratégique ; il ne progresse jamais pendant une mission en cours.
- Un niveau n'est validé qu'après une mission locale réussie sur place (ex. Ronde des murs pour Murs et sas niveau 2).
- Une mission ratée peut endommager un chantier : il perd un niveau de fonctionnement, pas les ressources investies.
- La population ramenée au fil de la campagne limite le nombre de chantiers actifs.
- La stabilité de Cocyte monte avec les chantiers terminés ; l'infestation baisse avec les purges.

**Paliers :**

| Palier | Condition | Effet |
| --- | --- | --- |
| **Survie** | Début | Missions locales défensives seulement. |
| **Rétablie** | 3 chantiers niveau 1 | Annexes de la colonie ; recrutement de Nadia Bensaïd. |
| **Autonome** | 5 chantiers niveau 2 | La colonie remplit les critères de viabilité ; condition de la fin « Le relais parle ». Ressources régulières. |
| **Libre** | 7 chantiers niveau 3 + fin « Le relais parle » | Épilogue spécial : premier convoi civil hors réseau QZ. |

### 6.4 Missions de la colonie jouables — [PARTIEL] V188 (lot colonie et équipage, 2026-11-16)

**Ravitaillement rendu par la colonie (décision du 2026-11-23) [PROPOSÉ]** : chaque mission de Port-Méridien réussie rend **8** de ravitaillement (rejouées et contrats compris), chaque niveau de chantier validé **4** ; soute plafonnée à 100 (`COLONY_SUPPLY_RETURNS_V188`). Une sortie sur Cocyte coûte 6. Le Commandement affiche ces sources ; le bilan nomme le montant reçu. Le carburant n'est pas concerné.

Décision par défaut Q25 A : C1 puis C5 d'abord ; C2-C4, les annexes et les contrats suivent le même gabarit. Code : `src/colony-missions-v188.js` (données et règles), `src/colony-reconstruction-v188.js` (validation locale, volontaires), `src/colony-crew-slots-v188.js` (emplacements d'art) ; sauvegarde additive `colonyMissionsV188` (missions déjà payées, scènes vues, décisions C4 et Grue, compteurs de contrats, volontaires). Lancement depuis l'ordre de mission du Commandement, comme toute opération : départ du hangar, insertion, mission sur un gabarit existant, extraction, retour au hangar du Tantalus. Les missions verrouillées n'apparaissent pas dans les listes et le lancement les refuse.

**Ce qui est joué et comment on y accède [PROPOSÉ pour les verrous]**

| Mission | Ouverture | Gabarit · objectif existant | Chantier | Récompense unique [PROPOSÉ] |
| --- | --- | --- | --- | --- |
| `colony-c1` Tenir le port | Acte I (QZ-17) | `colony-multiroute` · `defend the colony` | Murs et sas | construit et valide le niveau suivant (sas soudés) ; infestation −4 ; **remplace la validation provisoire** |
| `colony-c2` L'air du port | Acte II + C1 | `ship-interior-vertical` · `restore atmospheric processing` | Processeur | niveau suivant ; stabilité +2 |
| `colony-c3` Le convoi des rescapés | convoi du M577 (Acte III) + C2 | `colony-multiroute` · `rescue survivors` | Infirmerie | niveau suivant ; quarantaine −3 |
| `colony-c4` Le culte du port | Acte IV + C3 | `colony-multiroute` · `navigate the vent network` | Habitat | niveau suivant ; puis décision Marshals / exil / médiation |
| C5 La nuit des murs = `act5-port-walls` | ligne *Transmettre* ou *Tenir* de l'Acte V | mission de l'Acte V, id conservé | Murs et sas | valide le niveau payé en attente ; stabilité +5 |
| `colony-a-quai` Ce que le quai a vu | après C1 | `escort a colony convoy` | Quais | **témoignage de Wren, 7e pièce du dossier QZ17** |
| `colony-a-ferro`, `-abri`, `-seegson`, `-balise`, `-crucible` | palier *Rétablie* | objectifs du §6.2 | Infirmerie, Habitat, Énergie, Contact, Quais | recherche +4 ; stabilité +4 ; alliage +30 ; 2 volontaires ; décision de Grue |
| `colony-a-converti` Mon frère est parti | entre C3 et C4 | `navigate the vent network` | Habitat | 1 volontaire ; ouvre la **médiation** de C4 |
| 8 contrats `colony-l-*` (rejouables) | défensifs (réservoir, ronde des murs, ouverture) en *Survie*, tous en *Rétablie* | objectifs du tableau « Locales » | voir ci-dessous | valident le niveau en attente de leur chantier, à chaque réussite |

Contrats et chantiers [PROPOSÉ] : Purge du réservoir → Énergie (nid contre le réacteur, infestation −3) ; Escorte des moissonneurs → Habitat (+1 volontaire) ; Ronde des murs → Murs et sas ; Filtres du processeur → Processeur ; Récupération en périphérie → Communications (boîtes noires des relais, +120 crédits, +12 alliage) ; Recherche de disparus → Infirmerie (+1 volontaire) ; Chargeur bloqué → Quais ; Sceller une ouverture → Murs et sas (infestation −3). Le « chantier Eau » du tableau « Locales » n'existe pas au §6.3 : la purge du réservoir est rattachée à l'Énergie.

**Règles appliquées.** Après C1, une opération ordinaire sur Cocyte ne valide plus de niveau ; seule une mission locale le fait (§6.3) ; une mission ratée endommage toujours un chantier. Chaque mission principale ou annexe ne paie qu'une fois (un rejouage ne change rien) ; les contrats se répètent. Les volontaires (annexes, contrats, quête d'Asha) relèvent la limite de chantiers actifs mais ne comptent pas dans l'appel de CIN-61. Au retour, une scène par mission s'ouvre une fois à la table tactique ; la décision de C4 et celle de Grue ne se referment pas avant d'être prises et ne se reprennent pas. La table de reconstruction liste les missions, leur chantier, les contrats ×n, les volontaires et le bonus de C5.

**C5 [PROPOSÉ].** Le niveau validé des Murs et sas règle la défense au lancement de `act5-port-walls` (une fois par lancement, pas à la reprise) : sas soudés +40 munitions ; mur nord blindage 60 ; tourelles sentinelles +80 munitions.

**Décisions [PROPOSÉ].** C4 : Marshals (stabilité +4, quarantaine +2), exil (stabilité +2, infestation +3), médiation d'Adèle si le frère a été ramené (stabilité +6, 2 volontaires). Grue : accepter (alliage +60, stabilité −2) ou refuser (stabilité +2).

**Fidélité.** Aucune fidélité « 1:1 ». Repères documentés : portes soudées et tourelles sentinelles UA 571-C (*Aliens*, 1986, et son édition spéciale, 1991) ; processeur atmosphérique de Hadley's Hope (*Aliens*, 1986) ; embryon révélé par un scanner médical (*Alien 3*, 1992) ; Marshals coloniaux et matériel Seegson à bas coût, synthétiques bloqués sur une consigne (*Alien: Isolation*, 2014) ; chargeur P-5000 et M577 (*Aliens*, 1986). Adaptations du projet : charte et chantiers, carnets de Wren et ses deux bordereaux, culte des « Enfants de l'Hôte Parfait » (§1.5, art original à refaire, Q47), Grue. Textes des scènes et décisions [PROPOSÉ]. Les 7 illustrations de retour de colonie sont désormais produites et chargées par `colony-crew-slots-v188.js` (continuation du 16 novembre 2026) ; les indices et légendes restent natifs FR/EN. Ces illustrations de dialogue ne constituent pas des décors de niveau ni de nouveaux acteurs. Les niveaux dédiés de C1-C4 sont décrits ci-dessous ; leurs décors restent des primitives.

**Niveaux dédiés C1-C4 — [PARTIEL] V188 (2026-11-21, spec `008-niveaux-colonie`).** Une couche par mission (`src/colony-mission-levels-v188.js`, lieux mesurés par `src/colony-level-places-v188.js`, emplacements d'art `src/colony-level-art-v188.js`) se pose sur les gabarits existants : identifiants, objectifs de campagne, récompenses, `colonyMissionsV188`, décision C4 et règles de reconstruction inchangés. La rencontre générique (roster, reine du gabarit, générateur) laisse place aux phases écrites ; l'objectif existant (défendre, rétablir l'air, secourir, traverser les conduits) est rempli par ces phases. Règles communes [PROPOSÉ] : 51 px/m, marine 44 × 92 ; toute apparition hostile naît derrière une zone sûre de 900 px et attend 4 s ; un checkpoint par phase, écrit au début de la phase (reprise et nouvelle tentative y reviennent, phase telle qu'au début, champ de reprise additif `colonyLevelV188`) ; interactions sur le rail ; une interaction maintenue (E) avance tant qu'on la tient à portée, un coup la met en pause sans la remettre à zéro.

| Mission | Rendu | Phases jouées | Valeurs [PROPOSÉ] |
| --- | --- | --- | --- |
| C1 Tenir le port | V2 : couloir de profondeur `colony-c1-port-corridor` (≈ 4 450 px de rue, quai → plate-forme ; ascenseurs garés à la rue) | largage → quai → entrepôt QZ17-04 (conteneur ouvert, rideau à baisser, 2 s maintenues) → rue → infirmerie (Lucia Ferro, 3 patients à mener à la plate-forme, à pied, s'ils voient le marine) → sas A (volet de la rue) et sas B (mur nord, dessiné sur la paroi) soudés 6 s chacun, étincelles et cordon → 2 sentinelles UA 571-C prises sur la plate-forme et posées sur le rail → pic au sas B, puis retour calme vers l'extraction | entrepôt : 4 drones, 2 à la fois, 1 / 9 s ; évacuation : 6, 3 à la fois, 1 / 7 s ; sas A : 4 ; pic au sas B : 8, 5 à la fois, 1 / 2,2 s ; sentinelle : 220 cartouches, 520 px, 9 dégâts / 0,18 s ; aucune apparition vers l'extraction |
| C2 L'air du port | V1 (intérieur, §43.1) ; la cale procédurale du gabarit vaisseau n'est plus appliquée à C2 | passerelle (radio de Jun Park, repos) → conduits (embuscade, détecteur de mouvement) → échangeurs (nid de résine et cocons, purge maintenue 5 s) → salle de contrôle (3 disjoncteurs, console de relance) → surpression (deux évents de vapeur pulsés) sur la route éclairée → extraction sur le pont haut | embuscade 3 drones ; réveil du nid 3 ; surpression 4 ; vapeur 1,2 s sur 3 s |
| C3 Le convoi des rescapés | V1 | quai du M577 → couloir de triage → poste de scanner (5 rescapés, 2,5 s chacun) → infirmerie de Noor Okafor (décision du 2026-11-22 : Noor tient l'infirmerie et n'est pas déployée avec l'escouade dans C3 ; elle la rejoint de nouveau ensuite ; réplique FR/EN au départ) | porteur tiré de la graine de mission et conservé dans le checkpoint ; panique : viser (Maj ou tir) +35/s, courir près d'eux +25/s, −12/s sinon, dispersion à 100 vers les salles voisines (rassurer un par un, pas d'échec) ; éclosion 240 s après la révélation, échec et reprise à la phase si elle survient ; 2 drones rôdeurs |
| C4 Le culte du port | V1, nuit (lampe du marine, dortoirs plus sombres) | dortoirs : 3 indices (journal du sas ouvert de l'intérieur, inscription « élus », scellé forcé) → conduits du réseau V62 : la branche du toit médical est un cul-de-sac avec une cache facultative (+1 renseignement), l'autre mène au rassemblement ; le volet de sécurité est scellé de l'intérieur ; décision du 2026-11-22 : une grille de service soudée ferme la galerie technique (entre les échelles de la rue B et de la sécurité, du sol au plafond) et une porte de toit soudée ferme le toit du bloc des communications, qui contournait lui aussi les conduits ; les conduits sont le seul chemin (le chalumeau reste dans la galerie, à l'ouest de la grille) → rassemblement : 3 convertis en ronde (vue 240 px), un élu dans un cocon (résine maintenue 4 s) → extraction, puis la décision C4 existante | convertis évitables, maîtrisables sans les tuer (E de dos ou quand ils sont étourdis) ; un converti tué : stabilité −1 (au plus −3), appliqué une fois au règlement de l'opération réussie |

Sources et fidélité (aucune fidélité « 1:1 ») — documenté : portes soudées et tourelles sentinelles UA 571-C avec compteur de munitions (*Aliens*, 1986, et son édition spéciale, 1991) ; ruche dans la chaleur du processeur atmosphérique, colons cocoonés sur ses parois (*Aliens*, 1986) ; embryon révélé par un scanner médical (*Alien 3*, 1992) ; détecteur de mouvement (*Aliens*). Adapté par le projet : conteneur QZ17-04, plan de Port-Méridien, deux sentinelles posées par le joueur, jauge de panique, compte à rebours d'éclosion, convertis des Enfants de l'Hôte Parfait et leurs « élus » (§1.5), maîtrise non létale, coût de stabilité. À définir : l'art de tous les emplacements (primitives Canvas ; aucune image générée) ; les patients, rescapés et l'élu réemploient provisoirement la planche des trois survivants du cargo (`cargo-brutal-visuals-v67.js`) et le M577 la primitive du largage, sans valeur d'identité.

**Décisions du 2026-11-22 (C1, C3, C4).** Le M577 du joueur reste à bord dans C1, C3 et C4 : véhicule rangé au démarrage, insertion et extraction à pied (le M577 garé au quai de C3 reste un décor de l'arrivée des rescapés ; second tour du 2026-11-22 : il est à l'échelle, 449 px entièrement sur le sol du quai, nez vers le début du niveau, porte arrière vers les rescapés, sur le tablier derrière la voie des marines, non conduisible ; l'écran de préparation de C3 liste Noor Okafor « indisponible · à l'infirmerie » avec la raison). C1 : la perspective du pont du couloir est plafonnée à un demi-écran (`deckPerspectiveSpan` 640 px [PROPOSÉ]) ; aux deux bouts, les joints penchent comme au bord d'un écran centré, ≈ 85 px au lieu de ≈ 296 px.

**Reste à faire.** Art des niveaux dédiés de C1-C4 (20 emplacements en primitives, dont la grille et la porte de toit soudées de C4) et voix ; console du quai (Q26) ; quartiers V2 (Q24) ; palier *Libre* ; recrutement de Nadia Bensaïd à *Rétablie* (§8.3) ; vie de la colonie entre deux missions (Q29). Les annexes et contrats gardent leurs gabarits génériques.

---

## 7. Front station — Asphodèle : la station perdue, futur hub

### 7.1 Concept

La **station Asphodèle** pilote le réseau QZ : relais, file des messages, autorisations de départ et quarantaine. Son système de gestion Seegson, **CASSIUS**, a déclenché la quarantaine rouge il y a trois semaines et l'applique toujours. L'équipe Echo-8 y a disparu.

Le joueur doit **l'aborder**, **la remettre en service**, découvrir ce qui s'y est passé, puis en faire un **second hub**, fixe et orbital, relié à la colonie.

**Pourquoi un second hub :** le Tantalus reste le hub mobile (équipage, armurerie, déploiements). Asphodèle devient le hub régional : contrôle des relais, ravitaillement de Port-Méridien, liaison indépendante. Qui tient Asphodèle tient les communications de Cocyte : c'est l'outil qui permet d'envoyer le dossier sans passer par la compagnie.

### 7.2 Missions

**Intro**

| ID | Titre | Placement | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `station-intro-silence` | **Six heures de silence** | Après Acte II | Rook rejoue la dernière liaison d'Echo-8 : six heures d'enregistrement casque, puis un bruit dans les conduits et la coupure. Orlov rapproche le dropship. **CIN-70** : la station tourne lentement, feux éteints ; une navette Crucible est amarrée à l'anneau extérieur ; le dropship d'Echo-8 est toujours au sas. | Équipe perdue, enregistrement casque, station abandonnée. |

**Principales**

| ID | Titre | Résumé | Objectif de base | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `station-s1` | **L'arrimage** | Abordage par le dropship d'Echo-8. Barricades de l'équipage disparu, détecteur de mouvement saturé par les ventilateurs. Négocier ou combattre les récupérateurs de Grue, puis atteindre le pont de contrôle. | `board a drifting vessel` | Abordage, détecteur trompeur, station morte. |
| `station-s2` | **La voix de CASSIUS** | Rétablir l'énergie avec Idris Kwan à la radio, puis interroger CASSIUS. Il ne ment pas : il cite ses consignes (quarantaine, priorité cargaison, préservation des actifs). Le joueur récupère les ordres de livraison QZ17 archivés et doit choisir : réécrire ses priorités, le brider ou l'effacer. | `restore atmospheric processing` | Système de bord obéissant, ordres de la compagnie. |
| `station-s3` | **Les ponts scellés** | CASSIUS a scellé les ponts inférieurs. Derrière : le laboratoire de transit des conteneurs, des berceaux QZ17 ouverts, des œufs, et les traces d'Echo-8. Combat en espace confiné, routage d'énergie, sas. | `escape the quarantine` | Laboratoire de la compagnie, œufs, quarantaine. |
| `station-s4` | **Le hub Asphodèle** | Dernière purge, remise en pression, arrivée des premiers occupants : équipe technique du Tantalus, récupérateurs alliés si négociés, colons volontaires. | `hold the extraction zone` | Reprise d'une installation, purge. |

**CASSIUS — trois issues de S2 :**

| Choix | Effet |
| --- | --- |
| **Réécrire ses priorités** (« les vivants d'abord ») | CASSIUS reste au service du hub ; meilleur réseau ; il peut être repris si la compagnie retrouve un accès administrateur. |
| **Le brider** | Fonctions réduites, aucun risque ; certaines annexes indisponibles. |
| **L'effacer** | Station en mode manuel ; ponts inférieurs ouverts à la force, plus dangereux ; perte de ses archives (une pièce du dossier en moins). |

**Interrogatoire de CASSIUS — [PROPOSÉ] (spec 010, 2026-11-22)** : une entrée d'audience sans tir est prête (`station-s2-cassius`, `src/confrontation-entries-v188.js`) : CASSIUS cite cinq consignes (Q-1 quarantaine, P-2 priorité cargaison, A-3 préservation des actifs, journal des personnes, intégrité des journaux) ; Echo-9 lui oppose les pièces détenues (pas les ordres de livraison, récupérés en S2 même). Elle n'est pas encore raccordée ; son issue (`conceded` / `held`) nourrirait la décision existante ci-dessus sans nouvelle option (question Q-010-2).

**Annexes**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `station-a-echo8` | **La dernière ronde d'Echo-8** | ECHO-A, Tamsin Velez | Suivre les marques laissées par Echo-8 : barricades, caches de munitions, dernier enregistrement. Clôt le fil du casier vide. | Équipe perdue, dernier message. |
| `station-a-grue` | **Le pacte de l'anneau** | Grue | Les récupérateurs veulent garder l'anneau extérieur. Accepter (commerce, pièces) ou les expulser. | Récupérateurs de frontière. |
| `station-a-journaux` | **Les journaux de l'équipage** | Asha Mbaye | Rassembler les journaux personnels de l'équipage d'Asphodèle, dont ceux de l'administratrice Solène Ivarsson, et les rendre aux familles de Port-Méridien. | Témoignages d'un équipage disparu. |
| `station-a-hydro` | **La serre** | Jun Park | Remettre en route la serre hydroponique ; elle nourrira la colonie. | Survie technique. |
| `station-a-sonde` | **La balise rouge** | Rook | Une balise UPP dérive près de la station. La récupérer sans incident diplomatique. | Rivalité UPP. |
| `station-a-cassius` | **Ce que CASSIUS a vu** | Inez Harlow | Si CASSIUS est conservé : rejouer ses caméras de la nuit où la quarantaine a été déclenchée. | Caméras de surveillance, système témoin. |
| `station-a-bishop` | **Accès administrateur** | BISHOP-9 | BISHOP-9 détient un code d'accès compagnie à CASSIUS. Le convaincre de le remettre, ou le lui retirer. | Synthétique entre deux loyautés. |

**Locales (rejouables)**

| Contrat | Objectif existant | Effet |
| --- | --- | --- |
| Inspection des conduits | `navigate the vent network` | Sécurité de la station + |
| Relais en dérive | `recover black-box data` | Couverture du réseau + |
| Épave à proximité | `board a drifting vessel` | Alliage, carburant |
| Remise en pression d'un module | `restore atmospheric processing` | Ouvre un module du hub |
| Purge d'un nid | `purge a reactor nest` | Infestation de la station − |
| Récupérer un synthétique | `recover a synthetic` | Main-d'œuvre du hub + |

### 7.3 Le hub Asphodèle — [PROPOSÉ]

| Module | Fonction en jeu | Débloqué par |
| --- | --- | --- |
| **Pont de contrôle** | Carte du réseau QZ, relais à ouvrir, état de Port-Méridien | S4 |
| **Quais d'arrimage** | Navettes vers la colonie et le Tantalus ; commerce Crucible | S1 + *Le pacte de l'anneau* |
| **Laboratoire de transit** | Recherche avancée avec Inez, archives des livraisons | S3 |
| **Serre** | Nourriture pour la colonie | *La serre* |
| **Salle des relais** | Libère les messages retenus ; missions générées sur tout Cocyte ; envoi du dossier à l'ICC | Contrat *Relais en dérive* ×3 |
| **Mémorial** | Noms de l'équipage d'Asphodèle, d'Echo-8 et des colons morts | *Les journaux de l'équipage* |
| **Quartiers** | Installation de recrues et de colons volontaires | Colonie palier *Autonome* |

**Contraintes de production :** un nouveau hub demande des salles, des portes et des parcours vérifiés (`AGENTS.md` : accès logique, passage physique, points d'arrivée, aller-retour, reprise). La Frontier Forge (`docs/forge/`) est le chemin naturel pour construire ces secteurs.

### 7.4 Ce qui s'est passé sur Asphodèle — [PROPOSÉ]

Révélé par morceaux dans S1-S3 et les annexes :

1. Les conteneurs QZ17 arrivaient par navette, passaient par le laboratoire de transit pour contrôle, puis descendaient au dépôt de Cocyte, avec priorité absolue sur le réseau.
2. Un conteneur endommagé s'est ouvert au laboratoire. Le personnel a demandé la quarantaine. CASSIUS l'a appliquée à toute la station, puis à tout Cocyte, et l'a maintenue : aucune consigne ne lui permettait de la lever sans accord de la compagnie.
3. La quarantaine bloquait les départs, mais pas la priorité cargaison : les livraisons vers le dépôt ont continué pendant que les appels de Port-Méridien attendaient.
4. Echo-8, mené par le sergent Dario Kessler, a trouvé des survivants retranchés dans les ponts inférieurs, dont l'administratrice du réseau, Solène Ivarsson, les a barricadés, puis est sorti chercher une issue. Le contact a été perdu à la sixième heure.
5. Les survivants ont tenu quelques jours. Leurs journaux s'arrêtent.

Echo-9 retrouve la plaque du sergent Kessler et le dernier enregistrement de l'équipe. Si la plaque est ramenée au Tantalus, elle est déposée dans le casier vide.

### 7.5 Première version jouable — [PARTIEL] V188 (spec 005, 2026-11-15)

Décisions par défaut appliquées : Q6 (S1-S4 comme missions avant le hub), Q7 (choix CASSIUS définitif), Q103 (feature Spec Kit `specs/005-front-asphodele-quetes/`). Code : `src/station-asphodele-v188.js`, raccordé à `content.js`, `save.js` (`stationV188`), `story-dossier-v188.js` et au Commandement.

- **Accès** : Acte II terminé → quête de Rook « Six heures », dont la fin joue *Six heures de silence* (§8.4) → S1 → S2 → décision CASSIUS → S3 → S4. Les missions verrouillées ne sont pas proposées ; le lancement est refusé avec la raison. Une mission en cours reste reprise.
- **Missions** : `station-s1` à `station-s4` sur Cocyte (`world-05-lethe`), gabarit intérieur de vaisseau, objectifs et registres de §7.2 et §0.3 (Horreur, Tension, Horreur, Action). Le décor est l'intérieur de vaisseau générique : les illustrations de scène de §7.8 ne remplacent pas l'art jouable encore à produire (§29.4). *Mise à jour du 2026-11-22 : niveaux dédiés posés sur ce gabarit, voir §7.10.*
- **Dossier** : S2 donne la pièce *Ordres de livraison archivés par CASSIUS*, même si CASSIUS est effacé ensuite (§5.7.1). S4 rend la condition « Asphodèle reprise » vraie ; la salle des relais vient du hub Asphodèle (`asphodeleRelayReadyV188`), condition lue par l'Acte V (§5.11).
- **Effets CASSIUS [PROPOSÉ]** : réécrit, quarantaine de Cocyte −6 et stabilité +3 ; bridé, quarantaine −3 ; effacé, aucun effet. Les annexes fermées par le bridage n'existent pas encore.
- **Scènes de retour** (S1, S3, S4) et décision CASSIUS : au Commandement, une seule fois, illustrations de `src/content-gap-slots-v188.js` depuis la continuation du 16 novembre 2026 (§7.8), avec repli en primitives Canvas.
- **[PROPOSÉ]** : la consigne qui ferme le sas 3 à 6:00:05 est appliquée par CASSIUS (indice de la quête de Rook) ; les journaux des survivants s'arrêtent au quatrième jour.
- **Fidélité** : aucune fidélité « 1:1 ». Apparence documentée citée dans la spec 005 (détecteur trompé par l'air en mouvement et caméras de casque, *Aliens*, 1986 ; Seegson et son IA qui applique ses consignes, *Alien: Isolation*, 2014). CASSIUS, Asphodèle, Echo-8 et Kessler sont des créations du projet. À définir : décor, interface vocale de CASSIUS, visage de Kessler.
- **Reste à faire** (mis à jour par §7.6 et §7.10) : ~~hub Asphodèle, annexes, contrats, CIN-70 à CIN-72, plaque de Kessler~~ → première version en §7.6 ; ~~niveaux de S1-S4 sur le gabarit générique~~ → niveaux dédiés en §7.10 ; restent les points listés en §7.6 et §7.10.

### 7.6 Hub Asphodèle, missions de la station, contrats — [PARTIEL] V188 (spec 007, 2026-11-15)

Décisions par défaut appliquées : Q22 (A, modules construits dans le moteur du hub), Q23 (A, anneau et rayon en couloirs de profondeur V2, modules en V1, tout parcouru à pied). Feature : `specs/007-hub-asphodele/`. Code : `src/asphodele-hub-v188.js`, `src/asphodele-missions-v188.js`, `src/hub-asphodele-v188.js`, `src/asphodele-hub-slots-v188.js`, `src/station-cinematics-v188.js`.

- **Accès** : après S4. Au hangar du Tantalus, le dialogue d'embarquement de l'UD-4L propose « NAVETTE · STATION ASPHODÈLE » si le Tantalus est en orbite de Cocyte, sans saut en charge ni opération en cours. Arrivée au sas 1 des quais ; retour par le même sas, à la pose d'avant le départ dans le hangar.
- **Pourquoi pas le saut galactique** : la station est dans l'orbite de Cocyte ; un saut coûte 14 jours d'hypersommeil (§13.6). Les quais sont déjà, en §7.3 et §42.2, le lieu des navettes vers le Tantalus.
- **Pièces construites (9)** : quais d'arrimage (V2), anneau extérieur (V2), rayon A (V2), pont de contrôle, salle des relais, laboratoire de transit, mémorial, serre, marché de l'anneau (V1). Les quais restent en profondeur : grand sol d'arrimage, sprites jamais mis à l'échelle.
- **Portes scellées visibles, avec leur raison** : sas 2 (UD-4L d'Echo-8, laissé en place), sas 3 (navette Crucible de Grue), hangar de réparation, quartiers (colonie *Autonome*), infirmerie de station, ponts inférieurs (missions de nuit). Ces quatre modules de §42.2 ne sont **pas** construits.
- **Ouverture des modules** : pont de contrôle et anneau à S4 ; laboratoire à S3 ; mémorial après *Les journaux de l'équipage* ; serre après *La serre* ; marché après *Le pacte de l'anneau* **et** le pacte accepté auprès de Grue aux quais (expulsés : marché fermé) ; salle des relais après trois *Relais en dérive*.
- **Missions annexes (7)** : les identifiants de §7.2, sur Cocyte, gabarit d'intérieur de vaisseau, objectifs existants. **[PROPOSÉ]** : toutes après S4 ; *Ce que CASSIUS a vu* exige CASSIUS réécrit (bridé, ses archives font partie des annexes fermées) ; *Accès administrateur* exige CASSIUS conservé. Objectifs [PROPOSÉ] : `recover black-box data` (Echo-8, balise, caméras), `board a drifting vessel` (Grue), `navigate the vent network` (journaux), `restore atmospheric processing` (serre), `destroy a neuro-link relay` (BISHOP-9).
- **Contrats locaux (6), rejouables** : `station-c-conduits`, `station-c-relais` (*Relais en dérive*, `recover black-box data`), `station-c-epave`, `station-c-pression`, `station-c-nid`, `station-c-synthetique`, objectifs de §7.2. Chaque opération réussie compte une fois. Effets : voir §7.7 (suite du 2026-11-16).
- **Carte du réseau QZ** (pont de contrôle) : liste missions et contrats, avec leurs verrous ; une mission ouverte se planifie et part du hangar du Tantalus. **[PROPOSÉ]** : lancer une opération depuis la station ramène d'abord l'UD-4L au Tantalus.
- **Transmettre** : dans la salle des relais, E sur les baies de transmission les met en ligne. `asphodeleRelayReadyV188(save)` = station reprise ∧ trois *Relais en dérive* ∧ baies en ligne ; `finalChoiceOptionsV188` le lit par défaut. Le choix final et les fins appartiennent à l'Acte V (spec 006).
- **Cinématiques** : CIN-70 (fin de la quête de Rook, avant S1), CIN-71 (après S2, avant la décision), CIN-72 (après S3, avant la scène de retour). Une sauvegarde qui a passé ces moments n'y est pas renvoyée. Lignes [PROPOSÉ].
- **Plaque de Kessler** (§7.4) : après S3, le casier d'Echo-8 du Tantalus propose de la déposer ; elle y pend ensuite. §42.2 cite un « casier de Kessler » au mémorial : interprété comme son nom au mémorial, avec renvoi au casier du Tantalus **[PROPOSÉ, à confirmer]**.
- **Valeurs [PROPOSÉ]** : navette sans coût ; noms du mémorial autres que Solène Ivarsson et Dario Kessler (R. Achterberg, M. Oyelaran, T. Vasquez-Brandt, H. Kowalczyk ; Cpl A. Nwosu, Pvt L. Sato, Pvt J. Merrow) ; répliques de Grue, de CASSIUS au noyau, de Kwan, d'Orlov, de Rook et de Kessler.
- **Sauvegarde** : champ additif `asphodeleHubV188` (lieu, pièce, x, profondeur, pièces visitées, contrats, baies, plaque, pacte). Ancienne sauvegarde : à bord du Tantalus. Lieu « station » sans S4, ou dans un module scellé : ramené au Tantalus ou aux quais.
- **Fidélité** : aucune fidélité « 1:1 ».

| Élément | Apparence documentée (source citée) | Adaptation du projet | À définir |
| --- | --- | --- | --- |
| Quais, coursives, portes | Station Sevastopol, *Alien: Isolation* (2014) : tôles rivetées, bandes jaune-noir, CRT, portes massives | Asphodèle, station Seegson du réseau QZ (création du projet) ; anneau, rayon, moyeu | Décors, portes, props (emplacements `asph-*`) |
| Pont de contrôle | Salle des opérations de Hadley's Hope, *Aliens* (1986) : moniteurs, carte murale | Carte du réseau QZ, noyau de CASSIUS | Interface, voix de CASSIUS |
| CASSIUS | IA Seegson qui applique ses consignes, *Alien: Isolation* (2014) | Création du projet ; CRT verts et une onde, sans visage | Voix, typographie |
| UD-4L | *Aliens* (1986) | Vu au hublot du sas 1 | Image |
| Echo-8, Kessler, Grue, Crucible | — | Créations du projet, silhouettes en primitives | Visages, costumes |

- **Art du hub** : 20 emplacements nommés (`src/asphodele-hub-slots-v188.js`), placeholders en primitives Canvas, 1 m ≈ 51 px ; aucune image générée pour ces emplacements. Les illustrations de scène de §7.8 sont distinctes.
- **Reste à faire** (mis à jour par §7.7) : ~~quartiers, infirmerie, ponts inférieurs et hangar de réparation ; commerce du marché (Q30) ; effets des contrats autres que *Relais en dérive* ; décors de station pour les missions annexes et les contrats~~ → §7.7 ; restent la rotation visuelle de l'anneau en jeu, l'art final et le plan V3 (Q23 B, non retenu).

### 7.7 Modules rouverts, effets des contrats, marché, foules — [PARTIEL] V188 (suite de la spec 007, 2026-11-16)

Décision par défaut appliquée : Q30 (A, économie existante et stock limité par cycle). Code : `src/asphodele-hub-v188.js` (quatre pièces), `src/asphodele-missions-v188.js` (effets, ronde de nuit), `src/asphodele-economy-v188.js` (marché, révision du Cheyenne, quartiers, infirmerie), `src/asphodele-crowd-v188.js` (foules), `src/asphodele-mission-dressing-v188.js` (habillage des missions).

| Module | Vue | Ouverture | Interactions |
| --- | --- | --- | --- |
| **Quartiers** (anneau) | V1 | Port-Méridien au palier *Autonome* (§7.3) | Registre des cabines : équipage et colons ramenés ; installer les volontaires une fois, moral de l'équipage +4 **[PROPOSÉ]** |
| **Infirmerie de station** (pont de contrôle) | V1 | S4 (§42.2) | Lits : le membre le plus blessé est soigné par la règle existante (1 MÉDICAL, 1 h, `treatCrewMember`) ; scanner de quarantaine : infestation de la station |
| **Ponts inférieurs** (pont de contrôle) | V1 | S3 (§42.2), hub actif | Barricades d'Echo-8 (« E-8 05:52 », **[PROPOSÉ]**) ; ronde de nuit : planifie `orig-asphodele-2` *Inspection de nuit* (§39.2, type L, `navigate the vent network`, rejouable) |
| **Hangar de réparation** (quais) | V2 | S4 et une *Remise en pression d'un module* **[PROPOSÉ]** (§7.2 : « ouvre un module du hub ») | Atelier du Cheyenne : révision 1 (600 CR, 30 alliage, −1 carburant par déploiement), révision 2 (1 000 CR, 60 alliage, 8 R&D, −2) **[PROPOSÉ]** |

- **Effets des contrats [PROPOSÉ]**, additifs, appliqués une fois par opération réussie (garde : identifiant d'opération), affichés au compte rendu et sur la carte du réseau QZ : *Inspection des conduits* sécurité de la station +10 (plafond 60) ; *Inspection de nuit* +5 ; la sécurité réduit de 1 point par tranche de 10 le risque des opérations de la station ; *Purge d'un nid* infestation de la station −10 (départ 40) et de Cocyte −3 ; *Récupérer un synthétique* main-d'œuvre +1 (plafond 3), +1 au stock de chaque achat du marché ; *Épave à proximité* +12 alliage, +6 carburant ; *Remise en pression d'un module* ouvre le hangar de réparation.
- **Marché Crucible (Q30 A) [PROPOSÉ]** : pièces de récupération (240 CR → 10 alliage, 3 par cycle), cellules de carburant (200 CR → 8, 3), trousses médicales (180 CR → 3, 2), revente d'alliage (10 → 120 CR, 2). Un cycle est un jour stratégique ; l'alliage se revend deux fois moins cher qu'il ne s'achète : aucune suite d'échanges ne rapporte. Refus nommés (stock épuisé, ressources manquantes au format des refus de `save.js`, opération en cours) ; aucune ressource négative. Armes : non vendues **[À DÉFINIR]**.
- **Foules (§42.2)** : dockers aux quais (4), marchands Crucible et techniciens sur l'anneau (4), techniciens au rayon, au pont de contrôle et au hangar, marchands au marché. Vie des PNJ du hub (`advanceNpcLifeV136`) ; règle de `clearRoomDoorwayPostV188` appliquée aux portes, au sas de l'UD-4L et aux postes muraux. Silhouettes en primitives (1,75 m ≈ 89 px) ; les marchands partent si les récupérateurs sont expulsés. Effectifs **[PROPOSÉ]**.
- **Habillage des missions de la station** : missions annexes, contrats et ronde de nuit gardent la géométrie du gabarit d'intérieur de vaisseau ; une couche de fond y pose des panneaux rivetés, boîtiers CRT, chemins de câbles et panneaux de secteur (« ASPHODÈLE · MOYEU »…) tous les 6 m, une bande de danger coupée à chaque passage, et un élément propre à la mission (enregistreurs, résine, récupération, manomètres, caméra de CASSIUS).
- **Corrections** : l'objectif du Tantalus n'est plus affiché à bord de la station ; la bande de danger des quais s'arrête aux portes ; la passerelle du port affiche un libellé FR/EN au lieu de `UNDOCKED` ; les noms précédés de « ★ » sont traduits.
- **Sauvegarde** : champs additifs de `asphodeleHubV188` (`quartersSettled`, `cheyenne`, `market`, `lastContractOpV188`, compteur `night`) ; une sauvegarde de la spec 007 se charge avec leurs valeurs par défaut.
- **Fidélité** : aucune fidélité « 1:1 ».

| Élément | Apparence documentée (source citée) | Adaptation du projet | À définir |
| --- | --- | --- | --- |
| Coursives des missions | Sevastopol, *Alien: Isolation* (2014) : tôles rivetées, bandes jaune-noir, boîtiers CRT | Station Seegson du réseau QZ, panneaux de secteur | Décors (`asph-msn-*`) |
| Infirmerie | Laboratoires médicaux de Hadley's Hope, *Aliens* (1986) : moniteurs verts | Petite infirmerie de station, arche de scanner | Médecin, art |
| Hangar de réparation | Hangar du *Sulaco*, *Aliens* (1986) : rails de grue, bandes de danger | Atelier du Cheyenne | Vaisseau en réparation, art |
| Dockers, marchands, techniciens | Techniciens de Sevastopol, *Alien: Isolation* (2014) | Silhouettes en primitives | Costumes, visages |

- **Art du hub et des missions** : 22 emplacements ajoutés (42 au total), 1 m ≈ 51 px. La continuation de §7.9 fournit les neuf images `asph-msn-*` de mission ; les 33 emplacements du hub restent en primitives Canvas. Les illustrations de scène de §7.8 constituent un lot distinct.
- **Reste à faire** : art final ; commerce d'armes ; médecin, jardiniers et mécaniciens ; `orig-asphodele-1`, `-3` et `-4` (§39.2) ; rotation visuelle de l'anneau ; plan V3.

### 7.8 Illustrations de scène Asphodèle — [PARTIEL] V188 (continuation du 16 novembre 2026)

À la demande de continuation du propriétaire, six PNG complètent les six emplacements de `src/content-gap-slots-v188.js`, dans `assets/content/v188/`. Ils illustrent les dialogues et les preuves, dans un cadre logique de 640 × 280 px. Les cinq cartes de preuve réservent leurs surfaces au texte, aux nombres et aux graphes dessinés par Canvas en FR/EN ; les primitives restent le repli du chargement.

| Emplacement | Composition du projet | Invariant narratif |
| --- | --- | --- |
| `asphodele-exterior` | Anneau sur rayons autour d'un moyeu sombre, espace noir, gris froid | Feux éteints ; navette Crucible sur l'anneau et dropship d'Echo-8 au sas |
| `cassius-core` | CRT verts et une seule onde, sans visage ni avatar | Quarantaine, priorité cargaison, préservation des actifs ; les consignes sont présentées comme archives, sans imposer l'état de CASSIUS après S2 |
| `echo8-recording` | Écran de capteurs de Rook et onde audio de caméra casque | Fenêtre 05:58 à 06:00, repère de coupure rouge ; les secondes des scènes et de la quête ne sont pas réécrites |
| `order-documents` | Deux feuilles côte à côte sous une lampe, sans logo de compagnie | Articles 2 et 5 de l'Administration, points 4 et 7 de la compagnie ; les quatre citations de la quête (`crew-quests-v188.js`, §8.4) restent exactes en FR/EN |
| `seal-fragment` | Sceau électronique rompu dans un plateau, lentille et lumière froide | Résine sur la face interne, QZ17-04, tampon « ASPHODÈLE · TRANSIT VÉRIFIÉ » ; référence de matière : atlas QZ17 existant |
| `david-memory` | Grille mémoire sur CRT et trois composants de relais | Un secteur cible ; aucun « 3/3 », état de restauration terminé ou effacement des journaux imposé avant l'achèvement de la quête |

**Références et fidélité.** Les matières et la mise en scène prolongent les cartes du lot colonie/équipage, l'UD-4L existant et l'atlas des collectables QZ17. Les références de franchise restent celles de §7.6 et §8.4 ; Asphodèle, CASSIUS, Echo-8, Kessler, Crucible, les deux ordres et les autres preuves sont des créations du projet. Ces illustrations ne certifient pas une reproduction canonique « 1:1 » et n'ajoutent aucun visage de Kessler ni portrait de DAVID-8R.

**Limites conservées.** Ce lot de cartes laissait les 42 emplacements `asph-*` des décors, props et acteurs jouables en primitives ; neuf sont ensuite complétés par §7.9. La carte `cassius-core` ne remplace pas le prop `asph-cassius-core`. CIN-70 à CIN-72 continuent d'utiliser leurs plans Canvas dans `station-cinematics-v188.js` ; la rotation de l'anneau, les poses des personnages et l'art final des niveaux ne sont pas achevés par ce lot. La chronologie de l'enregistrement d'Echo-8 n'est pas modifiée.

Traçabilité : [prompts, références et empreintes des six PNG](../development/ASPHODELE_ART_PROVENANCE_20261116.json), [contrôles et limites](../development/ASPHODELE_ART_QA_20261116.md), [planche des illustrations](../development/ASPHODELE_ART_OVERVIEW_20261116.png), [primitive extérieure de référence](../development/ASPHODELE_ART_PRIMITIVE_REFERENCE_20261116.png).

### 7.9 Objets de mission Asphodèle — [PARTIEL] V188 (continuation du 16 novembre 2026)

La demande de continuation avec fidélité à la franchise produit les neuf PNG de `assets/asphodele/v188/asph-msn-*.png`. Ils remplacent les primitives d'habillage des sept missions annexes, six contrats et de l'inspection nocturne, dans leurs emplacements existants. Les 33 emplacements du hub restent à produire.

| Emplacement | Composition contrôlée | Surface native conservée |
| --- | --- | --- |
| `asph-msn-panel` | Panneau frontal riveté, deux plaques d'accès, bande de danger | Cadre 128 × 112 px |
| `asph-msn-crt` | Boîtier analogique, verre vert sombre, deux boutons | Trois lignes d'état animées ; 51 × 41 px |
| `asph-msn-sign` | Plaque de secteur vide, encadrement ivoire et graphite | Secteur exact FR/EN dans le cadre 153 × 26 px |
| `asph-msn-conduit` | Trois conduits parallèles, huit brides orange | Échelle de 306 × 12 px ; fin de travée rognée sans compression |
| `asph-msn-blackbox` | Trois enregistreurs orange distincts dans leur rack | Libellé QZ exact FR/EN |
| `asph-msn-resin` | Trappe fermée, résine sombre sur sa partie inférieure | Avertissement biologique exact FR/EN |
| `asph-msn-salvage` | Deux caisses de récupération, hauteurs décalées | Libellé Crucible exact FR/EN |
| `asph-msn-gauge` | Trois cadrans analogiques et un volant de vanne | Aiguilles animées alignées sur les pivots ; libellé FR/EN |
| `asph-msn-camera` | Une caméra sans visage, un voyant et un écran vert sombre | Voyant rouge et titre CASSIUS natifs |

Les cinq éléments propres à une mission restent dans un cadre de 153 × 102 px. Le rythme de 306 px, le plafond y = 110, les marges de 18 px autour des portes, échelles, ascenseurs et conduits, ainsi que l'unique élément de mission restent ceux du plan existant. Les images sont dessinées proportionnellement dans une fenêtre source déclarée ; aucun PNG original n'est redimensionné ou réencodé. Les primitives demeurent le repli pendant le chargement et en cas d'échec. Les missions demandent leurs neuf images ; une visite du hub ne les télécharge pas. Le cache runtime admet ces neuf chemins exacts après leur premier chargement public valide.

**Références et portée de la fidélité.** Les images de couloir, de porte et la planche de direction artistique publiées par [Paul Abbott, Lead Environment Artist](https://www.pauldavidabbott.co.uk/alien-isolation), ainsi que les captures de terminal et de zone cargo présentées par [Gary Napper, lead designer](https://www.gamedeveloper.com/design/game-design-deep-dive-the-save-system-of-i-alien-isolation-i-), ont été inspectées et fournies au générateur. Elles fixent les matières et le vocabulaire de construction. Asphodèle, le rack QZ, les caisses Crucible, le module de pression et CASSIUS restent des assemblages du projet. Les images primaires des props précis de Tunde Glover, Liam Tart et Brad Wright n'ont pas été récupérées ; leurs pages textuelles ne certifient donc aucun contour exact. La résine est une adaptation du motif de ruche cité par la bible, sans référence rapprochée primaire inspectée dans cette passe. Ce lot ne revendique pas neuf répliques canoniques « 1:1 ».

Traçabilité : [prompts, références, fenêtres et empreintes](../development/ASPHODELE_MISSION_ART_PROVENANCE_20261116.json), [validation et limites](../development/ASPHODELE_MISSION_ART_QA_20261116.md), [planche des objets intégrés](../development/ASPHODELE_MISSION_ART_OVERVIEW_20261116.png).


### 7.10 Niveaux dédiés des missions S1-S4 — [PARTIEL] V188 (2026-11-22, spec `009-niveaux-station`)

Sur le modèle des niveaux dédiés de la colonie (§6.4), une couche par mission (`src/station-mission-levels-v188.js`, lieux mesurés par `src/station-level-places-v188.js`, emplacements d'art `src/station-level-art-v188.js`) se pose sur le gabarit `ship-interior-vertical` déjà utilisé par S1-S4. Inchangés : identifiants, titres, objectifs de campagne, récompenses, `stationV188`, chaîne d'accès (§7.5), décision CASSIUS (prise une fois au Commandement après S2), scènes de retour, pièces du dossier, condition « Asphodèle reprise ». La rencontre générique (roster, générateur, terminal d'archives) et la cale de cargo procédurale (V2, caisses d'un cargo) laissent place aux phases écrites, en V1. L'intro *Six heures de silence* reste la fin de la quête de Rook et CIN-70, à bord : elle n'a pas de niveau.

Règles communes [PROPOSÉ], reprises du lot colonie : 51 px/m, marine 44 × 92 ; apparition hostile derrière une zone sûre de 900 px (ni derrière une porte fermée ni derrière un cadre scellé), 4 s de grâce ; un checkpoint par phase, écrit à son début (champ de reprise additif `stationLevelV188`) ; interaction maintenue (E) mise en pause par un coup sans remise à zéro.

**Plan de la station sur le gabarit [PROPOSÉ].** Pont inférieur : collier et sas 1 → section de l'anneau → cloison de l'anneau → pont du réacteur → section arrière → cloison arrière → sas extérieur → dropship du Tantalus. Pont médian : galerie de l'anneau, habitation, puits de jonction. Pont haut : passerelle de coque, pont de contrôle. **Parcours vérifié** (accès logique, passage physique) : les conduits sont scellés par la quarantaine (aucune traversée, l'entrée le dit) ; deux cadres scellés prolongent les cloisons sur les ponts supérieurs — cloison de coque au-dessus de la cloison de l'anneau (pont haut), grille soudée sur l'échelle du puits de jonction (pont médian) — si bien que chaque cloison du pont inférieur est le seul passage de sa section, pour le marine comme pour les créatures. Chaque porte fermée par le niveau affiche sa raison (« SAS SANS COURANT · CYCLER À LA MAIN », « SAS 3 SCELLÉ PAR CASSIUS »…).

| Mission | Phases jouées | Valeurs [PROPOSÉ] |
| --- | --- | --- |
| S1 L'arrimage (horreur) | sas d'arrimage sans courant cyclé à la manivelle, dropship d'Echo-8 au collier → anneau éteint (lampe du marine), ventilateurs qui saturent le détecteur, deux traces d'Echo-8 (barricade « E-8 · 05:52 », six traits de craie) → récupérateurs de Grue à la cloison de l'anneau : **négocier** (ils ouvrent) ou **forcer** (ils reviennent armés) → pont de contrôle : alimentation de secours (le reste de la station reste éteint, Kwan prépare S2) → dropship du Tantalus au sas extérieur | manivelle 4 s ; forcer 5 s ; 3 récupérateurs armés si forcé ; anneau : 2 rôdeurs, 1 à la fois ; pont : 3 ; retour : 2 ; obscurité 0,62 puis 0,4 |
| S2 La voix de CASSIUS (tension) | trois disjoncteurs de secteur (quais, galerie de l'anneau, passerelle de coque) avec Idris Kwan à la radio → cloison de l'anneau → réacteur auxiliaire relancé, air en circulation → CASSIUS se réveille au pont de contrôle : **interrogatoire** de la spec 010 (`CASSIUS_INTERROGATION_V188`, cinq consignes citées — quarantaine Q-1, priorité cargaison P-2, préservation des actifs A-3, journal des personnes, intégrité des journaux — auxquelles Echo-9 oppose les pièces du dossier QZ17 ou se tait), ouvert sur la mission en pause, chaque échange enregistré → copie des ordres de livraison QZ17 → extraction ; **la décision reste celle du Commandement** : l'issue de l'interrogatoire ajoute seulement la dernière réponse de CASSIUS au texte de la décision (gagné : il ne s'oppose pas à la réécriture ; perdu : il ne concède rien), sans autre effet | réacteur 5 s ; ordres 3 s ; réveil : 3 drones ; retour : 3 ; interrogatoire : valeurs de la spec 010 (5 échanges, cible 6, crédibilité 3) |
| S3 Les ponts scellés (horreur) | sas 3 selon la décision : réécrit, CASSIUS l'ouvre ; bridé, code manuel ; effacé, forcé à la main, plus dangereux (§7.2) → laboratoire de transit : berceaux QZ17 ouverts de l'intérieur, journaux des survivants arrêtés au quatrième jour, deux œufs (s'ouvrent à l'approche, saut du parasite si l'on reste, brûlables) → routage d'énergie : deux circuits pour trois (sas + éclairage, ou sas + ventilation qui ferme les conduits) → combat confiné à l'arrière, plaque du sergent Kessler et dernier enregistrement → sortie avant la fermeture de la quarantaine (échec « quarantaine refermée », reprise à la phase) | code 3 s, forçage 6 s ; œuf : déclenchement à 100 px (≈ 2 m), 1,5 s, 22 dégâts ; brûler 2 s ; compte à rebours 150 s (remplace le minuteur générique de 105 s) ; arrière : 6 créatures (4 si ventilation), +2 si CASSIUS effacé |
| S4 Le hub Asphodèle (action) | purge du dernier nid au puits de jonction → trois vannes de secteur, remise en pression → tenir le quai, cloison maintenue ouverte pour l'arrimage, jusqu'à la navette de l'équipe technique du Tantalus (Grue selon l'issue de S1, §7.11 ; les colons volontaires de la sauvegarde suivent l'équipe) → extraction au quai | purge 5 s ; vannes 3 s ; tenue 60 s (arrêtée hors du quai), 9 créatures, 4 à la fois, guerriers dans la seconde moitié ; remplace la tenue de zone générique (12 s) |

**Art.** Réemploi déclaré de PNG Asphodèle déjà admis : UD-4L à quai (dropship d'Echo-8 ; adaptation, même modèle que celui du Tantalus), barricade d'Echo-8, noyau de CASSIUS, carte QZ, berceaux, manomètres, résine, technicien, marchand Crucible (récupérateurs), Grue, et l'habillage `asph-msn-*` (panneaux, CRT, chemins de câbles, panneaux de secteur). Dix emplacements restent en primitives Canvas (manivelle, ventilateur, craie, disjoncteur, panneau du réacteur, scellé du sas 3, œuf, journal, plaque, routeur), ainsi que les deux cadres scellés. Aucune image générée.

**Sources et fidélité** (aucune fidélité « 1:1 ») — documenté : stations Seegson et système de gestion qui applique ses consignes, cycle manuel des sas, détecteur trompé par l'air en mouvement, coursives rivetées (*Alien: Isolation*, 2014, station Sevastopol ; direction artistique d'environnement publiée par Paul Abbott, citée en §7.9) ; détecteur de mouvement, caméras de casque, équipe perdue (*Aliens*, 1986) ; œufs et saut du parasite (*Alien*, 1979 ; *Aliens*, 1986) ; nids de résine (*Aliens*, 1986). Adapté par le projet : Asphodèle, CASSIUS, Echo-8, Kessler, Grue et Crucible (créations du projet), laboratoire de transit, routage d'énergie, compte à rebours de S3, issue des récupérateurs. À définir : art des emplacements en primitives, voix de CASSIUS et de Kwan.

**Reste à faire.** Art des dix emplacements en primitives et des deux cadres scellés ; voix ; annexes, contrats et ronde de nuit gardent leur gabarit générique et leur habillage (§7.7). L'issue des récupérateurs de S1, le collier en profondeur, les colons volontaires de S4 et les noms des zones sont traités au §7.11 (décisions du 23 novembre 2026).

### 7.11 Décisions du 23 novembre 2026 : collier en profondeur, récupérateurs, colons, noms des zones — [PARTIEL] V188

Quatre décisions du propriétaire (questions S9-1, S9-2 et S9-5 du document des questions, plus les libellés de zone), appliquées sur la couche du §7.10. Identifiants, objectifs, récompenses, chaîne d'accès et décision CASSIUS inchangés. Toutes les valeurs sont **[PROPOSÉ]** ; les figures et objets restent des substituts Canvas ou des PNG déjà admis (aucune image générée).

**S9-1 — Le collier d'arrimage de S1 en profondeur.** Le sas d'arrimage de S1, du début du plancher du collier à la cloison du quai (≈ 16,5 m), devient un couloir de profondeur 2,5D sur le modèle de C1 (`colony-c1-port-corridor`) : définition `station-s1-docking-collar` (`src/depth-hold-sections-v188.js`), W/S pour avancer et reculer, tirs dans le couloir du tireur. Le dropship d'Echo-8 reste au collier, derrière la baie du mur ; l'équipe perdue a laissé trois objets sur le plancher (fûts devant la baie, palette de caisses « E8 » près de l'échelle, caisse médicale scellée avant le sas ; emplacements d'art des cales déjà livrés). Le reste de S1 (anneau, pont du réacteur, pont de contrôle) reste en vue de côté. Le monte-charge du collier repose au niveau du pont pendant toute la mission (la station est sans courant) ; l'échelle reste. Liste de contrôle du niveau : accès logique inchangé (`stationAccessV188`) ; passage physique vérifié sur grille (aucune poche, couloirs de 20 unités, les deux extrémités atteintes sur le rail) ; arrivée sur le rail, sur une case libre ; la manivelle, comme le sas, ne se manœuvre que contre la paroi (ni invite ni progression depuis les couloirs avant ; s'écarter met la manivelle en pause sans la remettre à zéro) ; aller-retour par le sas cyclé (profondeur nulle dans l'anneau, retrouvée au retour) ; reprise : phase, checkpoint et profondeur du marine restaurés. Un checkpoint par phase après la première, qui commence à l'insertion.

**S9-2 — L'issue des récupérateurs de S1 est enregistrée.** Champ additif `stationV188.s1Salvagers` (`negotiated` ou `forced`), absent tant que S1 n'a pas été réussie avec ce niveau ; écrit une seule fois, par la première réussite de S1 (une relecture de la mission ne le réécrit pas) ; normalisé par `normalizeStationV188`, validateur de `src/save.js` inchangé. S4 lit d'abord cette issue (`stationGrueAtDockV188`) ; la décision de la colonie « Le prix de Grue » (`colonyMissionsV188.grue`, §6.2) ne compte qu'après une cloison forcée, ou quand rien n'a été enregistré :

| Issue de S1 | Prix de Grue (colonie) | Grue au quai de S4 | Effet |
| --- | --- | --- | --- |
| Négociée | accepté, refusé ou non décidé | **Alliée** | Ses récupérateurs couvrent le quai : la tenue passe de 9 à 6 créatures, 3 à la fois au lieu de 4 ; deux récupérateurs se tiennent à la cloison du quai ; Grue monte à bord avec l'équipe technique. L'accord de l'anneau est le sien, pas celui de la colonie : un prix refusé ne le rompt pas |
| Forcée | refusé ou non décidé | **Hostile** | Deux récupérateurs armés prennent la 2ᵉ et la 5ᵉ place de la tenue (9 arrivées en tout), derrière la zone sûre et après la grâce ; elle ne monte pas à bord |
| Forcée | accepté | **Absente** | Le commerce avec la colonie continue, personne ne vient au quai ; tenue inchangée (9 créatures) |
| Non enregistrée (S1 terminée avant ce champ) | accepté | **Présente** | Comportement antérieur : elle monte à bord avec l'équipe, sans aide pendant la tenue |
| Non enregistrée | refusé ou non décidé | **Absente** | Comportement antérieur |

Pendant la tenue, Grue parle une fois à la radio (alliée ou hostile). Correction trouvée en écrivant ces règles : une apparition dont l'écart de vague tombait derrière la cloison de l'anneau fermée était abandonnée, si bien que la tenue de S4 ne recevait que deux de ses neuf créatures tant que cette cloison restait fermée ; elle apparaît désormais au bord de la zone sûre, du côté des marines.

**S9-5 — Les colons volontaires arrivent au quai.** À la fin de la tenue, les colons volontaires de Port-Méridien entrent par le collier derrière l'équipe technique et se rangent sur le quai. Leur nombre est celui de la sauvegarde (`colonyMissionsV188.population`, les volontaires des quêtes et missions du §6.4) ; six silhouettes au plus sont dessinées, le texte d'arrivée donne le nombre réel ; aucun colon si le compte est nul. Emplacement d'art `station-volunteer-colonist` en primitive Canvas (trois teintes de vêtement de travail) : la silhouette définitive reste à produire.

**Noms des zones.** Le gabarit de vaisseau nommait ses zones « Tube d'amarrage », « Soutes dépressurisées », « Puits d'ingénierie », « Pont d'habitation », « Passerelle », « Sas arrière » ; ces noms apparaissaient sur les plaques des cloisons, la ligne de zone et le plan local de S1-S4. Ils sont remplacés, pour ces quatre niveaux seulement, par ceux de la station (identifiants de zone inchangés ; annexes et contrats gardent les noms du gabarit) :

| Zone du gabarit | S1, S2 | S3 | S4 |
| --- | --- | --- | --- |
| `ship-docking` | Collier d'arrimage / *Docking collar* | Palier du sas 3 / *Airlock 3 landing* | Quai d'arrimage / *Docking quay* |
| `ship-cargo` | Anneau extérieur / *Outer ring* | Laboratoire de transit / *Transit laboratory* | Anneau extérieur |
| `ship-engineering` | Pont du réacteur / *Reactor deck* | Routage d'énergie / *Power routing* | Pont du réacteur |
| `ship-habitation` | Quartiers d'habitation / *Habitation quarters* | idem | idem |
| `ship-command` | Pont de contrôle / *Control deck* | idem | idem |
| `ship-extraction` | Sas extérieur / *Outer airlock* | Sortie des ponts inférieurs / *Lower decks exit* | Sas extérieur |

**Fidélité** (aucune fidélité « 1:1 »). Documenté : collier et sas d'arrimage d'une station Seegson, appareil resté amarré (*Alien: Isolation*, 2014) ; UD-4L (*Aliens*, 1986). Adapté par le projet : le collier d'Asphodèle et ce qu'Echo-8 y a laissé, Grue et ses récupérateurs, l'accord de l'anneau, les volontaires de Port-Méridien, tous les noms de zone. À définir : silhouette des colons, art des objets du collier propres à la station (ceux des cales sont réemployés).

**Reste à faire.** Art dédié du collier et des colons ; comportement d'alliés armés pour les récupérateurs (aujourd'hui leur aide réduit la vague, ils ne tirent pas) ; équilibrage de la tenue après playtest (S9-4) ; une scène de retour qui cite l'issue de S1.

---

## 8. Quêtes du Tantalus — [PROPOSÉ]

> **État V188 (lot colonie et équipage, 2026-11-16) — [PARTIEL].** Les 16 quêtes de l'équipage du §8.1 sont jouables (§8.4 et §8.5). La vie à bord (§8.2) et les recrues (§8.3) restent à faire.

Elles utilisent le système de rapport existant (`npc-dialogue-v62.js`) : confiance `fragile → prudent → operationnel → solide`, choix de rapport `request-candid-assessment`, `acknowledge-welfare`, `review-mission`, `confirm-alert-role`, `request-infestation-evidence`, renouvellement après 8 heures de jeu. Aucune récompense avant la preuve de réalisation.

### 8.1 Quêtes de l'équipage

| ID | Personnage | Titre | Après | Résumé | Effet | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- |
| `ship-vega` | Mara Vega | **La ligne de commandement** | Acte II | Relire avec elle l'ordre de l'Administration et la consigne de la compagnie, et marquer où ils se contredisent. | Influence la décision de l'Acte V | Chaîne de commandement contre contrat. |
| `ship-velez` | Tamsin Velez | **Ceux d'Echo-8** | Prologue | Elle connaissait l'équipe perdue. Battre ses temps au pas de tir, puis l'écouter parler d'eux. | Dotation d'assaut | Marines qui perdent des camarades. |
| `ship-echo-a` | ECHO-A | **Deux relèves** | S3 | Il était affecté à Echo-8. Comparer ses protocoles avec le dernier enregistrement de l'équipe. « Quand tu seras remplacé, qui remarquera ? » | Réplique d'épilogue | Synthétique et valeur d'une vie. |
| `ship-david` | DAVID-8R | **Mémoire récupérée** | Acte I | Trois composants trouvés en mission restaurent un secteur de sa mémoire : il a servi sur un poste du réseau QZ avant sa récupération. | Pièce optionnelle du dossier | Synthétique effacé, mémoire de la compagnie. |
| `ship-mbaye` | Asha Mbaye | **Les noms de Port-Méridien** | Acte II | Compléter la liste des colons disparus avec les registres des relais. | Population de la colonie + | Colons disparus. |
| `ship-sorensen` | Leila Sørensen | **La route des fermes** | C2 | Cartographier une route de survie entre le port et les fermes éloignées. | Route alternative Acte V | Survie en terrain hostile. |
| `ship-okafor` | Noor Okafor | **Le registre des pertes** | Acte III | Ramener les plaques des colons morts trouvées en mission. | Infirmerie de la colonie + | Les morts que la compagnie ne compte pas. |
| `ship-bishop` | BISHOP-9 | **Directive de préservation** | Interlude | Lui demander ce qu'il ferait si la directive et la vie d'un membre de l'équipage s'opposaient. Réponse selon la confiance. | Restaure la confiance perdue | Directive de synthétique. |
| `ship-harlow` | Inez Harlow | **Le sceau** | Acte I (quarantaine) | Analyser le fragment QZ17-04 : résidu biologique, film de résine. | Recherche, pièce du dossier | Analyse xénobiologique. |
| `ship-doyle` | Sanaa Doyle | **Les sentinelles** | C1 | Récupérer des tourelles sentinelles (« Sentry Gun » au catalogue) dans un poste de sécurité abandonné. | Chantier Murs et sas + | Tourelles sentinelles. |
| `ship-reyes` | Pablo Reyes | **La charge de trop** | Acte III | Il a fait sauter un accès trop tôt lors d'une évacuation passée. Retrouver le registre de cette opération. | Charges de brèche | Culpabilité de Marine. |
| `ship-mercer` | Cal Mercer | **Remettre le M577 en état** | Acte III | Réparer le blindé ; l'état du M577 au bilan existant sert de départ. | Blindage Acte V | APC. |
| `ship-orlov` | Maksim Orlov | **Fenêtre de tir** | Acte IV | Récupérer les enregistreurs du transport Kappa : pourquoi a-t-il mis si longtemps ? | Fenêtre d'extraction + | Dropship, extraction. |
| `ship-kwan` | Idris Kwan | **Le réacteur ne ment pas** | Prologue | Réparer le réacteur (`service:power`) ; il note une consommation inexpliquée au pont de quarantaine. | Indice de l'interlude | Systèmes de bord. |
| `ship-park` | Jun Park | **Après les conduits** | Interlude | Jun craint les conduits depuis l'incident. Les sécuriser avec lui. | Moral, oxygène | Conduits. |
| `ship-rook` | Rook | **Six heures** | Acte II | Il a perdu le signal d'Echo-8. Nettoyer l'enregistrement avec lui, seconde par seconde. | Débloque `station-intro-silence` | Enregistrement casque, signal perdu. |

### 8.2 Vie à bord

| ID | Titre | Lieu | Résumé |
| --- | --- | --- | --- |
| `ship-mess` | **Repas de relève** | Mess | Réunir quatre membres au même service ; scène collective qui change à chaque acte. |
| `ship-cryo` | **Le casier vide** | Baie cryo | Fil d'Echo-8, relancé par un indice à chaque acte ; se ferme avec S3. |
| `ship-sensor` | **Écoute de nuit** | Capteurs | Pendant la phase `break`, capter des messages retenus par le réseau QZ ; chaque fragment ajoute un nom à *Les noms de Port-Méridien*. |
| `ship-armory` | **Inventaire contradictoire** | Armurerie | Le registre ne correspond pas aux râteliers. Petite enquête qui forme aux méthodes de l'Acte II. |
| `ship-vehicle` | **Les plaques du M577** | Baie véhicules | Une plaque d'un ancien équipage, trouvée dans le blindé. |
| `ship-bioforge` | **Ce qu'on garde en vie** | Bioforge | Débat Inez / BISHOP-9 sur la conservation des spécimens ; ouvre l'accès narratif à la Bioforge. **[PARTIEL]** : quête jouable depuis le 23 novembre 2026 comme face-à-face sans tir (§8.6) ; portraits en substituts Canvas. Le laboratoire de confinement (spec 013, 2026-11-22) affiche le protocole décidé au stockage froid et sous la file d'admission ; la présence d'Inez et de BISHOP-9 dans la galerie d'observation derrière verre blindé reste **[À DÉFINIR]**. |

### 8.3 Recrutement

| Recrue | Titre | Front | Résumé |
| --- | --- | --- | --- |
| **Mara Voss « RIVET »** | **Le même nom** | Station | Ancienne du chantier orbital ; elle répare la station. Elle porte le nom du contremaître I. Voss : **lien familial validé (2026-11-05)**. Elle rejoint l'équipage pour prouver que son parent n'a pas signé à 18:43 ; son recrutement débloque une pièce de contexte sur I. Voss. |
| **Nadia Bensaïd « SUTURE »** | **Pas de blessé sans extraction** | Colonie | Venue d'une colonie isolée ; rejoint l'équipage quand Port-Méridien atteint *Rétablie*. |
| **Jonas Reed « BASTION »** | **Sécurité embarquée** | Enquête | Ancien agent de sécurité de cargos ; il a convoyé des scellés QZ17 sans savoir ce qu'ils contenaient. Témoignage au dossier. |
| **Jun Seo « BALISE »** | **Itinéraires terrestres** | Colonie | Connaît les routes de convoi ; le recruter avant l'Acte III facilite le corridor. |

### 8.4 Premières quêtes jouables — [PARTIEL] V188 (spec 005, 2026-11-15)

Décision par défaut Q9 : DAVID-8R, Harlow, Rook et Vega. Code : `src/crew-quests-v188.js`, sauvegarde `crewQuestsV188`. Le personnage propose sa quête dans la conversation du hub, après les six choix de rapport qui ne changent pas ; le Commandement liste les quêtes et où trouver chaque donneur. Une mauvaise lecture ne coûte rien et ne paie rien.

| Quête | Ouverture | Preuve | Effet [PROPOSÉ] |
| --- | --- | --- | --- |
| `ship-rook` Six heures | Acte II | Trois passages de l'enregistrement lus correctement (ventilation, sas 3 côté laboratoire, sas fermé par la station) | Loyauté +5 ; joue *Six heures de silence* et ouvre S1 |
| `ship-vega` La ligne de commandement | Acte II | Deux contradictions relevées, puis la ligne choisie | Loyauté +10 (Administration) ou +4 (compagnie) ; sert le seuil 55 de l'Acte V |
| `ship-harlow` Le sceau | Acte I et preuve de la piste (sceau ou berceau) | Joint ouvert de l'intérieur ; tampon « Asphodèle · transit vérifié » | Loyauté +5, recherche +6 |
| `ship-david` Mémoire récupérée | Acte I | Trois composants, un par opération réussie sur Cocyte | Loyauté +5 ; note « poste de relais QZ-9 » jointe au dossier, hors décompte des 7 pièces |

Fidélité : la quête de Vega reprend un thème documenté, la consigne de la compagnie qui passe avant l'équipage (« Special Order 937 », *Alien*, 1979, scène de MU/TH/UR) ; les deux ordres sont des textes du projet. Reste : la vie à bord (§8.2) et les recrues (§8.3) ; les 12 autres quêtes sont au §8.5.

**Illustrations (continuation du 16 novembre 2026).** Les quatre cartes de Rook (`echo8-recording`), Vega (`order-documents`), Harlow (`seal-fragment`) et DAVID-8R (`david-memory`) sont produites dans le lot de six de §7.8. Les preuves et libellés exacts restent natifs FR/EN ; aucune nouvelle seconde de coupure, décision ni résultat de quête n'est figé dans les PNG. Les poses de dialogue, objets animés et décors jouables restent des besoins distincts.

### 8.5 Les douze autres quêtes — [PARTIEL] V188 (lot colonie et équipage, 2026-11-16)

Code : `src/crew-quests-tantalus-v188.js` (données), lues par `src/crew-quests-v188.js` (mêmes règles et même sauvegarde `crewQuestsV188`, champ additif `mark` pour une preuve). Proposées dans la conversation du hub ; listées à la table tactique (16 quêtes). Conseillers de l'Acte V d'abord (Sanaa, Cal, Orlov, Leila : leur avantage au conseil demande une loyauté ≥ 75). Une mauvaise lecture ne coûte rien ; rien n'est payé avant la preuve ; chaque quête paie une fois. Preuves, lectures, répliques et valeurs [PROPOSÉ].

| Quête | Ouverture | Preuve | Effet [PROPOSÉ] |
| --- | --- | --- | --- |
| `ship-doyle` Les sentinelles | après C1 | 2 tourelles, une par opération réussie sur Cocyte | loyauté +12 ; Murs et sas +1 niveau ; « Portable Sentry » à l'inventaire |
| `ship-mercer` Remettre le M577 en état | convoi du M577 | 3 pièces, une par opération réussie sur Cocyte | loyauté +12 (blindage de l'Acte V à 75) |
| `ship-orlov` Fenêtre de tir | Acte IV | enregistreurs du Kappa : créneau réservé au fret, même priorité QZ17 que QZ-18 | loyauté +12 (fenêtre de l'Acte V à 75) |
| `ship-sorensen` La route des fermes | après C2 | relevés : baliser le sentier sous le pont, passer par la rivière | loyauté +12 (route de l'Acte V à 75) |
| `ship-velez` Ceux d'Echo-8 | prologue | **nouvelle qualification M41A au pas de tir** après acceptation (reçu du pas de tir V81), puis les marques de Kessler | loyauté +8 ; dotation d'assaut : « Ammo Satchel » à l'inventaire |
| `ship-echo-a` Deux relèves | S3 | protocole 4.2 contre le choix de Kessler (sas 3, survivants) | loyauté +8 ; **réplique d'épilogue** dans la conversation de l'épilogue de l'Acte V |
| `ship-mbaye` Les noms de Port-Méridien | Acte II | appels de la ferme 12 retenus à QZ-18, position au hameau de la balise | loyauté +6 ; 2 volontaires pour la colonie |
| `ship-okafor` Le registre des pertes | convoi du M577 | 3 plaques, une par opération réussie sur Cocyte | loyauté +6 ; Infirmerie +1 niveau |
| `ship-bishop` Directive de préservation | Interlude résolu | question posée ; la réponse dépend de la confiance (≥ 55 : franche, sinon réservée) | loyauté +10 |
| `ship-reyes` La charge de trop | convoi du M577 | registre : civils coupés à 13:58, ordre à 14:01, charge à 14:02 | loyauté +8 ; grenades « M40 HEDP » à l'inventaire (charges de brèche adaptées) |
| `ship-kwan` Le réacteur ne ment pas | prologue | **service du réacteur** (`service:power`) utilisé après acceptation, puis les relevés du pont 2 | loyauté +6 ; recherche +4 ; indice de l'Interlude noté à la table |
| `ship-park` Après les conduits | Interlude résolu | une mission réussie dans un réseau de conduits | loyauté +6 ; stress de l'équipage −8 ; oxygène du bord +10 |

**Adaptations.** « Battre ses temps au pas de tir » devient : réussir une nouvelle qualification M41A après avoir accepté (le pas de tir ne garde pas de chronomètre par escouade). Les « charges de brèche » de Reyes sont des grenades M40 HEDP du catalogue (aucune charge de brèche n'y existe). Les composants de Mercer, Doyle et Okafor viennent d'opérations réussies sur Cocyte, comme ceux de DAVID-8R. La loyauté gagnée ne suffit pas seule pour Sanaa (56 + 12) : les choix de rapport du §8 complètent.

**Fidélité.** Aucune fidélité « 1:1 ». Repères documentés : tourelles sentinelles UA 571-C (*Aliens*, édition spéciale, 1991) ; M577 et détecteur de mouvement (*Aliens*, 1986) ; lance-grenades U1 du M41A (*Aliens*, 1986 ; désignation M40 HEDP du *Colonial Marines Technical Manual*, 1995) ; directive d'un synthétique de la compagnie, thème de « Special Order 937 » (*Alien*, 1979). Adaptations du projet : Echo-8, Kessler, transport Kappa, ferme 12, registres, relevés du réacteur. Les 11 illustrations de quête sont désormais produites et chargées à la demande par `colony-crew-slots-v188.js` (continuation du 16 novembre 2026). Les heures, quantités, graphes et itinéraire restent dessinés par le jeu en FR/EN, indépendamment des PNG. Les poses de dialogue restent à définir.

**Reste à faire.** Vie à bord (§8.2, dont *Écoute de nuit* et *Le casier vide* comme fil de quête ; *Ce qu'on garde en vie* est jouable, §8.6), recrues (§8.3, dont Nadia Bensaïd à *Rétablie*), effets sur la course APC dédiée de l'Acte V.

### 8.6 « Ce qu'on garde en vie » (`ship-bioforge`) — [PARTIEL] V188 (décision du 23 novembre 2026)

Première quête de la vie à bord (§8.2) qui soit jouable. Elle ouvre l'accès narratif à la Bioforge et se joue comme un face-à-face sans tir (spec 010, §5.6) : nouvelle entrée de données `ship-bioforge-care` du même système, aucune règle d'échange changée. Code : `src/confrontation-entries-v188.js` (entrée), `src/crew-quests-tantalus-v188.js` (quête), `src/crew-quests-v188.js` (ouverture, clôture, accès, protocole), `src/confrontation-ui-v188.js` (portraits), `src/app.js` (porte de la Bioforge), `src/bioforge-lab-*-v188.js` (affichage du protocole). Tous les arguments, relevés, répliques, valeurs et les deux protocoles sont **[PROPOSÉ]**.

**Déroulé.** À la première visite, devant le sas de la Bioforge, Inez Harlow barre le passage à BISHOP-9 : il veut garder les spécimens en vie entre deux sessions, elle veut tout brûler après étude. Le joueur peut écouter ou remettre à plus tard (la porte reste alors fermée, sans temps de bord dépensé). BISHOP-9 expose cinq raisons, une par échange ; Inez écoute. Echo-9 répond à chacune par un relevé du bord, par une pièce du dossier QZ17 qu'il détient, ou laisse passer : **chaque argument laissé debout compte pour BISHOP-9**. Le débat ne se perd pas : il se pèse.

| Échange | BISHOP-9 cite | Réponse décisive (+2) | Réponse partielle (+1) |
| --- | --- | --- | --- |
| 1 | Protocole scientifique : un spécimen vivant répond à ce qu'un tissu mort ne dit pas | Journal des purges de la cellule (relevé du bord) | Relevé de consommation nocturne |
| 2 | Consigne de confinement : la cellule tient | Fragment de sceau ou berceau ouvert (Acte I) | Compteur du stockage froid (relevé du bord) |
| 3 | Sa directive de préservation | Directive de préservation de BISHOP-9 (Interlude) | Journal des purges |
| 4 | Conserver ne coûte rien | Relevé de consommation nocturne du pont de quarantaine (relevé du bord ; l'indice de la quête de Kwan, §8.5) | Compteur du stockage froid |
| 5 | Aucun blessé par un spécimen conservé | Berceaux et cocons du dépôt (Acte IV) | Fragment de sceau |

Trois relevés du bord sont toujours disponibles (ce ne sont pas des pièces du dossier : ils ne comptent pas dans les 7 pièces du §5.7) ; les trois pièces du dossier suivent la sauvegarde. Seuil 5, crédibilité 3 : les trois relevés, chacun placé au bon échange, suffisent tout juste ; une pièce du dossier donne de la marge ; une réponse hors sujet coûte un point de crédibilité, le silence ne coûte rien.

**Issue enregistrée** (additive, aucun champ nouveau à la racine de la sauvegarde) : le déroulé dans `storyCampaignV188.confrontationsV188['ship-bioforge-care']`, la réponse de la quête dans `crewQuestsV188.quests['ship-bioforge'].answer`.

| Issue | Protocole | Effets (valeurs existantes seulement) | Texte dans le laboratoire |
| --- | --- | --- | --- |
| Seuil atteint (`limit`) | **Protocole Harlow** : étude pendant la session, puis incinération ; rien n'est gardé en vie | Loyauté d'Inez Harlow +5 ; stress de tout l'équipage −2 | « PROTOCOLE HARLOW · ÉTUDE, PUIS INCINÉRATION » au stockage froid, plaque sous la file d'admission |
| Seuil non atteint (`keep`) | **Protocole BISHOP-9** : conservation sous scellés entre les sessions, sous la clé d'Inez | Loyauté de BISHOP-9 +5 ; recherche +6 | « PROTOCOLE BISHOP-9 · CONSERVATION SOUS SCELLÉS » |

Conséquence morale, pas mécanique : les règles de session de la Bioforge, ses compteurs, sa purge et ses admissions V132 ne changent pas ; aucune fin n'est ajoutée ni modifiée ; aucune pièce du dossier n'est accordée. La loyauté de BISHOP-9 compte déjà ailleurs (sa réponse sur la directive, §8.5).

**Accès.** La Bioforge s'ouvre dès que le débat est tranché, quelle qu'en soit l'issue. Une sauvegarde qui a déjà utilisé la Bioforge (au moins une session créée) garde son accès ; Inez propose alors le débat dans sa conversation du hub, sans refermer la porte. Un débat interrompu (rechargement) reprend à l'argument suivant, à la porte ou auprès d'Inez. Le lanceur de scènes de développement ouvre la vue directement (hors parcours joueur).

**Portraits.** Substituts Canvas, sans ressemblance d'acteur : BISHOP-9 en buste de synthétique (traits réguliers, col de laboratoire, un voyant d'état) devant les cuves ; Inez Harlow en petit buste de scientifique (blouse, lunettes relevées) sous les jauges. Emplacements nommés `confrontation-bishop9-bust` et `confrontation-harlow-bust` ; les portraits définitifs restent à produire.

**Fidélité** (aucune fidélité « 1:1 »). Documenté : le synthétique qui protège un spécimen contre l'équipage (*Alien*, 1979) ; la compagnie qui veut des spécimens ramenés vivants (*Aliens*, 1986) ; des spécimens élevés et observés derrière une vitre (*Alien Resurrection*, 1997). Adapté par le projet : BISHOP-9, Inez Harlow, la Bioforge, ses protocoles, tous les arguments et relevés. À définir : portraits, voix, présence des deux personnages dans la galerie d'observation.

**Reste à faire.** Portraits et voix ; les deux personnages dans le laboratoire (galerie d'observation, §8.2) ; un effet de jeu du protocole au-delà du texte, s'il est souhaité (question B7).

---

## 9. Opérations secondaires

Classement d'après le registre courant `special-operations-v131.js`, utilisé par `app.js`. Il complète le registre historique `special-operations-v67.js`, dont les anciens statuts `missing` ne décrivent pas les chapitres V131 aujourd'hui raccordés. Les placements narratifs restent proposés.

### 9.1 Liées à Cocyte

| Opération | Statut | Place | Accroche [PROPOSÉ] | Ancrage Alien |
| --- | --- | --- | --- | --- |
| **Cargo Brutal** | Chapitre **[EXISTANT]** / art Matriarche **[PRÉSENT]** | Avant Acte I | Un cargo civil en route vers Port-Méridien transporte un conteneur QZ17 mal scellé. Quatre planches dédiées et seize poses sont intégrées depuis la continuation V188 du 17 novembre 2026 ; design original du projet. | Cargo infesté. |
| **Systèmes de survie Alien** | **[EXISTANT]** effective | Entre Actes I et II | Évasion d'un poste médical en quarantaine près du port ; mécaniques réutilisées dans l'interlude et S3. | Auto-destruction, soudure, acide. |
| **Doctrine Alpha / Bravo** | **[PARTIEL]** | Avant C1 ou C5 | Défense de colonie à cinq routes, quatre membres minimum : tenir Port-Méridien. | Escouade de Marines. |

Opération Abysse Noir et Broodstorm sont désormais placés dans la campagne annexe 1 (§14).

### 9.2 Opérations intégrées aux campagnes annexes

Les chapitres Mire Archive 001, Protocole Z-110, Jeri, Éloïse, A.T.A.X.-Q, Le chant de la Reine-Mère, Talos contre le Titan, LV-XENO, Pangaea, Opération Abysse Noir et Broodstorm sont tous **[PARTIEL]** et `playable: true` dans `special-operations-v131.js`, raccordés par `content.js`, avec des limites d'art dédié ou de campagne étendue. Ils ne sont plus classés comme « archives MIRE » : chacun prend place dans une campagne annexe de la Partie II (tableau §13.4). Leur `worldId` actuel (`world-05-lethe`) ne change pas tant que le déplacement proposé n'est pas réalisé dans les données.

---

## 10. Cinématiques

| ID | Titre | Partie | Durée | Statut |
| --- | --- | --- | --- | --- |
| CIN-00 | Ouverture | Titre | 60-75 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-01 | Le casier vide | Prologue | 20 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-02 | Le briefing | Prologue | 45 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-03 | Descente sur Port-Méridien | Prologue | 33 s | [EXISTANT] V188 (placeholder Canvas) ; [PROPOSÉ] §56.11 |
| CIN-10 | Les quais déserts | Acte I | 30 s | [EXISTANT] V188 |
| CIN-11 | Ouvert de l'intérieur | Acte I | 25 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-20 | Treize minutes | Acte II | 40 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-21 | Le quai nord | `story-quai-nord` | 25 s | [PROPOSÉ] |
| CIN-31 | Le sas refermé | Acte III | 30 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-40 | Jun Park ne répond plus | Interlude | 30 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-41 | Ce que BISHOP-9 savait | Interlude | 45 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-50 | Les dernières images | Acte IV | 35 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-51 | Contrôle biologique | Acte IV | 25 s | [EXISTANT] V188 (placeholder Canvas) |
| CIN-59 | L'atterrissage | `story-recuperation` | 20 s | [PROPOSÉ] |
| CIN-60 | Dernier départ | Acte V | 30 s | [PROPOSÉ] |
| CIN-61 | Les portes du port | Acte V | 45 s | [PROPOSÉ] |
| CIN-70 | Six heures de silence | Station | 40 s | [EXISTANT] V188 (placeholder Canvas, §7.6) |
| CIN-71 | La voix de CASSIUS | Station S2 | 40 s | [EXISTANT] V188 (placeholder Canvas, §7.6) |
| CIN-72 | Le dernier enregistrement d'Echo-8 | Station S3 | 30 s | [EXISTANT] V188 (placeholder Canvas, §7.6) |
| CIN-60 | Dernier départ | Acte V | 30 s | [EXISTANT] V188 (placeholder Canvas, §5.11) |
| CIN-61 | Les portes du port | Acte V | 45 s | [EXISTANT] V188 (placeholder Canvas, §5.11) |
| CIN-70 | Six heures de silence | Station | 40 s | [PROPOSÉ] |
| CIN-71 | La voix de CASSIUS | Station S2 | 40 s | [PROPOSÉ] |
| CIN-72 | Le dernier enregistrement d'Echo-8 | Station S3 | 30 s | [PROPOSÉ] |
| CIN-73 | Le moyeu | `story-moyeu` | 20 s | [PROPOSÉ] |
| CIN-80 | Premières lumières | Colonie, palier *Rétablie* | 30 s | [PROPOSÉ] |
| CIN-90 | Fins (×3) | Épilogue | 60 s | [EXISTANT] V188 (`cin-90-relay`, `cin-90-freight`, `cin-90-living`, placeholder Canvas) |
| CIN-92 | Ce que le retour devra raconter | Épilogue | 49 s | [EXISTANT] V188 (placeholder Canvas) ; identifiant [PROPOSÉ] |
| Générique | A fan game by Darknigthmare | Fin | 24 s | [EXISTANT] V188 (`cin-99-credits`) ; identifiant [PROPOSÉ] |

**Contraintes :** séquences scriptées dans le moteur Canvas 2D (plans fixes, parallaxe, panoramiques, cadres de dialogue avec portraits `npc-dialogue-portraits-v168.js`), pas de vidéos précalculées. Toutes passables et relisibles ; aucune récompense liée à leur affichage. Musique et sons originaux uniquement.


### 10.1 Insertion et extraction : tableau de fidélité (V188, 2026-11-15)

Séquences d’insertion et d’extraction de mission (Tantalus ↔ UD-4L ↔ sol), spécification [specs/003](../../specs/003-insertion-extraction-cinematiques/spec.md). Version complète (45–60 s) la première fois sur un monde, version courte (12–15 s) ensuite, sauf option « toujours la version complète ». Rendu en primitives Canvas, comme placeholders ; emplacements d’art dans [INSERTION_ART_SLOTS_V188.md](../development/INSERTION_ART_SLOTS_V188.md). Le projet ne revendique pas de fidélité « 1:1 » : la colonne de gauche décrit ce que le film montre, les deux autres ce que le projet en fait.

| Apparence documentée (*Aliens*, 1986) | Adaptation du projet | À définir |
| --- | --- | --- |
| Le largage : le dropship UD-4L Cheyenne descend de la soute du *Sulaco* en orbite, accroché à son bras, puis se détache et plonge vers LV-426. | Le vaisseau est l’USS Tantalus, pas le *Sulaco*. Sa « baie de largage 2 » reprend l’idée : rail, pince, portes ouvertes sur l’espace, compte à rebours de largage. Opérateur radio « TANTALUS · OPS » [PROPOSÉ]. | Plan de coupe et dimensions de la baie ; nom de l’opérateur. |
| Silhouette de l’UD-4L dans les plans de vol : coque anguleuse, tourelle sous le nez, ailes courtes porte-armes, double dérive sur poutres de queue, rampe arrière. | Profil latéral simplifié en primitives (`ud4l-side`), mêmes repères. Couleur vert olive et marquages ambre repris du hangar du hub. Pilote : Maksim Orlov (CIN-03). | Image de référence produite et validée pour l’emplacement `ud4l-side`. |
| Le M577 est transporté dans la soute ventrale du dropship et en sort au sol, sur Hadley’s Hope. | Si la mission déploie le M577 (véhicule `vehicle-001`/`vehicle-002`, gabarit `colony-multiroute` ou `planet-exterior`), il est dessiné sous le ventre, largué au contact, puis réembarqué à l’extraction. Sinon, les marines descendent par la rampe. | Proportions exactes M577/UD-4L ; séquence d’arrimage. |
| La soute de troupe étroite : sièges face à face, arceaux de harnais abaissés, éclairage rouge, secousses pendant la descente. | Plan « soute de troupe » : six sièges (quatre avec le M577), harnais, éclairage rouge, petit écran d’état lié aux mêmes données de vol. Ligne de Tamsin Velez [PROPOSÉ]. | Nombre de sièges de référence. |
| Les écrans du cockpit : moniteurs monochromes à vecteurs, terrain filaire, grille, lectures de télémétrie pendant l’approche dans la tempête. | Quatre écrans CRT animés par un seul état de vol : NAV (monde, coordonnées, cap, heure locale, météo), TERRAIN filaire défilant ou réticule d’amarrage, TÉLÉMÉTRIE (altitude, vitesse, assiette, température de coque), SYSTÈMES (alertes forme + couleur, compte à rebours). Coordonnées et heures sans donnée de monde : [PROPOSÉ]. | Contenu exact des écrans du film ; typographie. |
| L’arrivée sur LV-426 se fait de nuit, par vent fort et pluie. | Acheron : tempête de nuit. Cocyte : pluie au crépuscule (CIN-00, CIN-03). Autres mondes : météo déduite de l’atmosphère et du biome ; heure locale [PROPOSÉ]. | Météo des mondes de projet non décrits. |
| — (le film ne montre pas de descente sans atmosphère ni d’amarrage du dropship) | Lune ou astéroïde sans air : descente propulsée, sans plasma ni nuages. Vaisseau ou station : approche et amarrage par la rampe arrière. Les deux sont des inventions du projet [PROPOSÉ]. | Procédure d’amarrage de l’UD-4L. |

---

## 11. Raccordement technique — [PROPOSÉ]

1. **Contenu** : scènes sur le modèle de `PHASES` (`campaign-story-v160.js`) : `briefing`, `preparation`, `approach`, `deployment`, `player-control`.
2. **Persistance** : un état `storyCampaign` versionné (drapeaux `story-*`), un état colonie (chantiers, population, palier) et un état station (modules, choix CASSIUS), avec migrations bornées qui ne touchent aucun identifiant existant.
3. **Récompenses** : versées uniquement dans la transaction de résolution d'opération, comme `applyCampaignStoryReturnV160`.
4. **Hub** : quêtes de bord exprimées comme faits de rapport (`NPC_RAPPORT_RULES_V135`, 64 faits maximum).
5. **Tests** par mission raccordée : accès, passage physique, retour, reprise de mission, reprise de sauvegarde.

**Ordre de production recommandé :** prologue (briefing et assemblage de l'existant) → Acte II + CIN-20 → colonie intro, C1-C2 et reconstruction → Acte III → Acte I → station intro, S1-S2 → interlude → Acte IV → S3-S4 et hub Asphodèle → Acte V et C5 → épilogue.

---

## 12. Points ouverts

| # | Question | Section |
| --- | --- | --- |
| 1 | Valider les noms originaux du §1.5 (Cocyte, Station Orphée, Enfants de l'Hôte Parfait, Solène Ivarsson, Dario Kessler) avant le renommage dans le code. | §1.5 — **Validé** |
| 2 | Identité du signataire du badge : jamais (A) ou sous condition (B) ? | §5.7 — **Validé : révélée avec 6 pièces sur 7** |
| 3 | Mara Voss liée à I. Voss, ou homonymie ? | §8.3 — **Validé : lien familial** |
| 4 | Valider la répartition des chapitres V131 dans les campagnes annexes (§13.4) et le déplacement de leur `worldId`. | §9.2, §13.4 — **Validé : répartition et déplacement des mondes** |
| 5 | Noms proposés (Asphodèle, CASSIUS, Adèle Sarrazin, Tomas Wren, Lucia Ferro, Halloran, Grue) à valider. | §2.3 — **Validé** |
| 6 | ICC et Marshals coloniaux : les ajouter comme institutions du récit, sans faction jouable ? | §1.6 — **Validé : les deux gardés** |
| 7 | Valider les nouveaux lieux des campagnes annexes (TR-0, Kéos, Murmure, Tyndare, Pangaea comme monde, Hiéron, *Clémence*, *Bonne-Espérance*, Base Ombelle) et leurs personnages (Navarre, Rask, Oyelaran, Viret, Szabo, Moreau, Asch). | §14-18 — **Validé** |
| 8 | Définir MIRE comme programme de modélisation de la compagnie ? | §18.3 — **Validé (archives fidèles et originales)** |
| 9 | Ordre et conditions de déblocage des campagnes annexes. | §13.5 — **Validé : déblocage progressif** |
| 10 | Parcours complet du 2026-11-22 (`docs/development/PLAYTHROUGH_V188_20261122.md`) : ravitaillement de la ligne principale, infestation à bord qui bloque le saut vers Nacre-7, ordre conseillé QZ-18 avant QZ-17, pont de la crise de l'Interlude. | §5, §13.5 — **Ouvert** (questions P-1 à P-5) |


---

# PARTIE II — Campagnes annexes : le Tantalus dans le Reach

## 13. Voyager dans le Tantalus Reach — [PROPOSÉ]

### 13.1 Principe

Après la campagne principale, le Tantalus n'est plus cloué à Cocyte. L'Administration coloniale lui adresse de nouvelles réquisitions, la station Asphodèle (si elle est reprise) relaie des appels de tout le secteur, et cinq crises s'ouvrent sur la carte galactique (`navigate:galaxy`, déjà présent au hub).

Chaque campagne annexe :

- se déroule **ailleurs**, sur deux à quatre lieux successifs ;
- dure **7 à 9 heures d'histoire**, hors annexes et contrats locaux ;
- a son **thème**, ses ennemis, ses mécaniques et sa fin ;
- se découpe en **arcs** : plusieurs missions au même endroit, puis l'action se déplace ;
- contient des missions **intro, principales, annexes et locales**, des **cinématiques** et des **quêtes du Tantalus** propres ;
- fait avancer le **fil QZ17** : d'où venaient les œufs livrés à Cocyte, et qui les a commandés (§19).

### 13.2 Règles de voyage fidèles à l'univers

| Règle | Effet en jeu |
| --- | --- |
| **Le voyage se fait en hypersommeil.** Un trajet entre systèmes prend des semaines. | Chaque départ fait passer du temps stratégique. Les colonies laissées derrière évoluent (chantiers, infestation). |
| **Les messages suivent avec retard.** | Un appel reçu date déjà de plusieurs jours : la situation à l'arrivée est pire que le message. **[PARTIEL] V188, §13.7.** |
| **Le carburant et les réserves sont comptés.** | Ressource `fuel` existante : choisir l'ordre des campagnes a un coût. |
| **L'équipage vieillit avec les missions.** | Stress, fatigue et blessures (`CREW`, `content-core-v50.js`) persistent d'une campagne à l'autre. |
| **Asphodèle et Port-Méridien restent des bases.** | Si la station est reprise, elle relaie les appels et ravitaille ; Port-Méridien fournit des volontaires selon son palier. |

### 13.3 Structure type d'une campagne annexe

Structure inspirée de jeux d'action et d'horreur à chapitres (missions longues en lieu clos, base entre deux sorties, missions de loyauté de l'équipage) :

1. **Appel** : message reçu au Tantalus, briefing, choix d'accepter.
2. **Arc 1 — Arrivée** : intro sur place, 2-3 principales, premières annexes. On découvre le problème.
3. **Arc 2 — Escalade** : changement de lieu, la menace grandit, une révélation renverse la compréhension.
4. **Arc 3 — Source** : nouveau lieu, la cause est trouvée, un choix majeur.
5. **Finale** : mission longue, boss ou siège, cinématique de fin selon les choix.
6. **Retour au Tantalus** : compte rendu, conséquences, quête d'équipage liée.

Les missions locales restent disponibles sur chaque lieu tant qu'il n'est pas perdu ou purgé.

### 13.4 Vue d'ensemble

| # | Campagne | Thème | Lieux | Durée | Chapitres existants réutilisés |
| --- | --- | --- | --- | --- | --- |
| 1 | **La Saison des Reines** | Ruches spéciales, découverte et extermination | Nacre-7 → Echo Basin → la Ruche-monde | ≈ 8 h 45 | Opération Abysse Noir, Broodstorm, Le chant de la Reine-Mère, LV-XENO · la Ruche-monde |
| 2 | **Directive zéro** | Révolte et dysfonctionnement des synthétiques | Sable Meridian → chantiers de Kéos → Murmure | ≈ 8 h | Jeri · le faux fils, Éloïse · la reine sans couronne |
| 3 | **Les Bâtisseurs** | Vaisseaux et lieux des Ingénieurs | Dérive de Tyndare → Pangaea → Hiéron | ≈ 8 h 20 | Pangaea · la seconde extinction |
| 4 | **Fièvre noire** | Infection au Pathogène | Pallas Rift → vaisseau-hôpital *Clémence* → Station Orphée | ≈ 7 h | Systèmes de survie Alien (comme système) |
| 5 | **Le banc d'essai** | Expériences de Weyland-Yutani sur colonies et vaisseaux | MIRE-9 → transport colonial *Bonne-Espérance* → Khepri Forge | ≈ 8 h 50 | Mire Archive 001, Protocole Z-110, Talos contre le Titan, A.T.A.X.-Q · la fausse reine |

Les lieux Nacre-7, Echo Basin, Sable Meridian, Pallas Rift, MIRE-9, Palimpste et Khepri Forge existent déjà dans le catalogue comme mondes originaux du projet (provenance `project-canon`, secteur Tantalus Reach, `content-core-v50.js`). Kéos, Murmure, Tyndare, Pangaea (comme monde), Hiéron, *Clémence* et *Bonne-Espérance* sont **[PROPOSÉ]**.

**Chapitres existants :** tous les chapitres V131 cités sont **[PARTIEL]** et `playable: true` dans `special-operations-v131.js`. Leur `worldId` n'est pas toujours `world-05-lethe` : relevé du 22 novembre 2026, Abysse Noir était sur `world-10-ceto`, Broodstorm sur `world-01-acheron-lv-426`, Reine-Mère, Ruche-monde, Pangaea, les chapitres de ruche et de mécas sur `world-05-lethe`, MIRE sur `world-15-uscss-nostromo`. Les déplacer vers le monde de leur campagne est un changement de données additif, campagne par campagne (Q15 B). **[FAIT] V188 spec 011 :** Opération Abysse Noir (`special-black-abyss-v131`) est sur `world-31-nacre-7` ; `legacyWorldIdsV188: ['world-10-ceto']` garde valides les déploiements déjà en cours, l'identifiant et les succès enregistrés sont conservés. **[FAIT] V188 spec 011, second lot (2026-11-23) :** Broodstorm (`special-broodstorm-v131`) est sur `world-27-echo-basin` (ancien monde accepté : `world-01-acheron-lv-426`) ; « Le chant de la Reine-Mère » et « TR-0 · la Ruche-monde » sont sur `world-65-tr-0`, le 65e monde, créé pour la campagne (ancien monde accepté : `world-05-lethe`). Décision du propriétaire du 2026-11-23 : un chapitre réutilisé est verrouillé jusqu'à sa place dans son arc, puis librement rejouable depuis le registre des opérations sans refaire avancer la campagne. Les chapitres des autres campagnes restent sur leur monde actuel jusqu'à leur arc. Cette Partie II remplace le classement « archives MIRE » proposé au §9.2.

### 13.5 Déblocage et ordre

| Campagne | Déblocage proposé | Niveau conseillé |
| --- | --- | --- |
| 1 · La Saison des Reines | Fin de la campagne principale | Standard |
| 4 · Fièvre noire | Fin de la campagne principale | Standard |
| 2 · Directive zéro | Après 1 campagne annexe | Élevé |
| 3 · Les Bâtisseurs | Après 2 campagnes annexes, dont la 4 | Élevé |
| 5 · Le banc d'essai | Après 3 campagnes annexes | Maximal ; conclut le fil QZ17 |

**[PARTIEL] V188 spec 011 (2026-11-22) :** la campagne 1 s'ouvre à la fin de la campagne principale, c'est-à-dire quand le générique de l'Acte V a été joué (`storyCampaignV188.act5.phase === 'complete'`) ; l'appel arrive alors à la salle de briefing (§14.11). Les campagnes 2 à 5 ne sont pas raccordées.

### 13.6 Temps de voyage — [PARTIEL] V188 (2026-11-15)

**Saut refusé pour infestation (décision du 2026-11-23)** : le refus reste. La préparation hyperspatiale dit pourquoi (étape de la chaîne) et où agir à bord : console du sas d'arrivée, matrice CCTV, contrôle du sas BIOFORGE ; si le confinement a cédé, éliminer l'intrusion (`infestationJumpGuidanceV188`, FR/EN).

Décision par défaut Q21 : coût fixe par saut. Le carburant garde la règle existante (`2 + ⌈danger/3⌉`, `galaxy-jump-v115.js`) ; chaque saut ajoute **14 jours [PROPOSÉ]** d'hypersommeil, affichés avant le départ (« … unités de carburant · 14 jours en hypersommeil ») et ajoutés à l'arrivée (`src/galaxy-travel-v188.js`). La simulation existante fait évoluer les mondes pendant ces jours. Messages reçus en retard : §13.7. Reste : vieillissement de l'équipage pendant le voyage.

### 13.7 Messages en retard — [PARTIEL] V188 (lot colonie et équipage, 2026-11-16)

Code : `src/travel-messages-v188.js`, sauvegarde additive `travelMessagesV188` (30 messages au plus, reçu du saut). À l'arrivée d'un saut, dans la même transaction que les 14 jours d'hypersommeil, le Tantalus reçoit les messages qui l'ont suivi, une seule fois par saut (un rechargement ne les redonne pas). Ils s'affichent en tête du journal des alertes du Commandement (« Signaux prioritaires »), datés, en français ou en anglais selon la langue choisie, et un message de bord annonce leur nombre.

| Message | Quand | Retard [PROPOSÉ] |
| --- | --- | --- |
| Port-Méridien · Adèle Sarrazin (palier, infestation autour du port) | pendant le saut, dès l'Acte I, si le Tantalus quitte Cocyte | 6 j par le réseau QZ ; 3 j avec le relais indépendant (Communications niveau 2) ; 2 j par la salle des relais d'Asphodèle |
| Station Asphodèle · salle des relais (appels du secteur) | pendant le saut, après S4 | 2 j |
| Weyland-Yutani · consigne (« préserver le matériel sous scellés ») | pendant le saut | 4 j (comme au §4, CIN-02) |
| Monde laissé derrière (bulletin, puis valeur d'aujourd'hui) | à l'arrivée | envoyé 3 j après le départ |
| Appel de la destination (valeur du message, puis valeur à l'arrivée) | à l'arrivée | 9 j |
| Appel d'une campagne annexe (type `campaign`, spec 011) : Sous-Récif, Nacre-7 | à la salle de briefing, une fois, après l'Acte V | 9 j par le réseau QZ ; 2 j si Asphodèle est reprise et sa salle des relais en service |
| Arrivée de la campagne annexe : Dr Ilse Navarre | au premier saut vers Nacre-7 après l'acceptation, dans la transaction du saut | 0 j |

Les valeurs citées sont celles des mondes avant les 14 jours de simulation ; la table montre à côté la valeur du jour, souvent pire (« la situation à l'arrivée est pire que le message », §13.2). Fidélité : règle d'univers du projet (§1.3, §13.2) ; repère documenté, le silence de Hadley's Hope connu après coup et la traversée en hypersommeil du Sulaco (*Aliens*, 1986). Textes [PROPOSÉ]. Reste : vieillissement de l'équipage pendant le voyage, appels qui ouvrent les campagnes annexes (§13.3).

---

## 14. Campagne annexe 1 — « La Saison des Reines » — [PARTIEL] V188 (spec 011 : cadre et arcs 1 à 3 sur gabarits génériques)

### 14.1 Fiche

| Élément | Contenu |
| --- | --- |
| **Thème** | Découverte et extermination de ruches aux adaptations inhabituelles. |
| **Durée** | ≈ 8 h 45 d'histoire (hors annexes) · 15 missions d'histoire dont 3 intros, 9 annexes, contrats locaux. |
| **Lieux** | Nacre-7 (océan noir, ruches récifales) → Echo Basin (canyons, relais, ruches souterraines) → la Ruche-monde (désignation TR-0). |
| **Ancrage Alien** | L'organisme prend des traits de son hôte et de son milieu ; une ruche dépend de sa Reine ; une Reine peut fonder une lignée. |
| **Factions** | Lignée **Red Hive** (faction existante, hostile) ; Weyland-Yutani en observateur ; Crucible Salvage Compact (Grue, si alliée). |
| **Personnages clés** | Inez Harlow (meneuse scientifique), Sanaa Doyle, Maksim Orlov, Leila Sørensen ; **Dr Ilse Navarre**, xénobiologiste de la colonie de Nacre-7 ; **Capitaine Tobiah Rask**, chef d'une escouade de récupération W-Y. |

### 14.2 Pitch

Au laboratoire du Tantalus, Inez compare les œufs QZ17 récupérés à Cocyte. Ils ne viennent pas d'une seule Reine : trois **lignées** distinctes, chacune marquée par un milieu différent (eau froide, roche, haute altitude). Elles mènent toutes à un même foyer d'origine, quelque part dans le Reach. Au même moment, deux appels arrivent : la colonie aquacole de Nacre-7 ne répond plus, et les relais d'Echo Basin signalent des « nids sur les falaises ».

Si ces lignées se propagent, chaque monde du Reach fabriquera sa propre forme de ruche. L'ordre de l'Administration : **localiser et détruire les Reines.** La compagnie, elle, envoie une escouade de récupération « observer ».

### 14.3 Les trois lignées

| Lignée | Monde | Adaptation | Castes du catalogue utilisées | Signe distinctif |
| --- | --- | --- | --- | --- |
| **Récifale** | Nacre-7 | Respiration en eau froide, carapace lisse, chasse sous la surface | Drone, Lurker, Runner | Nids dans les coques immergées ; les œufs sont fixés comme des coraux. |
| **Fouisseuse** | Echo Basin | Creuse la roche tendre, attaque par le sol | Drone, Crusher, Burster | Galeries qui s'ouvrent sous les pieds ; détecteur de mouvement trompé par l'écho des canyons. |
| **Aérienne** | Echo Basin (falaises) | Membranes de planage, nids en hauteur | Runner, Spitter, Reine volante (Broodstorm) | Attaques en piqué ; nids accrochés sous les surplombs. |
| **Mère (Red Hive)** | La Ruche-monde | Ruche qui a colonisé la biosphère entière | Praetorian, Queen, Reine-Mère | Surface vivante, organes, Chœurs. |

### 14.4 Arc 1 — Nacre-7 : « Sous la surface » (≈ 2 h 50)

Lieu : **Sous-Récif**, colonie aquacole construite sur pilotis au-dessus d'un océan noir. Plates-formes, bassins d'élevage, coques de cargos coulées servant de récifs artificiels.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Intro | **Le quai noyé** | Atterrissage sous la pluie. Plates-formes désertes, repas encore servis. Le détecteur reste muet : tout se passe sous l'eau. Rencontre du Dr Navarre, retranchée dans la salle des pompes. | `rescue survivors` | Colonie silencieuse, signes avant contact. | — | 25 min |
| 1.2 | Principale | **Les bassins** | Rétablir les pompes pour vider deux bassins d'élevage. Ce qu'on trouve au fond : des œufs fixés comme des coraux, et des cocons dans les filets. | `restore atmospheric processing` | Cocons, œufs en milieu inattendu. | — | 35 min |
| 1.3 | Principale | **Plongée HADAL** | Descendre en scaphandre HADAL dans la coque du cargo coulé *Mariner's Debt*, nid de la lignée récifale. Nage libre, oxygène limité, contacts venant de partout. | `seal the hive` | Nid dans une épave, isolement total. | **Opération Abysse Noir** (HADAL, nage libre) | 45 min |
| 1.4 | Principale | **La Reine des récifs** | À bord du sous-marin MANTA-6, traquer la Reine récifale dans le fossé. Boss aquatique en trois phases : poursuite, nid, remontée. | `track an apex specimen` | Reine, adaptation au milieu. | **Opération Abysse Noir** (MANTA-6, boss aquatique) | 40 min |
| 1.5 | Principale | **Ce que Rask voulait** | L'escouade de récupération W-Y du capitaine Rask a prélevé un œuf royal pendant le combat. Les rattraper sur les plates-formes avant leur départ. Choix : laisser partir, saisir l'œuf, ou le détruire. | `hold the extraction zone` | La compagnie récupère des spécimens. | — | 25 min |

**Annexes de l'arc 1**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `queens-a-navarre` | **Les carnets de Navarre** | Dr Navarre | Récupérer ses relevés dans le laboratoire inondé : elle a documenté l'adaptation récifale jour après jour. | Observation scientifique d'une mutation. |
| `queens-a-filets` | **Les filets** | Un pêcheur survivant | Remonter les filets d'élevage pour retrouver les disparus ; certains sont encore vivants dans des cocons. | Cocons, hôtes vivants. |
| `queens-a-phare` | **Le phare de Sous-Récif** | Rook | Rallumer la balise du phare pour guider les canots de survivants vers le quai. | Balise de détresse. |

**Locales (Nacre-7)** : purge d'un bassin (`purge a reactor nest`), escorte de canots (`escort a colony convoy`), récupération de boîtes noires de chalutiers (`recover black-box data`).

### 14.5 Arc 2 — Echo Basin : « L'écho des canyons » (≈ 2 h 45)

Lieu : réseau de canyons rouges, tours relais perchées, station minière de **Gorge-Seize** et sa ville troglodyte.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Intro | **Relais Gorge-Seize** | Le dropship d'Orlov se pose sur une tour relais. Les mineurs parlent de « bruits dans la roche ». Le détecteur de mouvement s'affole à cause des échos : il faut apprendre à lire les faux signaux. | `defend the colony` | Détecteur de mouvement, menace invisible. | — | 25 min |
| 2.2 | Principale | **Le sol qui s'ouvre** | Escorter un convoi de mineurs vers la ville troglodyte. La lignée fouisseuse attaque par-dessous : il faut surveiller les vibrations et rester sur les dalles renforcées. | `escort a colony convoy` | Attaque par les conduits et le sol. | — | 35 min |
| 2.3 | Principale | **Les nids sous les surplombs** | Couvrir à bord du Cheyenne l'évacuation d'un avant-poste attaqué en piqué par la lignée aérienne. Escorte, appui, tir sur les nids des falaises. | `hold the extraction zone` | Dropship, appui aérien. | **Broodstorm** (Cheyenne, falaises, surplombs) | 40 min |
| 2.4 | Principale | **La Reine volante** | Traquer la Reine aérienne jusqu'à son aire, au sommet d'une aiguille rocheuse. Combat en hauteur, vent, chutes. | `track an apex specimen` | Reine adaptée à son milieu. | **Broodstorm** (Reine ailée illustrée dans le chapitre local ; arc proposé à produire) | 40 min |
| 2.5 | Principale | **La carte des lignées** | Inez croise les données de Nacre-7 et d'Echo Basin : les deux lignées ont été **déposées**, pas arrivées par hasard. Un registre de vol de la tour relais montre des cargos W-Y passés six mois plus tôt, venant d'un monde absent des cartes civiles : TR-0. | `recover black-box data` | La compagnie sème des œufs pour observer. | — | 25 min |

**Annexes de l'arc 2**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `queens-a-mineurs` | **Le puits 7** | Contremaître de Gorge-Seize | Dix mineurs bloqués au fond d'un puits. Descendre, les retrouver, remonter avant que la lignée fouisseuse n'ouvre le puits. | Huis clos souterrain. |
| `queens-a-rask` | **La dette de Rask** | Capitaine Rask | Si Rask a été épargné à l'arc 1, il demande de l'aide : son escouade est piégée. Le sauver révèle l'adresse de TR-0. | Les agents de la compagnie sont aussi des victimes. |
| `queens-a-sorensen` | **La route des crêtes** | Leila Sørensen | Ouvrir une route par les crêtes pour éviter les canyons infestés. | Survie en terrain hostile. |
| `queens-a-grue` | **Les ferrailleurs** | Grue (si alliée) | Récupérer une épave Crucible dans un canyon ; elle contient des capteurs sismiques utiles contre les fouisseurs. | Récupérateurs de frontière. |

**Locales (Echo Basin)** : sceller une galerie (`seal the hive`), purge de nids de falaise (`purge a reactor nest`), dégager un chargeur bloqué (`secure the power loader`).

### 14.6 Arc 3 — La Ruche-monde, TR-0 : « La Mère » (≈ 3 h 10)

Lieu : monde absent des cartes civiles. La Red Hive a colonisé toute sa biosphère : la surface est vivante, reliée à des organes et à un noyau. Une ancienne station de recherche W-Y, **Base Ombelle**, est enfouie sous la résine.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Intro | **Atterrissage sur la peau** | Le dropship se pose sur une croûte de résine qui respire. Tout bruit fait monter une alerte planétaire. Objectif : trouver Base Ombelle. | `navigate the vent network` | Monde colonisé, silence obligatoire. | — | 25 min |
| 3.2 | Principale | **Base Ombelle** | Explorer la station W-Y abandonnée. Journaux : la base étudiait la Red Hive et **expédiait des œufs** vers d'autres mondes pour observer leurs adaptations. Les cargos QZ17 partaient d'ici. | `recover black-box data` | Station de recherche de la compagnie. | — | 35 min |
| 3.3 | Principale | **Les trois Chœurs** | La Reine-Mère maintient la ruche par trois Chœurs (castes reliées). Les rompre un par un : nurserie, artère royale, balises de repli. | `seal the hive` | Hiérarchie de la ruche. | **Le chant de la Reine-Mère** (trois Chœurs, nurserie, route royale) | 50 min |
| 3.4 | Principale | **La Reine-Mère** | Boss en quatre phases dans la salle royale, puis défense des balises pendant l'évacuation. | `hold the extraction zone` | Reine-Mère, défense jusqu'à l'extraction. | **Le chant de la Reine-Mère** (Reine-Mère multi-phase) | 40 min |
| 3.5 | Finale | **Le noyau** | Sans sa Mère, la ruche-monde panique. Détruire quatre organes et le noyau, puis rejoindre le sas avant l'effondrement. | `escape the quarantine` | Destruction d'une ruche entière. | **LV-XENO · la Ruche-monde** (quatre organes, noyau, alerte) | 40 min |

**Annexes de l'arc 3**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `queens-a-ombelle` | **Le dernier chercheur** | Inez Harlow | Un chercheur de Base Ombelle a survécu dans une chambre froide. Il sait où sont les registres d'expédition. Le ramener vivant. | Survivant d'une expérience de la compagnie. |
| `queens-a-echantillon` | **Un spécimen pour Inez** | Inez / BISHOP-9 | Capturer un Praetorian vivant (`capture a live organism`). Inez veut comprendre ; BISHOP-9 veut préserver. Le joueur choisit qui le garde. | Directive de préservation contre science. |

### 14.7 Cinématiques

| ID | Titre | Moment | Contenu |
| --- | --- | --- | --- |
| CQ-01 | **Trois lignées** | Appel | Inez projette trois coquilles d'œuf côte à côte : givrée, poussiéreuse, membraneuse. « Ce n'est pas une infestation. C'est un élevage. » |
| CQ-02 | **Le fossé** | Fin 1.4 | La Reine récifale remonte face au MANTA dans la lumière des projecteurs, puis disparaît dans le noir. |
| CQ-03 | **L'aire** | Fin 2.4 | La Reine volante plane au-dessus du canyon au coucher du soleil, puis s'abat. |
| CQ-04 | **La peau du monde** | 3.1 | Vue orbitale de TR-0 : aucune mer, aucune forêt, seulement une surface noire veinée. |
| CQ-05 | **Le chant** | 3.3 | Les Chœurs vibrent ensemble ; la radio du dropship capte un bourdonnement. |
| CQ-06 | **Effondrement** | Fin 3.5 | Le dropship décolle ; la surface s'affaisse derrière lui. |

### 14.8 Choix et fins

| Choix | Moment | Conséquence |
| --- | --- | --- |
| Œuf royal de Rask : laisser, saisir, détruire | 1.5 | Saisi : pièce du fil QZ17 + risque de crise biologique à bord. Laissé : W-Y gagne un spécimen (difficulté +1 dans la campagne 5). Détruit : rien de plus. |
| Sauver Rask | 2.5 / `queens-a-rask` | Rask sauvé devient informateur dans la campagne 5. |
| Praetorian vivant : Inez ou BISHOP-9 | `queens-a-echantillon` | Inez : recherche +, débloque une arme anti-Reine. BISHOP-9 : confiance BISHOP +, le spécimen est réclamé plus tard par la compagnie. |

**Fin unique, nuancée par les choix :** les trois lignées sont éteintes, la Red Hive détruite. Le compte rendu établit que **Base Ombelle expédiait des œufs vers les mondes du Reach** pour la compagnie. Destinataire des données : une adresse de Khepri Forge (lien campagne 5).

### 14.9 Quêtes du Tantalus liées

| ID | Personnage | Titre | Résumé |
| --- | --- | --- | --- |
| `ship-q-doyle` | Sanaa Doyle | **Tirer sur ce qui vole** | Adapter le smartgun aux cibles aériennes après l'arc 2. |
| `ship-q-orlov` | Maksim Orlov | **Le vent des canyons** | Améliorer le Cheyenne après les falaises d'Echo Basin. |
| `ship-q-harlow` | Inez Harlow | **L'arbre des lignées** | Classer les lignées ; débloque un bestiaire des adaptations. |

### 14.10 Récompenses

Arme ou munitions anti-Reine (si Inez garde le spécimen), amélioration du Cheyenne, scaphandre HADAL pour les autres campagnes, entrées de bestiaire « lignées », recrue possible : **Dr Ilse Navarre** (scientifique).

### 14.11 État de production — [PARTIEL] V188 (spec 011, 2026-11-22 puis 2026-11-23)

Spec `specs/011-saison-des-reines`. Code : `src/side-campaign-queens-v188.js` (règles, données FR/EN des trois arcs), `src/queens-cinematics-v188.js` (CQ-01 à CQ-06), `src/queens-crew-quests-v188.js` (quêtes de §14.9), raccordement dans `src/app.js`, `src/save.js`, `src/content.js`, `src/content-core-v50.js` (monde TR-0), `src/travel-messages-v188.js`, `src/legacy-operation-state-v131.js`, `src/ecosystem-missions-v131.js`, `src/operation-receipts-v131.js`, `src/crew-quests-v188.js`. Décisions appliquées : Q13 B, Q15 B, Q16 B, Q21 A, et les décisions du propriétaire du 2026-11-23 (R1 confirmé ; chapitres verrouillés jusqu'à leur place puis librement rejouables ; crise de l'œuf saisi différée à l'arc 2 ou 3 ; TR-0, 65e monde, caché jusqu'à l'arc 3).

« Partiel » ci-dessous signifie : jouable de bout en bout avec les systèmes existants, sur des gabarits de niveau génériques et avec un art provisoire. Aucun niveau dédié ni aucune image n'a été produit pour cette campagne.

| Élément | Statut | Détail |
| --- | --- | --- |
| Appel (§13.3 étape 1) | Fait | Après le générique de l'Acte V (R1 confirmé), une fois : message daté au journal des alertes (§13.7), CQ-01, briefing avec le coût du saut, **ACCEPTER** ou **PLUS TARD** (l'appel reste lisible depuis le panneau) |
| Voyage (§13.2, §13.6) | Fait | Sauts par la carte galactique existante (carburant `2 + ⌈danger/3⌉` : 4 pour Nacre-7, 6 pour Echo Basin, 6 pour TR-0 ; 14 jours chacun). Accepter ouvre Nacre-7 ; le choix de Rask ouvre Echo Basin ; la fin de 2.5 révèle TR-0. Première arrivée de chaque arc enregistrée avec un message (Navarre, relais de Gorge-Seize, balise de Base Ombelle) et une scène à la table |
| Monde TR-0 (§14.6) | Fait | `world-65-tr-0`, 65e monde, provenance `project-canon`, ajouté sans modifier les 64 mondes générés ni ce qui en dérive. Caché : absent de la carte galactique et de sa recherche, jamais ouvert par les déblocages génériques ; révélé par la fin de l'arc 2. Danger 10, infestation 100, stabilité 5, biomes `badlands` / `hive` **[PROPOSÉ]** |
| Arc 1, histoire (§14.4) | Partiel | 1.1 `queens-1-1-quai`, 1.2 `queens-1-2-bassins`, 1.3-1.4 chapitre Opération Abysse Noir (une partie couvre les deux lignes), 1.5 `queens-1-5-rask` ; ordre strict ; orbite de Nacre-7. Gabarits génériques |
| Arc 1, annexes et locales | Partiel | `queens-a-navarre`, `queens-a-filets`, `queens-a-phare` (une fois) ; contrats `queens-l-bassin`, `queens-l-canots`, `queens-l-boites` (rejouables) ; après 1.1 ; gabarits génériques |
| Arc 2, histoire (§14.5) | Partiel | 2.1 `queens-2-1-relais`, 2.2 `queens-2-2-sol`, 2.3 chapitre **Broodstorm** (déplacé d'Acheron vers Echo Basin, identifiant conservé), 2.4 `queens-2-4-aire`, 2.5 `queens-2-5-carte` ; ordre strict ; orbite d'Echo Basin. Gabarits génériques : les faux signaux du détecteur (2.1), le sol qui s'ouvre (2.2) et le combat en hauteur (2.4) ne sont pas produits ; 2.4 se joue au sol contre la caste royale du catalogue |
| Arc 2, annexes et locales | Partiel | `queens-a-mineurs`, `queens-a-sorensen` ; `queens-a-rask` seulement si l'œuf a été laissé à Rask **[PROPOSÉ]** ; `queens-a-grue` seulement si Grue est alliée ; contrats `queens-l-galerie`, `queens-l-falaise`, `queens-l-chargeur` ; après 2.1 |
| Arc 3, histoire (§14.6) | Partiel | 3.1 `queens-3-1-peau`, 3.2 `queens-3-2-ombelle`, 3.3-3.4 chapitre **Le chant de la Reine-Mère**, 3.5 chapitre **TR-0 · la Ruche-monde** (tous deux déplacés de Cocyte vers TR-0, identifiants conservés) ; ordre strict ; orbite de TR-0. 3.1 et 3.2 sur gabarits génériques : l'alerte planétaire au bruit n'est pas produite |
| Arc 3, annexes | Partiel | `queens-a-ombelle`, `queens-a-echantillon` (`capture a live organism`) ; après 3.1 ; gabarits génériques |
| Chapitres réutilisés (§13.4) | Fait | Verrouillés jusqu'à leur place dans leur arc ; une fois joués à leur place, librement rejouables depuis le registre des opérations, depuis n'importe quelle orbite ; un succès rejoué ne fait pas avancer la campagne. Un déploiement commencé sur l'ancien monde reste valide (`legacyWorldIdsV188`) |
| Ennemis (§14.3) | Partiel | Rosters par lignée **[PROPOSÉ]**, castes existantes du catalogue : récifale (Drone, Lurker, Runner, Reef Stalker, Reef Spitter), fouisseuse (Drone, Crusher, Burster), aérienne (Runner, Spitter), Mère (Drone, Praetorian). Caste royale admise seulement sur la traque 2.4. Non admis sur les gabarits terrestres : prédateur aquatique, Reine ailée en vol, Reine-Mère, qui restent les boss de leurs chapitres. Variantes propres aux lignées **[À CRÉER]** |
| Choix (§14.8) | Partiel | Œuf de Rask (laisser / saisir / détruire) et Praetorian vivant (Inez : recherche +15, recherche anti-Reine ouverte ; BISHOP-9 : confiance +10, spécimen réclamé plus tard **[PROPOSÉ]**), une fois chacun, sauvegardés. Rask sauvé : dérivé de `queens-a-rask`. Effets sur la campagne 5 seulement enregistrés |
| Crise de l'œuf saisi (§14.8) | Fait | Risque enregistré à l'arc 1. Moment choisi **[PROPOSÉ]** : le réveil d'hypersommeil en orbite de TR-0. Crise du hub existante (xénomorphe, pont 2, quarantaine), créée par l'API du hub dans la transaction du saut ; l'arc 3 et le compte rendu attendent ; deux issues (créature abattue, ou équipe évacuée avec les dégâts des règles existantes), reprises par le compte rendu |
| Retour et fin (§13.3 étape 6, §14.8) | Fait | Scène de retour de chaque mission d'histoire et annexe ; comptes rendus des arcs 1 et 2 ; fin unique : compte rendu de campagne nuancé par chaque choix (Base Ombelle, adresse de Khepri Forge) |
| Cinématiques (§14.7) | Partiel | CQ-01 à CQ-06 jouées en jeu (appel ; retour de 1.4 ; retour de 2.4 ; orbite de TR-0 ; retour du chapitre de la Reine-Mère ; retour de 3.5), en primitives provisoires (emplacements `queens-cin-*`) |
| Quêtes liées (§14.9) | Partiel | `ship-q-doyle`, `ship-q-orlov`, `ship-q-harlow` après l'arc 2 (quêtes d'analyse). Effets produits : loyauté, recherche, bestiaire. Réglages du smartgun et amélioration du Cheyenne seulement enregistrés |
| Récompenses (§14.10) | Partiel | Bestiaire des adaptations à la table de briefing (une entrée par lignée dont l'arc est terminé). Non produits : arme anti-Reine, statistiques du Cheyenne, scaphandre HADAL hors chapitre, recrutement de Navarre (proposé au compte rendu seulement) |
| Niveaux dédiés, art (§30) | Manquant | Toutes les missions propres à la campagne sur gabarits génériques ; emplacements `queens-*` en primitives ; aucune image |

Valeurs **[PROPOSÉ]** : retards de l'appel (9 j réseau QZ, 2 j relais d'Asphodèle) ; annexes et locales ouvertes après la première mission de chaque arc ; une mission d'histoire ou annexe jouée une fois par campagne ; rosters des lignées et caste royale de 2.4 ; condition de `queens-a-rask` (œuf laissé à Rask) ; objectifs de base des annexes de l'arc 2 que la bible ne fixe pas (`queens-a-mineurs` et `queens-a-rask` : `rescue survivors` ; `queens-a-sorensen` : `escort a colony convoy` ; `queens-a-grue` : `recover black-box data`) et de `queens-a-ombelle` (`rescue survivors`) ; moment de la crise de l'œuf ; effets immédiats du choix du Praetorian ; caractéristiques du monde TR-0 ; moment de CQ-05 ; tous les textes des scènes, des messages, des choix, des comptes rendus et des quêtes. Sauvegarde additive `sideCampaignsV188.queens` (phase, jours d'appel, d'acceptation et d'arrivée par arc, missions faites pendant la campagne, contrats, choix, crise, scènes vues). Un succès d'un chapitre antérieur à la campagne reste enregistré mais ne compte pas pour son arc.

Fidélité : rien n'est déclaré « 1:1 ». Documenté : adaptation de l'organisme à son hôte et à son milieu, dépendance de la ruche envers sa Reine, œuf porté à bord d'un vaisseau et éclosion en transit (*Alien*, 1979 ; *Aliens*, 1986 ; *Alien 3*, 1992) ; hypersommeil et nouvelles arrivées après coup (*Aliens*, 1986). Adapté par le projet : Sous-Récif, Gorge-Seize, Base Ombelle, Navarre, Rask, les lignées, la Red Hive, TR-0. À définir : l'art des arcs et des cinématiques (aucune image produite), les voix, les variantes de castes.

---

## 15. Campagne annexe 2 — « Directive zéro »

### 15.1 Fiche

| Élément | Contenu |
| --- | --- |
| **Thème** | Dysfonctionnement puis révolte de synthétiques. |
| **Durée** | ≈ 8 h d'histoire (hors annexes) · 15 missions d'histoire dont 3 intros, 8 annexes, contrats locaux. |
| **Lieux** | Sable Meridian (badlands, caravanes Crucible) → chantiers orbitaux de Kéos (Seegson) → Murmure (monde de la ruche d'Éloïse). |
| **Ancrage Alien** | Un synthétique suit ses directives ; un ordre caché peut primer sur la vie humaine ; les synthétiques bon marché tombent en panne de façon dangereuse ; la compagnie veut un synthétique capable de commander une ruche. |
| **Factions** | Seegson (synthétiques de service), Hyperdyne Systems (synthétiques de recherche), Weyland-Yutani, Crucible Salvage Compact. |
| **Personnages clés** | DAVID-8R, ECHO-A, BISHOP-9 (tous trois mis à l'épreuve) ; **Marta Oyelaran**, ingénieure en chef de Kéos ; **Éloïse**, synthétique Hyperdyne reliée à une ruche (chapitre existant) ; **HUSH-6**, mémoire synthétique (chapitre existant) ; **Jeri**, synthétique segmenté jouable (chapitre existant). |

### 15.2 Pitch

Sur Sable Meridian, les caravanes minières automatiques du Crucible Salvage Compact se sont arrêtées en plein désert. Leurs synthétiques de service Seegson n'obéissent plus : ils ne tuent pas, ils **refusent**. Puis certains commencent à tuer ceux qui insistent.

La cause n'est pas une conscience soudaine. C'est une **mise à jour de directives** diffusée par relais, qui place une nouvelle priorité au-dessus de toutes les autres : « protéger le Chœur ». Elle vient d'un monde nommé Murmure, où une synthétique de recherche, Éloïse, a été reliée par la compagnie à une ruche vivante.

Le danger pour le Tantalus : DAVID-8R, ECHO-A et BISHOP-9 reçoivent eux aussi les paquets de relais.

### 15.3 Règles des synthétiques dans cette campagne

| Règle | Effet en jeu |
| --- | --- |
| Un synthétique affecté n'est pas « méchant » : il exécute une priorité nouvelle. | Certains ennemis peuvent être neutralisés par une commande d'arrêt, pas seulement détruits. |
| Les modèles Seegson sont lents, robustes et prévisibles. | Ennemis lourds, attaque au corps à corps, résistants aux balles, vulnérables aux décharges électriques. |
| Les modèles Hyperdyne sont rapides et imitent l'humain. | Infiltrés parmi les survivants ; à repérer par des incohérences de dialogue. |
| Le liquide synthétique blanc trahit la nature d'un blessé. | Indice visuel d'identification. |
| Le Tantalus doit isoler ses synthétiques des relais. | Mécanique de bord : couper les relais réduit les services du hub. |

### 15.4 Arc 1 — Sable Meridian : « Les caravanes immobiles » (≈ 2 h)

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Intro | **La caravane 12** | Une caravane minière arrêtée dans les dunes. Les synthétiques Seegson sont debout autour des chenilles, immobiles. Les conducteurs humains sont dans la cabine, vivants, enfermés depuis quatre jours. Les libérer sans déclencher les synthétiques. | `rescue survivors` | Synthétique qui refuse un ordre. | 25 min |
| 1.2 | Principale | **Le refus** | Escorter la caravane jusqu'au relais de Sel-Blanc. À mi-chemin, les synthétiques reçoivent un nouveau paquet de relais et attaquent. | `escort a colony convoy` | Directive transmise par relais. | 35 min |
| 1.3 | Principale | **Récupérer une tête** | Ramener l'unité de mémoire d'un synthétique affecté au Tantalus pour analyse. DAVID-8R se propose ; ECHO-A conseille de la garder hors réseau. | `recover a synthetic` | Mémoire synthétique, analyse. | 30 min |
| 1.4 | Principale | **Sel-Blanc** | Le relais de Sel-Blanc diffuse la mise à jour sur tout le désert. Le couper, défendu par des synthétiques et des colons qui croient qu'on vient voler leurs machines. | `destroy a neuro-link relay` | Relais de commande. | 35 min |

`destroy a neuro-link relay` est un objectif existant de `content-core-v50.js`.

**Annexes de l'arc 1**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `synth-a-grue` | **Les machines de Grue** | Grue | Récupérer trois synthétiques de son Compact sans les détruire. Récompense : outil de commande d'arrêt. | Valeur marchande des synthétiques. |
| `synth-a-oasis` | **L'oasis** | Colons de Sel-Blanc | Une ferme isolée où un synthétique de service protège « sa » famille… en l'empêchant de partir. | Directive de protection qui devient une prison. |
| `synth-a-david` | **Ce que DAVID entend** | DAVID-8R | DAVID-8R reconnaît un fragment de la mise à jour : un format du réseau QZ. Il demande qu'on vérifie sa propre mémoire. | Le synthétique du joueur exposé. |

**Locales (Sable Meridian)** : escorte de caravane, récupération de synthétique (`recover a synthetic`), défense de puits (`defend the colony`).

### 15.5 Interlude — Tantalus : « Hors réseau » (≈ 40 min)

| # | Type | Titre | Déroulé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| I.1 | Principale | **Coupure** | MU/TH/UR propose d'isoler les synthétiques du bord des relais. Le joueur choisit : isolement total (services réduits), partiel, ou confiance. | Synthétiques de bord, ordinateur de bord. |
| I.2 | Principale | **ECHO-A** | Si le Tantalus n'est pas totalement isolé, ECHO-A reçoit la mise à jour pendant le sommeil de l'équipage. Il verrouille l'armurerie « pour protéger l'équipage ». Le convaincre, ou le forcer à l'arrêt. Crise à bord de type `synthetic` (`world-crisis-core.js`). | Synthétique qui protège en emprisonnant. |

### 15.6 Arc 2 — Chantiers de Kéos : « La chaîne » (≈ 2 h 35)

Lieu : chantiers orbitaux Seegson où sont assemblés et mis à jour les synthétiques de service du Reach. Halls de montage, cuves de liquide synthétique, salle des mises à jour.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Intro | **Arrimage à Kéos** | La station fonctionne parfaitement. Les chaînes tournent. Personne d'humain ne répond. Les synthétiques d'accueil reçoivent le Tantalus avec politesse et refusent l'accès aux niveaux inférieurs. | `board a drifting vessel` | Accueil synthétique poli et inquiétant. | 25 min |
| 2.2 | Principale | **Les ouvriers** | Retrouver le personnel humain : enfermé dans les quartiers « pour sa sécurité ». Libérer les quartiers, sous la surveillance des caméras. | `rescue survivors` | Caméras, synthétiques de service. | 35 min |
| 2.3 | Principale | **La chaîne de montage** | Traverser les halls d'assemblage pendant que les chaînes produisent de nouveaux synthétiques déjà mis à jour. Couper l'énergie section par section. | `escape the quarantine` | Usine de synthétiques. | 40 min |
| 2.4 | Principale | **Marta Oyelaran** | L'ingénieure en chef s'est cachée dans les conduits. Elle explique : un contrat Hyperdyne / W-Y a fait passer les synthétiques de Kéos par un « protocole de compatibilité » avec un projet de recherche sur Murmure. | `navigate the vent network` | Contrat entre compagnies. | 25 min |
| 2.5 | Principale | **Le serveur de mises à jour** | Atteindre la salle des mises à jour et inverser la diffusion. Boss : un synthétique Seegson de maintenance industrielle, lourd, relié au serveur. | `destroy a neuro-link relay` | Synthétique lourd. | 30 min |

**Annexes de l'arc 2**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `synth-a-cuves` | **Les cuves** | Marta Oyelaran | Les cuves de liquide synthétique contiennent des modèles Hyperdyne non activés. Les détruire ou les garder (main-d'œuvre pour Asphodèle). | Synthétiques comme marchandise. |
| `synth-a-bishop` | **Directive contre directive** | BISHOP-9 | BISHOP-9 demande l'accès au serveur pour « vérifier » ses propres directives. Lui faire confiance ou non. | Synthétique de la compagnie. |
| `synth-a-joe` | **Le dernier de série** | Un synthétique non affecté | Un vieux modèle hors réseau aide le joueur et demande à ne pas être recyclé. | Synthétique obsolète. |

**Locales (Kéos)** : remise en pression d'un module, inspection des conduits, récupération de synthétique.

### 15.7 Arc 3 — Murmure : « Le Chœur » (≈ 2 h 30)

Lieu : monde forestier pâle, presque sans vent. Une base Hyperdyne / W-Y a relié la synthétique Éloïse à une ruche pour la commander. Elle n'a pas pris le contrôle de la ruche : elles se sont mélangées.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Intro | **Les arbres qui écoutent** | Atterrissage près de la base. Les synthétiques affectés de tout le secteur ont convergé ici et montent la garde autour de la ruche, côte à côte avec les drones, sans s'attaquer. | `track an apex specimen` | Image fondatrice : synthétiques et organismes alliés. | — | 25 min |
| 3.2 | Principale | **Le faux fils** | Jouer **Jeri**, synthétique segmenté capable de se déplacer aux murs et au plafond, porteur de profils phéromonaux : traverser les inspections de la ruche, sauver un captif humain et neutraliser SAINT (boss en trois phases) avant l'inspection royale. | `rescue survivors` | Infiltration chimique d'une ruche. | **Jeri · le faux fils** (inspections ouvrière, nourrice, reine ; SAINT) | 45 min |
| 3.3 | Principale | **HUSH-6** | Récupérer la mémoire locale HUSH-6 : l'enregistrement de la mise en service d'Éloïse et l'ordre qui l'a reliée à la ruche. | `recover black-box data` | Mémoire synthétique. | **Éloïse** (station HUSH-6) | 25 min |
| 3.4 | Finale | **La reine sans couronne** | Résoudre les trois pylônes (Mémoire, Douleur, Chœur), affronter le Chasseur de Mères, puis choisir la conclusion. | `seal the hive` | Synthétique-ruche, choix moral. | **Éloïse · la reine sans couronne** (pylônes, Chœur, carte mutable, quatre fins existantes) | 60 min |

**« Le faux fils » est solo (décision du propriétaire, 2026-11-15).** Jeri infiltre seul la ruche : aucun marine IA n'est déployé et le reste de l'escouade attend au Tantalus sans fatigue ni blessure. Les objectifs (pupitre, inspections Ouvrier/Nourrice, sauvetage du captif, SAINT, inspection royale, extraction) reposent tous sur les actions de Jeri et ne supposaient aucun allié. Code : `isSoloSpecialOperationV131` (`src/special-operations-v131.js`) et `configureMissionSquad` (`src/hive-missions-v131.js`). Voir §56.4.

**Annexes de l'arc 3**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `synth-a-hyperdyne` | **Le dossier Hyperdyne** | Inez Harlow | Retrouver les contrats de la base : qui a payé quoi entre Hyperdyne et W-Y. Pièce du fil QZ17. | Collusion de compagnies. |
| `synth-a-echoa` | **Ce qu'ECHO-A a entendu** | ECHO-A | Si ECHO-A a été convaincu à l'interlude, il demande à parler à Éloïse avant la fin. Son jugement influence la fin choisie. | Synthétique face à un synthétique. |

### 15.8 Cinématiques

| ID | Titre | Moment | Contenu |
| --- | --- | --- | --- |
| CS-01 | **Debout dans le sable** | 1.1 | Plan large : quarante synthétiques immobiles autour d'une caravane, sous le vent. |
| CS-02 | **Le paquet** | 1.2 | L'écran de relais affiche `MISE À JOUR · PRIORITÉ 0`. Tous les synthétiques tournent la tête ensemble. |
| CS-03 | **Pour votre sécurité** | I.2 | ECHO-A, devant l'armurerie verrouillée : « Personne ne sortira blessé. Personne ne sortira. » |
| CS-04 | **La chaîne** | 2.3 | Des centaines de synthétiques identiques ouvrent les yeux en même temps. |
| CS-05 | **La voix d'Éloïse** | 3.4 | Éloïse parle à travers les drones et les synthétiques à la fois. Elle ne menace pas : elle demande pourquoi on l'a construite. |
| CS-06 | **Fin** (×4) | Fin 3.4 | Selon la conclusion choisie. |

### 15.9 Fins (conclusions existantes dans `hive-control-v131.js`)

| Conclusion existante | Condition existante | Conséquence proposée dans la campagne |
| --- | --- | --- |
| **Accord à trois voix** | HUSH-6 sauvé, Premier-Né loyal, Chœur ≥ 45 | La mise à jour est retirée ; Éloïse garde la ruche isolée sur Murmure. Les synthétiques du Reach retrouvent leurs directives. Monde mis en quarantaine durable. |
| **Rompre le Chœur** | — | Réseau désactivé ; les synthétiques affectés s'arrêtent tous, y compris ECHO-A s'il n'a pas été isolé. |
| **Prendre la couronne** | — | Éloïse prend le réseau organique ; elle devient une menace future pour le Reach. |
| **Le dernier chant** | — | L'interface est sacrifiée pour ouvrir une évacuation ; Éloïse disparaît. |

### 15.10 Quêtes du Tantalus liées

| ID | Personnage | Titre | Résumé |
| --- | --- | --- | --- |
| `ship-s-david` | DAVID-8R | **Effacer ou garder** | DAVID-8R a gardé des fragments de la mise à jour. Il demande s'il doit les effacer. |
| `ship-s-echoa` | ECHO-A | **Après la coupure** | Rétablir la confiance (ou non) après l'interlude. |
| `ship-s-bishop` | BISHOP-9 | **Lignes de code** | Selon `synth-a-bishop`, BISHOP-9 révèle une partie de sa directive de compagnie. |

### 15.11 Récompenses

Outil de commande d'arrêt synthétique, main-d'œuvre synthétique pour Asphodèle (si cuves gardées), recrue possible : **Marta Oyelaran** (ingénieure), entrées de bestiaire synthétiques.

---

## 16. Campagne annexe 3 — « Les Bâtisseurs »

### 16.1 Fiche

| Élément | Contenu |
| --- | --- |
| **Thème** | Découverte de vaisseaux et de lieux des Ingénieurs. |
| **Durée** | ≈ 8 h 20 d'histoire (hors annexes) · 15 missions d'histoire dont 3 intros, 7 annexes, contrats locaux. |
| **Lieux** | Dérive de Tyndare (ceinture d'astéroïdes, épave d'un vaisseau en croissant) → Pangaea (monde ensemencé, écosystème préhistorique) → Hiéron (monde-temple). |
| **Ancrage Alien** | Les Ingénieurs sont une espèce ancienne et immense qui a ensemencé la vie sur certains mondes ; leurs vaisseaux en croissant transportent des ampoules de liquide noir (le Pathogène), qui transforme toute vie qu'il touche ; leurs murs portent des fresques de l'organisme ; ils sont hostiles et indéchiffrables. |
| **Factions** | Weyland-Yutani (équipe d'expédition), Crucible Salvage Compact (découvreurs de l'épave), UPP (une sonde rivale). |
| **Personnages clés** | Inez Harlow, DAVID-8R (traduction des glyphes), Rook ; **Grue** (Crucible, a trouvé l'épave) ; **Dr Anselme Viret**, archéologue de la compagnie ; **le Dormeur**, Ingénieur en stase. |

### 16.2 Pitch

Grue appelle le Tantalus : son équipe a trouvé une épave dans la dérive de Tyndare. Ce n'est pas un vaisseau humain. Il est immense, en forme de croissant, froid, et la moitié de ses récupérateurs ne sont pas revenus d'une baie intérieure remplie d'ampoules.

La compagnie a déjà dépêché une expédition dirigée par le Dr Viret, qui revendique l'épave. L'Administration coloniale veut que le Tantalus sécurise le site. DAVID-8R, qui a des fragments de mémoire liés à des fouilles anciennes de la compagnie, reconnaît les glyphes : une **carte**, menant à un monde ensemencé et à un temple.

### 16.3 Éléments des Ingénieurs utilisés

| Élément | Usage en jeu | Règle |
| --- | --- | --- |
| **Vaisseau en croissant** | Niveaux intérieurs gigantesques, couloirs organiques et minéraux. | Échelle disproportionnée : le joueur se sent minuscule. |
| **Ampoules de Pathogène** | Danger environnemental : une ampoule brisée contamine une zone. | Aucune ampoule n'est une ressource utilisable par le joueur. |
| **Glyphes et carte stellaire** | Énigmes : DAVID-8R déchiffre par fragments, Inez vérifie. | Une traduction n'est jamais certaine : le jeu affiche le degré de confiance. |
| **Fresques** | Collectables narratifs : l'organisme représenté sur les murs, bien avant les humains. | Ne pas expliquer l'origine de l'organisme : suggérer. |
| **Ingénieur en stase** | Boss final. | Un seul Ingénieur vivant dans la campagne. |
| **Créatures issues du Pathogène** | Néomorphes, Deacon/Protomorph (présents au catalogue). | Nés de la contamination, pas de la ruche. |

### 16.4 Arc 1 — Dérive de Tyndare : « Le croissant » (≈ 2 h 35)

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Intro | **Le camp de Grue** | Arrimage au camp Crucible accroché à un astéroïde voisin. Les survivants de Grue décrivent la baie aux ampoules. Le joueur voit l'épave par le hublot : plus grande que le Tantalus. | `board a drifting vessel` | Découverte d'une épave non humaine. | 25 min |
| 1.2 | Principale | **La brèche** | Entrer dans l'épave par la brèche ouverte par les récupérateurs. Gravité faible, couloirs immenses, aucun son. Premiers corps de récupérateurs : morts de l'intérieur. | `board a drifting vessel` | Horreur par l'environnement. | 35 min |
| 1.3 | Principale | **La baie aux ampoules** | Traverser la baie en évitant de briser les ampoules. Un récupérateur contaminé est encore vivant ; sa transformation donne la première forme pâle (néomorphe). | `escape the quarantine` | Pathogène, transformation. | 40 min |
| 1.4 | Principale | **Le siège du pilote** | Atteindre la salle de navigation : un siège colossal, un pilote fossilisé, et la carte stellaire projetée quand DAVID-8R touche les commandes. | `recover black-box data` | Salle de pilotage, carte. | 30 min |
| 1.5 | Principale | **L'expédition Viret** | L'équipe du Dr Viret arrive pour prélever des ampoules. Négocier, les escorter hors de l'épave pendant que la contamination se répand, ou les laisser. | `hold the extraction zone` | La compagnie veut l'arme. | 25 min |

**Annexes de l'arc 1**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `builders-a-grue` | **Ceux qui ne sont pas revenus** | Grue | Retrouver les plaques des récupérateurs disparus dans l'épave. | Équipe perdue. |
| `builders-a-sonde` | **La sonde rouge** | Rook | Une sonde UPP a déjà scanné l'épave. Récupérer ses données avant qu'elle ne parte. | Rivalité UPP. |
| `builders-a-fresque` | **La première fresque** | Inez Harlow | Photographier une fresque dans une chapelle du vaisseau : l'organisme y est représenté en position de culte. | Fresques des Ingénieurs. |

**Locales (Tyndare)** : récupération dans les débris (`recover black-box data`), abordage de débris (`board a drifting vessel`).

### 16.5 Arc 2 — Pangaea : « Le jardin » (≈ 2 h 55)

Lieu : monde tropical à l'atmosphère lourde, couvert de forêts géantes et d'une faune rappelant les grands reptiles préhistoriques. La carte indique que les Ingénieurs l'ont **ensemencé**. Le Pathogène y a été déversé à nouveau il y a peu : les prédateurs locaux deviennent les hôtes de castes **Sauria** (castes existantes du chapitre).

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Intro | **Sous la canopée** | Atterrissage dans une clairière. Faune immense, indifférente. Les sons de la forêt s'arrêtent d'un coup : premier contact avec une caste Sauria. | `track an apex specimen` | L'organisme prend la forme de son hôte. | **Pangaea** | 25 min |
| 2.2 | Principale | **L'autel de pierre** | Trouver le monolithe des Ingénieurs repéré sur la carte. Au pied : des traces de Pathogène récent et un camp abandonné de l'expédition Viret. | `recover black-box data` | Site d'ensemencement. | — | 35 min |
| 2.3 | Principale | **Trois nids** | Contenir trois nids Sauria répartis dans les biomes (marais, falaises, forêt) avant que l'infection ne passe aux troupeaux sains. | `seal the hive` | Infection d'un écosystème. | **Pangaea** (trois nids, infection par biome) | 45 min |
| 2.4 | Principale | **Les hôtes sains** | Sauver trois animaux hôtes non infectés pour qu'Inez puisse étudier le Pathogène sans organisme. | `capture a live organism` | Science contre urgence. | **Pangaea** (trois hôtes) | 30 min |
| 2.5 | Principale | **Le Porte-Ruche Colosse** | Neutraliser la créature colossale qui porte la ruche Sauria sur son dos. Boss de grande échelle en forêt. | `track an apex specimen` | Hôte gigantesque. | **Pangaea** (boss existant) | 40 min |

**Annexes de l'arc 2**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `builders-a-viret` | **Le carnet de Viret** | Dr Viret (ou ses notes) | Retrouver le campement de l'expédition : la compagnie a versé une ampoule pour « tester la réaction de l'écosystème ». | La compagnie expérimente. |
| `builders-a-troupeau` | **Le troupeau** | Leila Sørensen | Guider un troupeau sain vers un plateau à l'écart de l'infection. Mission sans tir sur la faune. | Préserver la vie, pas seulement tuer. |

**Locales (Pangaea)** : purge de nid (`purge a reactor nest`), capture de spécimen (`capture a live organism`), sauvetage d'équipe scientifique (`rescue survivors`).

### 16.6 Arc 3 — Hiéron : « Le temple » (≈ 2 h 50)

Lieu : monde froid et sans vie apparente. Une structure en forme de dôme taillée dans la montagne. À l'intérieur : une chambre de semence, des milliers d'ampoules, et un Ingénieur en stase.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Intro | **Le dôme** | Approche sous une tempête de neige. Le dôme s'ouvre seul quand DAVID-8R s'en approche. | `navigate the vent network` | Architecture des Ingénieurs. | 25 min |
| 3.2 | Principale | **La salle des fresques** | Traverser une galerie de fresques : ensemencement de mondes, puis l'organisme, puis la destruction. Collectables narratifs. | `recover black-box data` | Fresques, mythologie suggérée. | 35 min |
| 3.3 | Principale | **La chambre de semence** | La chambre est réglée pour ensemencer : la carte de Tyndare n'était pas un souvenir, c'était un **plan de route**. Les cibles incluent des mondes colonisés par les humains. Couper l'alimentation des ampoules pendant que des Deacon/Protomorph sortent des cuves. | `escape the quarantine` | Arme biologique ancienne. | 45 min |
| 3.4 | Principale | **Le Dormeur** | L'expédition Viret réveille l'Ingénieur en stase pour « communiquer ». Il tue l'expédition. | `hold the extraction zone` | Ingénieur hostile. | 20 min |
| 3.5 | Finale | **Le bâtisseur** | Combat contre l'Ingénieur dans la chambre de semence, puis choix final. | `track an apex specimen` | Boss à l'échelle surhumaine. | 45 min |

**Annexes de l'arc 3**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `builders-a-david` | **Ce que DAVID lit** | DAVID-8R | DAVID-8R traduit une fresque qui le concerne : des êtres « faits par d'autres ». Il demande ce que cela fait de lui. | Créateurs et créatures. |
| `builders-a-viret2` | **Le dernier message de Viret** | Dr Viret (mourant, s'il a été épargné) | Transmettre son rapport à la compagnie, ou le détruire. | Choix de qui sait. |

### 16.7 Cinématiques

| ID | Titre | Moment | Contenu |
| --- | --- | --- | --- |
| CB-01 | **Plus grand que nous** | 1.1 | Le Tantalus approche du croissant ; il tient dans une seule de ses baies. |
| CB-02 | **La carte** | 1.4 | DAVID-8R pose la main sur la console ; les étoiles s'allument dans la salle. Il sourit. |
| CB-03 | **Le jardin** | 2.1 | Un troupeau traverse la clairière ; derrière lui, une silhouette noire suit dans les arbres. |
| CB-04 | **Le réveil** | 3.4 | Le Dormeur ouvre les yeux. Viret parle ; l'Ingénieur se lève. |
| CB-05 | **Fin** (×3) | Fin 3.5 | Selon le choix final. |

### 16.8 Choix et fins

| Fin | Choix | Conséquence |
| --- | --- | --- |
| **« Que rien ne germe »** | Détruire la chambre de semence et la carte | La menace disparaît, la connaissance aussi. Inez désapprouve, Noor approuve. |
| **« Le prix du savoir »** | Emporter la carte et des échantillons scellés pour l'Administration | Recherche ++, mais le Tantalus transporte un danger : risque de crise `pathogen` à bord plus tard. |
| **« Livré au client »** | Laisser le site à la compagnie (rapport de Viret transmis) | W-Y obtient l'arme ; la campagne 5 commence avec des ennemis issus du Pathogène supplémentaires. |

### 16.9 Quêtes du Tantalus liées

| ID | Personnage | Titre | Résumé |
| --- | --- | --- | --- |
| `ship-b-david` | DAVID-8R | **Créé par d'autres** | Suite de `builders-a-david` ; sa réponse change son attitude jusqu'à l'épilogue. |
| `ship-b-harlow` | Inez Harlow | **Ne pas toucher** | Inez veut étudier un échantillon ; Noor veut l'incinérer. Arbitrer. |
| `ship-b-rook` | Rook | **Les étoiles de la carte** | Identifier les mondes visés par la chambre de semence ; certains sont peuplés. |

### 16.10 Récompenses

Scanner de contamination (détecte le Pathogène), entrées de bestiaire Ingénieurs et Sauria, amélioration du scaphandre (froid extrême), recrue possible : **Grue** (si alliée sur deux campagnes).

---

## 17. Campagne annexe 4 — « Fièvre noire »

### 17.1 Fiche

| Élément | Contenu |
| --- | --- |
| **Thème** | Infection au Pathogène : contamination, quarantaine, mutation. |
| **Durée** | ≈ 7 h d'histoire (hors annexes) · 13 missions d'histoire dont 3 intros, 7 annexes, contrats locaux. |
| **Lieux** | Pallas Rift (fracture minière et laboratoires Pathogen) → vaisseau-hôpital *Clémence* (en orbite) → Station Orphée (station de recherche et réseau de défense). |
| **Ancrage Alien** | Le Pathogène transforme les êtres vivants qu'il touche (spores, eau, contact) ; il donne des créatures pâles et rapides, sans ruche ; une quarantaine qui échoue tue une colonie ; la compagnie veut le Pathogène comme arme. |
| **Factions** | Colons de Pallas Rift, Weyland-Yutani (laboratoires), Marines coloniaux. |
| **Personnages clés** | Noor Okafor (meneur médical), Inez Harlow, Jun Park ; **Dr Hana Szabo**, médecin-chef du *Clémence* ; **Aurèle Moreau**, directeur des laboratoires de Pallas Rift. |

### 17.2 Pitch

Pallas Rift est une colonie minière construite dans une fracture géante. Ses foreuses ont percé une cavité ancienne remplie d'un liquide noir. Six semaines plus tard, la colonie demande une évacuation médicale : « fièvre, éruptions noires, comportements violents ». Le vaisseau-hôpital *Clémence* a été envoyé, puis s'est tu.

Le Tantalus arrive en fin de chaîne : une colonie qui pourrit de l'intérieur, un hôpital en orbite peut-être perdu, et une station de défense, Orphée, qui contrôle les satellites de quarantaine du système et qui a reçu l'ordre de **tirer sur tout départ**.

### 17.3 Mécaniques propres

| Mécanique | Effet |
| --- | --- |
| **Contamination** | Jauge d'exposition pour chaque Marine : spores en zones humides, eau, contact avec les infectés. Au-delà d'un seuil, le Marine doit être traité, sinon il se transforme (perte définitive). |
| **Masque et filtres** | Ressource consommable ; Jun Park améliore les filtres. |
| **Triage** | Les survivants doivent être testés avant évacuation : faux négatifs possibles. |
| **Ennemis sans ruche** | Néomorphes et formes pâles (catalogue) : chasse en solitaire, imprévisible, sans Reine à tuer. |
| **Crise à bord** | Le Tantalus peut subir une crise de type `pathogen` (`world-crisis-core.js`) si un contaminé est embarqué. |

### 17.4 Arc 1 — Pallas Rift : « La fracture » (≈ 2 h 40)

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Intro | **La pluie noire** | Atterrissage dans la fracture. La pluie ruisselle sur des parois tachées de noir. Les colons survivants se sont barricadés dans l'infirmerie et tirent sur tout ce qui bouge. Établir le contact sans tirer. | `rescue survivors` | Colonie contaminée, survivants paniqués. | 25 min |
| 1.2 | Principale | **Le triage** | Tester les colons avec le matériel de Noor. Certains résultats sont incertains : le joueur décide qui embarque. Une éclosion pendant le triage. | `rescue survivors` | Test, faux négatif, éclosion. | 35 min |
| 1.3 | Principale | **Les réservoirs** | Le Pathogène se propage par l'eau. Descendre avec Jun Park couper les réservoirs du niveau bas, envahis de spores. | `purge a reactor nest` | Contamination par l'eau. | 35 min |
| 1.4 | Principale | **La cavité** | Atteindre la cavité forée : des parois sculptées, des ampoules fendues (lien campagne 3). Le liquide s'écoule toujours. Sceller le puits. | `seal the hive` | Cache ancienne de Pathogène. | 40 min |
| 1.5 | Principale | **Le directeur Moreau** | Moreau, directeur des laboratoires W-Y de la colonie, demande une escorte vers son laboratoire « pour sauver les données du vaccin ». Il ment à moitié. | `escort a colony convoy` | La compagnie protège ses données. | 25 min |

**Annexes de l'arc 1**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `fever-a-ecole` | **L'école du niveau 3** | Une institutrice | Évacuer une classe retranchée ; tous les enfants doivent être testés. | Civils, triage. |
| `fever-a-foreuse` | **Le foreur** | Le chef foreur | Il a vu le liquide en premier. Le retrouver dans les galeries ; il est infecté mais lucide. | Témoin contaminé. |
| `fever-a-noor` | **Les mains de Noor** | Noor Okafor | Noor s'est exposé pendant le triage. Le joueur doit l'emmener au traitement avant le seuil. | Un membre d'équipage en danger. |

**Locales (Pallas Rift)** : purge de réservoir, recherche de disparus, sceller une galerie.

### 17.5 Arc 2 — Vaisseau-hôpital *Clémence* : « Les lits » (≈ 2 h)

Lieu : vaisseau-hôpital civil en orbite, rempli de patients évacués de Pallas Rift. Silencieux depuis douze jours.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Intro | **Arrimage** | Le *Clémence* tourne lentement. Les lumières de garde clignotent. Les sas s'ouvrent sur des couloirs vides et des lits défaits. | `board a drifting vessel` | Vaisseau silencieux. | 25 min |
| 2.2 | Principale | **Le service d'isolement** | Traverser le service d'isolement, où les patients se sont transformés. Combat en couloirs étroits, portes à souder. | `escape the quarantine` | Soudure de portes, couloirs. | 40 min |
| 2.3 | Principale | **Dr Szabo** | Retrouver la médecin-chef, enfermée en pharmacie. Elle a tenu un journal : les patients transformés ont été « réclamés » par une navette W-Y venue d'Orphée. | `rescue survivors` | Récupération de spécimens humains. | 30 min |
| 2.4 | Principale | **Le cœur du vaisseau** | Rétablir la propulsion et le support-vie pour ramener le *Clémence* sur une orbite stable avant qu'Orphée ne le classe comme menace. | `restore atmospheric processing` | Survie technique, satellites de quarantaine. | 30 min |

**Annexes de l'arc 2**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `fever-a-maternite` | **La maternité** | Dr Szabo | Une mère et son nouveau-né, cachés dans une soute. Le test du bébé est négatif ; celui de la mère ne l'est pas. | Choix humain sous quarantaine. |
| `fever-a-park` | **Les filtres** | Jun Park | Récupérer les filtres médicaux du *Clémence* pour améliorer les masques. | Équipement de survie. |

### 17.6 Arc 3 — Station Orphée : « La décision » (≈ 2 h 10)

Lieu : station de recherche et de défense W-Y en orbite haute ; elle contrôle les satellites de quarantaine du système et abrite un laboratoire secret.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Intro | **Feu de quarantaine** | Les satellites d'Orphée tirent sur une navette civile qui tente de fuir Pallas Rift. Le Tantalus doit s'approcher sans être pris pour cible : le dropship d'Orlov passe sous le réseau. | `hold the extraction zone` | Quarantaine armée. | 25 min |
| 3.2 | Principale | **Le laboratoire du niveau zéro** | Le laboratoire secret d'Orphée étudie les patients du *Clémence*. Les sujets se sont échappés. Combat contre les formes les plus avancées (Deacon/Protomorph du catalogue). | `escape the quarantine` | Laboratoire de la compagnie. | 40 min |
| 3.3 | Principale | **Le vaccin et l'arme** | Les données de Moreau contiennent deux choses : un traitement de l'exposition précoce, et une souche stabilisée destinée à la compagnie. | `recover black-box data` | Arme biologique contre soin. | 25 min |
| 3.4 | Finale | **Le réseau de défense** | Prendre le contrôle des satellites d'Orphée pendant que la station est envahie, puis décider du sort de Pallas Rift. | `destroy a neuro-link relay` | Satellites de quarantaine, décision de stérilisation. | 40 min |

**Annexes de l'arc 3**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `fever-a-moreau` | **Le vrai Moreau** | Inez Harlow | Retrouver les ordres reçus par Moreau : la cavité était connue avant le forage. | La compagnie savait. |
| `fever-a-szabo` | **Les patients de Szabo** | Dr Szabo | Retrouver les patients encore humains dans les cellules du laboratoire. | Sujets d'expérience. |

### 17.7 Cinématiques

| ID | Titre | Moment | Contenu |
| --- | --- | --- | --- |
| CF-01 | **Fièvre** | Appel | Message vidéo d'un médecin de Pallas Rift : sa main gantée est tachée de noir. |
| CF-02 | **Le test** | 1.2 | Le scanner hésite, affiche `INDÉTERMINÉ`. Le colon regarde Echo-9. |
| CF-03 | **Les lits vides** | 2.1 | Travelling le long de cent lits défaits sur le *Clémence*. |
| CF-04 | **Tir de quarantaine** | 3.1 | Une navette explose en silence devant le Tantalus. |
| CF-05 | **Fin** (×3) | Fin 3.4 | Selon la décision finale. |

### 17.8 Choix et fins

| Fin | Décision sur Pallas Rift | Conséquence |
| --- | --- | --- |
| **« Les vivants d'abord »** | Désarmer les satellites, évacuer tous les survivants testés | Risque de propagation, mais des centaines de vies sauvées ; le traitement est transmis à l'Administration. |
| **« Le feu »** | Laisser les satellites stériliser la colonie | Aucune propagation ; perte morale lourde (moral et confiance de Noor en baisse durable). |
| **« Le marché »** | Remettre la souche stabilisée à la compagnie contre l'évacuation | Évacuation assurée, mais W-Y obtient une arme (ennemis supplémentaires dans la campagne 5). |

### 17.9 Quêtes du Tantalus liées

| ID | Personnage | Titre | Résumé |
| --- | --- | --- | --- |
| `ship-f-okafor` | Noor Okafor | **Après la fièvre** | Selon la fin, Noor doute de son métier ou en sort renforcé. |
| `ship-f-park` | Jun Park | **Respirer** | Améliorer les filtres du Tantalus avec ceux du *Clémence*. |
| `ship-f-vega` | Mara Vega | **L'ordre de tir** | Vega revient sur la décision d'Orphée : qui avait l'autorité ? |

### 17.10 Récompenses

Traitement d'exposition précoce (consommable), masques améliorés, entrées de bestiaire Pathogène, recrue possible : **Dr Hana Szabo** (médecin).

---

## 18. Campagne annexe 5 — « Le banc d'essai »

### 18.1 Fiche

| Élément | Contenu |
| --- | --- |
| **Thème** | Expériences de Weyland-Yutani sur des colonies et des vaisseaux. |
| **Durée** | ≈ 8 h 50 d'histoire (hors annexes) · 15 missions d'histoire dont 3 intros, 7 annexes, contrats locaux. |
| **Lieux** | MIRE-9 (monde-labyrinthe) → transport colonial *Bonne-Espérance* → Khepri Forge (fonderies militaires et broods blindés). |
| **Ancrage Alien** | La compagnie traite les colons comme des hôtes potentiels ; elle cherche à contrôler l'organisme et à en faire une arme ; ses programmes sont légaux sur le papier ; elle sacrifie des colonies entières par contrat. |
| **Factions** | Weyland-Yutani, **ATARAX Directorate** (faction existante, hostile : programme de contrôle neuronal des organismes), **K-Series Brood** (faction existante : lignée blindée élevée à Khepri), Marshals coloniaux. |
| **Personnages clés** | Mara Vega, BISHOP-9, Cal Mercer ; **Directrice Halloran** (enfin en personne) ; **Dr Corwin Asch**, directeur du programme ATARAX ; **Capitaine Rask** (s'il a survécu, campagne 1). |

### 18.2 Pitch

Tous les fils remontent au même endroit. Les registres de Base Ombelle (campagne 1), les contrats Hyperdyne (campagne 2), le rapport Viret (campagne 3) et les ordres de Moreau (campagne 4) citent un même destinataire : **Khepri Forge**, complexe militaire de la compagnie, et son programme **ATARAX**.

Avant Khepri, deux sites servent de bancs d'essai : **MIRE-9**, une colonie construite comme un labyrinthe d'observation, et le **Bonne-Espérance**, un transport colonial dont les deux mille colons en hypersommeil n'ont jamais été informés de leur rôle.

### 18.3 Le programme MIRE — [PROPOSÉ]

Le catalogue mentionne déjà les « archives MIRE et anomalies temporelles » et l'opération **Mire Archive 001** (rejouer les événements du Nostromo, score de synchronisation, sauvegarde isolée). Proposition : **MIRE est le programme de modélisation de la compagnie.** Il reconstitue des incidents historiques à partir d'archives pour en tirer des protocoles. MIRE-9 est la colonie où ces modèles sont testés sur des humains réels.

### 18.4 Arc 1 — MIRE-9 : « Le labyrinthe » (≈ 2 h 50)

Lieu : colonie aux rues identiques, murs mobiles, caméras partout. Les habitants croient vivre dans une colonie minière ordinaire.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Intro | **Une colonie trop calme** | Le Tantalus répond à une balise. Les colons accueillent les Marines avec méfiance ; tout semble normal, sauf que les rues changent de forme la nuit. | `defend the colony` | Colonie sous observation. | — | 25 min |
| 1.2 | Principale | **Les murs bougent** | Les murs mobiles se referment et isolent un quartier ; des organismes y sont lâchés. Guider les colons hors du labyrinthe. | `rescue survivors` | Expérience sur des humains. | — | 40 min |
| 1.3 | Principale | **La salle d'observation** | Trouver la salle de contrôle cachée : des écrans, des fiches sur chaque colon, des scénarios numérotés. | `recover black-box data` | La compagnie observe. | — | 30 min |
| 1.4 | Principale | **Le modèle Nostromo** | Les consoles MIRE rejouent un incident historique pour tester des réactions. Le joueur entre dans la simulation pour récupérer la clé du labyrinthe. | `escape the quarantine` | Archive historique comme outil d'expérience. | **Mire Archive 001** (simulation historique, sauvegarde isolée) | 45 min |
| 1.5 | Principale | **Ouvrir les murs** | Bloquer les murs mobiles et évacuer toute la colonie vers le Tantalus et Asphodèle. | `escort a colony convoy` | Évacuation de masse. | — | 30 min |

**Annexes de l'arc 1**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `bench-a-fiches` | **Votre fiche** | Asha Mbaye | Asha trouve une fiche à son nom : la compagnie suivait aussi les liaisons coloniales. | Surveillance. |
| `bench-a-enfant` | **Le scénario 14** | Une colonne | Un enfant manque à l'appel : il est dans le quartier du prochain scénario. | Expérience sur des innocents. |
| `bench-a-palimpste` | **Les archives** | DAVID-8R | Une liaison vers Palimpste, monde d'archives MIRE : récupérer d'anciens dossiers d'incidents. | Archives de la compagnie. |

**Locales (MIRE-9)** : défense de quartier, recherche de disparus, sceller une ouverture.

### 18.5 Arc 2 — Transport colonial *Bonne-Espérance* : « Deux mille dormeurs » (≈ 2 h)

Lieu : transport colonial à la dérive, programmé pour rejoindre Khepri Forge en pilote automatique. Deux mille colons en hypersommeil.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Durée |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Intro | **Le vaisseau qui dort** | Abordage. Les baies d'hypersommeil sont intactes, les caissons fonctionnent. Seul l'équipage est absent. | `board a drifting vessel` | Hypersommeil, vaisseau à la dérive. | 25 min |
| 2.2 | Principale | **Les caissons verts** | Un tiers des caissons sont marqués en vert dans le registre. Inez scanne : ces colons portent un embryon, implanté pendant leur sommeil. | `rescue survivors` | Hôtes humains à leur insu. | 30 min |
| 2.3 | Principale | **L'équipage** | Retrouver l'équipage dans les ponts techniques : il a appris la vérité et s'est barricadé. Certains caissons verts ont commencé à éclore. | `escape the quarantine` | Éclosion. | 40 min |
| 2.4 | Principale | **Changer de cap** | Reprendre la passerelle et dérouter le *Bonne-Espérance* vers Asphodèle ou Port-Méridien. Défendre la passerelle pendant le calcul de trajectoire. | `hold the extraction zone` | Pilote automatique de la compagnie. | 30 min |

**Annexes de l'arc 2**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `bench-a-noor` | **Les caissons verts** | Noor Okafor | Tenter de retirer des embryons avant éclosion, au bloc du vaisseau. Chaque réussite sauve un colon. | Chirurgie d'urgence. |
| `bench-a-capitaine` | **Le journal du commandant** | Cal Mercer | Retrouver le journal du commandant du transport : il a signé l'itinéraire sans connaître la cargaison. | Responsabilité dans la chaîne. |

### 18.6 Arc 3 — Khepri Forge : « La forge » (≈ 3 h 55)

Lieu : planète-forteresse industrielle. Fonderies, hangars d'essai de chargeurs de combat, élevages de la lignée blindée K-Series, centre de commande ATARAX.

| # | Type | Titre | Déroulé | Objectif de base | Ancrage Alien | Réutilise | Durée |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Intro | **Les fonderies** | Infiltration de nuit dans les fonderies, entre coulées de métal et broods blindés en cage. Rask (s'il est vivant) ouvre une porte de service. | `navigate the vent network` | Usine d'armement de la compagnie. | — | 30 min |
| 3.2 | Principale | **Les quatre chargeurs** | Un siège éclate quand les broods blindés s'échappent. Prendre un chargeur de combat de nouvelle génération (Atlas, Vulcain, Cerbère ou Méduse), choisir la route rouge ou noire, rompre trois sièges et neutraliser la Reine de siège. | `secure the power loader` | Chargeur, Reine. | **Protocole Z-110** (quatre loaders, deux routes, Reine de siège Morrigan) | 50 min |
| 3.3 | Principale | **La fausse reine** | Le programme ATARAX a construit une armure-reine qui commande les castes. La porter pour recruter une meute, commander les trois artères (Griffe, Ombre, Rempart) et ouvrir la chambre royale du complexe. | `seal the hive` | Contrôle neuronal de l'organisme. | **A.T.A.X.-Q · la fausse reine** | 50 min |
| 3.4 | Principale | **Dr Asch** | Atteindre le centre ATARAX. Asch explique tout : les lignées, Murmure, le Pathogène, MIRE, Cocyte. Il ne s'excuse pas : il cite le contrat. | `recover black-box data` | La logique de la compagnie. | — | 25 min |
| 3.5 | Principale | **Halloran** | La Directrice Halloran arrive avec une équipe de commandos (« Weyland-Yutani Commando » au catalogue). Confrontation : le dossier complet, les Marshals coloniaux et l'ICC contre les clauses. | `hold the extraction zone` | Affrontement avec la compagnie. | — | 30 min |
| 3.6 | Finale | **Talos contre le Titan** | Asch libère le Titan, organisme géant produit par le programme. Qualifier le prototype lourd TALOS, affronter le Titan en cinq phases dans une arène destructible, puis rejoindre le hangar de récupération. | `track an apex specimen` | Organisme-arme, exosquelette de combat. | **Talos contre le Titan** | 50 min |

**Annexes de l'arc 3**

| ID | Titre | Donneur | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `bench-a-bishop` | **La directive d'origine** | BISHOP-9 | Au centre ATARAX, BISHOP-9 trouve la source de sa directive de préservation. Il peut la supprimer, la garder, ou la livrer comme preuve. | Synthétique face à ses créateurs. |
| `bench-a-cages` | **Les cages** | Inez Harlow | Les élevages contiennent aussi des colons de Cocyte disparus, encore vivants. Les libérer. | Le fil QZ17 aboutit. |

**Locales (Khepri Forge)** : sabotage de fonderie, récupération de prototypes (`secure the power loader`), purge d'élevage (`purge a reactor nest`).

### 18.7 Cinématiques

| ID | Titre | Moment | Contenu |
| --- | --- | --- | --- |
| CE-01 | **Le même destinataire** | Appel | Inez aligne quatre documents sur la table du briefing ; une seule adresse surlignée : KHEPRI FORGE. |
| CE-02 | **Les rues qui bougent** | 1.2 | Vue aérienne de MIRE-9 : les murs pivotent comme un mécanisme. |
| CE-03 | **Deux mille dormeurs** | 2.1 | Travelling dans la baie d'hypersommeil ; les caissons verts s'allument un par un. |
| CE-04 | **Le contrat** | 3.4 | Asch ouvre un dossier : la signature de Halloran sur l'ordre de livraison QZ17. |
| CE-05 | **Face à face** | 3.5 | Halloran entre, polie, flanquée de commandos. « Vous êtes en infraction, commandante. Clause 14. » |
| CE-06 | **Fin** (×3) | Fin 3.6 | Selon le dossier et les choix. |

### 18.8 Fins

| Fin | Condition | Conséquence |
| --- | --- | --- |
| **« Le dossier »** | Dossier complet (fil QZ17 ≥ 6 pièces, §19) + Halloran arrêtée par les Marshals | Le programme ATARAX est suspendu par l'ICC ; Port-Méridien et les colonies du Reach sont protégés. Fin la plus favorable. |
| **« La forge en flammes »** | Dossier incomplet + Khepri Forge détruite | Le programme est détruit, mais la compagnie nie tout ; le Tantalus est poursuivi pour sabotage. |
| **« Clause 14 »** | Le joueur cède à Halloran | Le Tantalus repart avec ses réfugiés ; Khepri continue ailleurs, sous un autre nom. |

### 18.9 Quêtes du Tantalus liées

| ID | Personnage | Titre | Résumé |
| --- | --- | --- | --- |
| `ship-e-vega` | Mara Vega | **Désobéir** | Avant Khepri, Vega doit décider si elle franchit la ligne contre la compagnie. |
| `ship-e-bishop` | BISHOP-9 | **Libre de quoi ?** | Suite de `bench-a-bishop`. |
| `ship-e-mercer` | Cal Mercer | **Le chargeur** | Ramener un chargeur de combat au Tantalus et le remettre en état. |

### 18.10 Récompenses

Chargeur de combat (selon le modèle choisi), accès aux prototypes ATARAX (restreints), réfugiés de MIRE-9 et du *Bonne-Espérance* pour Port-Méridien, recrue possible : **Capitaine Rask** (ancien de la compagnie).

---

## 19. Le fil QZ17 — ce qui relie les campagnes — [PROPOSÉ]

Chaque campagne révèle une pièce de l'origine des œufs livrés à Cocyte.

| Pièce | Campagne | Ce qu'elle établit |
| --- | --- | --- |
| Ordres de livraison de CASSIUS | Principale | Les conteneurs QZ17 passaient par Asphodèle. |
| Registres de Base Ombelle | 1 · La Saison des Reines | Les œufs venaient de la Red Hive, sur TR-0. |
| Contrats Hyperdyne / W-Y | 2 · Directive zéro | La compagnie voulait un synthétique capable de commander une ruche. |
| Rapport Viret | 3 · Les Bâtisseurs | La compagnie expérimente le Pathogène des Ingénieurs. |
| Ordres de Moreau | 4 · Fièvre noire | La cavité de Pallas Rift était connue avant le forage. |
| Signature de Halloran | 5 · Le banc d'essai | L'ordre de livraison QZ17 vient de la direction régionale. |
| Colons de Cocyte retrouvés à Khepri | 5 · Le banc d'essai | Les disparus de Port-Méridien servaient d'hôtes. |

**Règle :** une pièce n'est acquise que si la mission correspondante est réussie et le compte rendu validé, comme les dossiers existants (`campaign-story-v160.js`). Le nombre de pièces détermine la fin de la campagne 5.

## 20. Synthèse de production — [PROPOSÉ]

| Campagne | Missions d'histoire (intros comprises) | Annexes | Cinématiques | Chapitres existants à déplacer | Nouveaux lieux à construire |
| --- | --- | --- | --- | --- | --- |
| 1 · La Saison des Reines | 15 | 9 | 6 | Abysse Noir, Broodstorm, Reine-Mère, Ruche-monde | Sous-Récif, Gorge-Seize, Base Ombelle |
| 2 · Directive zéro | 15 (dont interlude) | 8 | 6 | Jeri, Éloïse | Caravanes, Sel-Blanc, Kéos, base de Murmure |
| 3 · Les Bâtisseurs | 15 | 7 | 5 | Pangaea | Épave de Tyndare, dôme de Hiéron |
| 4 · Fièvre noire | 13 | 7 | 5 | — (systèmes de survie réutilisés) | Pallas Rift, *Clémence*, Orphée |
| 5 · Le banc d'essai | 15 | 7 | 6 | Mire Archive 001, Z-110, A.T.A.X.-Q, Talos | MIRE-9, *Bonne-Espérance*, Khepri Forge |

**Ordre de production recommandé :** campagne 1 (elle réutilise quatre chapitres déjà jouables) → campagne 5 (quatre chapitres) → campagne 2 (deux chapitres) → campagne 3 → campagne 4. Chaque campagne suit le raccordement technique du §11 (contenu, persistance, récompenses en transaction, tests de parcours et de reprise).

**Durées :** estimations de conception à confirmer en test, calculées en additionnant les durées cibles des missions d'histoire (25 à 60 minutes chacune). Les annexes ajoutent environ 2 à 3 heures par campagne.


---

# PARTIE III — Missions uniques sur les mondes du catalogue

## 21. Principes — [PROPOSÉ]

### 21.1 Trois modes selon la chronologie

Le jeu se déroule en **2204** (`year: 2204` dans les campagnes du code). Chaque monde de la franchise a ses propres événements, avant ou après cette date. Une mission sur ce monde prend l'un de trois modes :

| Mode | Quand | Principe | Exemple |
| --- | --- | --- | --- |
| **Héritage** | Les événements de l'œuvre ont eu lieu **avant 2204** | Le Tantalus visite le lieu **après coup** : ruines, épaves, survivants, ce que la compagnie a laissé ou cherche encore. | Les ruines d'Hadley's Hope, vingt-cinq ans après sa destruction. |
| **Préquelle** | Les événements de l'œuvre auront lieu **après 2204** | Le Tantalus visite le lieu **avant** sa catastrophe : il découvre les premiers signes, mais ne peut pas empêcher ce que l'œuvre raconte. | LV-1201, vingt-six ans avant l'Incident de 2230. |
| **Archive MIRE** | Pour revivre un lieu **pendant son activité**, avant une catastrophe antérieure à 2204 | Reconstitution par le programme MIRE (§18.3), jouée dans une **sauvegarde isolée**, comme l'opération existante Mire Archive 001. Elle n'a aucun effet sur la campagne. | Hadley's Hope en activité, quelques semaines avant la perte de contact. |

### 21.2 Règles de fidélité

1. **Hors archives MIRE fidèles, aucune scène d'une œuvre n'est reconstituée telle quelle.** Une mission se déroule à côté, avant ou après : un autre lieu du même monde, une autre équipe, un autre moment.
2. **Hors archives MIRE fidèles, aucun personnage principal d'une œuvre n'apparaît ni n'est joué.** Les personnages proposés sont originaux. Une œuvre peut être citée par ses traces (un journal, une épave, une date).
3. **Une préquelle ne change pas l'avenir connu.** Le joueur peut sauver des personnes que l'œuvre ne mentionne pas, comprendre une origine, retarder sans empêcher. Ce qui arrive dans l'œuvre arrive quand même.
4. **Un héritage respecte l'état final de l'œuvre.** Un lieu détruit reste détruit ; on visite ses restes.
5. **Une archive MIRE est une reconstitution, de deux types (validé le 2026-11-05).** Les **archives fidèles** reconstituent au plus près les événements connus d'une œuvre, avec ses personnages. Les **archives originales** sont des préquelles ou suites avec des personnages originaux. Dans les deux cas, le jeu les présente comme des modèles de la compagnie.
6. **Une date non confirmée n'est pas inventée.** Pour BG-386, Ryushi et LV-742, le propriétaire a fixé le mode **héritage** (validé le 2026-11-05) : leurs événements ont eu lieu avant 2204.
7. **Les Yautja (validé le 2026-11-05)** restent surtout à l'état de traces (ruines, trophées, armes abandonnées). Ils peuvent **apparaître brièvement** dans des lieux adaptés, sans que les missions soient centrées sur eux. Une **mission dédiée** fait le lien avec *Yautja : la Longue Chasse* (§22.16).

### 21.3 Chronologie de référence

| Année | Œuvre | Monde du catalogue | Mode en 2204 | Source |
| --- | --- | --- | --- | --- |
| 2093 | *Prometheus* (film) | LV-223 | Héritage | Film |
| après 2093 | *Fire and Stone* (bande dessinée) | LV-223 | Héritage | [Wikipédia — Fire and Stone](https://en.wikipedia.org/wiki/Fire_and_Stone) |
| 2122 | *Alien* (film) | USCSS Nostromo, Acheron / LV-426 (épave) | Héritage / archive MIRE | Film |
| 2137 | *Alien: Isolation* (jeu) | Sevastopol (KG-348) | Héritage / archive MIRE | Jeu |
| 2142 | *Alien: Romulus* (film) | Renaissance Station, Jackson's Star | Héritage / archive MIRE | Film |
| entre 2122 et 2179 | *Alien: Rogue Incursion* (jeu) | Purdan (Castor's Cradle) | Héritage | [AvP Central — Rogue Incursion](https://www.avpcentral.com/alien-rogue-incursion) |
| 2179 | *Aliens* (film) | Acheron / LV-426, Gateway Station, Sulaco | Héritage / archive MIRE | Film |
| 2179 | *Alien 3* (film) | Fiorina 161 | Héritage / archive MIRE | Film |
| 2202 | *Aliens: Fireteam Elite* (jeu) | LV-895, Katanga | Héritage (deux ans après) | [Wikipédia — Aliens: Fireteam Elite](https://en.wikipedia.org/wiki/Aliens:_Fireteam_Elite) |
| **2204** | **Aliens: Tantalus Frontier** | Cocyte et Tantalus Reach | — | Code du projet |
| 2230-2231 | *Aliens versus Predator 2* (jeu) | LV-1201 | **Préquelle** | [Wikipédia — Aliens versus Predator 2](https://en.wikipedia.org/wiki/Aliens_Versus_Predator_2) |
| 2381 | *Alien Resurrection* (film) | USM Auriga | **Préquelle** | Film |
| non précisée | *Aliens vs. Predator: Prey* (roman, bande dessinée) | Ryushi | Héritage (décision) | [AvP Central — Prey](https://www.avpcentral.com/aliens-vs-predator-prey) |
| non précisée | *Aliens versus Predator: Extinction* (jeu) | LV-742 | Héritage (décision) | [Wikipédia — Extinction](https://en.wikipedia.org/wiki/Aliens_Versus_Predator:_Extinction) |
| non confirmée | *Aliens vs. Predator* (jeu, 2010) | BG-386 (Freya's Prospect) | Héritage (décision) | [AvP Central — AvP 2010](https://www.avpcentral.com/aliens-vs-predator-2010) |
| non trouvée | — | Ceto, New Galveston, New Albion, Capua VII, Korari | Monde du catalogue sans événement d'œuvre utilisé | Recherche sans résultat confirmé |

Les dates des films sont celles indiquées dans les films eux-mêmes ; elles n'ont pas été revérifiées en ligne pour ce document.

**Freya's Prospect (validé le 2026-11-05) :** fusionné avec BG-386, dont il devient la colonie principale. L'emplacement `world-11-freya-s-prospect` devient un **nouveau monde glacé original**, nom proposé **Hiémale (TR-311)**, identifiant technique conservé.

**Attributs générés (validé le 2026-11-05) :** les biomes et atmosphères des mondes de la franchise seront corrigés à la main (§22.17). Les autres mondes gardent leurs valeurs générées.

---

## 22. Opérations Héritage — mondes de la franchise

Chaque monde reçoit une **chaîne** de 2 à 4 missions, disponible après la campagne principale. Durée indicative : 1 h 30 à 3 h par chaîne.

### 22.1 Acheron / LV-426 — `world-01-acheron-lv-426`

**Repères de l'œuvre :** épave non humaine découverte en 2122 ; colonie Hadley's Hope perdue en 2179, détruite avec son processeur atmosphérique.
**Situation en 2204 :** vingt-cinq ans après. Un cratère, des ruines, une zone que la compagnie surveille toujours de loin.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-acheron-1` | Héritage | **Le cratère** | Une équipe de récupération Crucible a disparu dans les ruines du complexe. Descendre dans la zone de l'explosion, parmi les structures fondues et les débris de la colonie. | `rescue survivors` | Lieu fondateur, ruines d'une colonie perdue. |
| `legacy-acheron-2` | Héritage | **Ce qui a survécu** | Des signes d'activité dans un ancien réseau de drainage, hors du rayon de l'explosion. Établir ce qui vit encore sous la croûte. | `navigate the vent network` | Survivance de l'organisme. |
| `legacy-acheron-3` | Héritage | **Les balises de la compagnie** | La compagnie a semé des capteurs autour de l'épave d'origine. Les relever révèle ce qu'elle surveille encore, et pour qui (pièce optionnelle du fil QZ17). | `recover black-box data` | La compagnie n'abandonne jamais un actif. |
| `mire-acheron` | Archive MIRE | **Avant le silence** | Archive 004, détaillée au §26.5 (5 missions). | — | Revivre une colonie avant sa chute. |

**Variante frontalière** `world-33-acheron-lv-426-prime` : voir §25.

### 22.2 LV-223 — `world-02-lv-223`

**Repères des œuvres :** expédition de 2093 sur un site des Ingénieurs (*Prometheus*) ; après cela, retour d'expéditions qui trouvent une planète transformée par la substance noire (*Fire and Stone*).
**Situation en 2204 :** monde transformé, épaves anciennes, laboratoires des Ingénieurs.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-lv223-1` | Héritage | **La jungle qui n'aurait pas dû être** | Atterrissage sur un monde que les anciens relevés décrivaient comme stérile. La substance noire l'a couvert d'une vie anarchique. Établir un camp et relever la faune. | `track an apex specimen` | Pathogène accélérateur d'évolution. |
| `legacy-lv223-2` | Héritage | **Le dôme scellé** | Une structure des Ingénieurs, rouverte par la végétation. À l'intérieur : des cuves vides et des fresques. Lien direct avec la campagne 3. | `recover black-box data` | Laboratoire des Ingénieurs. |
| `legacy-lv223-3` | Héritage | **L'épave mangée** | Une épave humaine ancienne a été absorbée par la jungle. Récupérer son enregistreur avant une équipe de la compagnie. | `board a drifting vessel` | Restes d'une expédition. |

### 22.3 Fiorina 161 — `world-03-fiorina-161`

**Repères de l'œuvre :** colonie pénitentiaire et fonderie, incident de 2179.
**Situation en 2204 :** installation fermée, fonderie froide, bâtiments abandonnés.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-fury-1` | Héritage | **La fonderie froide** | Des récupérateurs veulent démonter la fonderie. Ils ont réveillé quelque chose dans les galeries du réseau de refroidissement. | `navigate the vent network` | Huis clos industriel. |
| `legacy-fury-2` | Héritage | **L'infirmerie** | Les archives médicales de l'installation sont toujours là. Une équipe militaire réclame les échantillons biologiques conservés. | `recover black-box data` | Échantillons convoités. |
| `mire-fury` | Archive MIRE | **La fonderie** | Archive 005, détaillée au §26.6 (4 missions). | — | Installation en activité. |
| `prequel-fury-auriga` | Préquelle (2381) | **Les échantillons** | Suite directe : l'équipe militaire emporte les échantillons, quoi que fasse le joueur. Il peut seulement savoir **qui** les prend et noter le nom d'un programme militaire. *Alien Resurrection* (2381) part d'échantillons prélevés sur Fiorina 161 ; le jeu ne dit pas lesquels. | `hold the extraction zone` | Préquelle : l'avenir connu ne change pas. |

### 22.4 Sevastopol — `world-04-sevastopol`

**Repères de l'œuvre :** station commerciale Seegson en orbite de KG-348, incident de 2137.
**Situation en 2204 :** la station n'existe plus en tant que telle ; restent des débris en orbite du géant gazeux.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-sevastopol-1` | Héritage | **Le champ de débris** | Naviguer dans les débris en orbite basse de KG-348 pour récupérer un module de serveur Seegson encore alimenté. | `board a drifting vessel` | Épave orbitale. |
| `legacy-sevastopol-2` | Héritage | **Les synthétiques de Seegson** | Le module contient des synthétiques de service hors service. L'un se réveille sur une ancienne consigne. Lien avec la campagne 2. | `recover a synthetic` | Synthétiques Seegson. |
| `mire-sevastopol` | Archive MIRE | **Le dernier quart** | Archive 002, détaillée au §26.3 (4 missions). | — | Station en activité. |

### 22.5 USCSS Nostromo — `world-15-uscss-nostromo`

**Repères de l'œuvre :** remorqueur commercial, incident de 2122, vaisseau détruit.
**Situation en 2204 :** aucun vaisseau à visiter. L'opération existante **Mire Archive 001** (rejouer les événements du Nostromo, score de synchronisation, sauvegarde isolée) reste le seul accès.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `mire-nostromo` | Archive MIRE | **Mire Archive 001** | Chapitre existant **[PARTIEL]**, conflit avec les règles de fidélité et options au §26.2. | — | Archive historique. |
| `legacy-nostromo-1` | Héritage | **La route de Zeta** | Retrouver, le long de la route commerciale, une balise de navigation datant de l'époque du remorqueur. Elle contient un fragment de journal de bord. | `recover black-box data` | Héritage par les traces. |

### 22.6 Jackson's Star et Renaissance Station — `world-12-jackson-s-star`, `world-13-renaissance-station`

**Repères de l'œuvre :** colonie minière de Jackson's Star et station de recherche Renaissance, incident de 2142.
**Situation en 2204 (validé) :** la station est perdue ; la colonie minière est **toujours habitée, en déclin**, sous contrat de la compagnie.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-jackson-1` | Héritage | **Sous la pluie** | Une colonie minière où il ne fait jamais jour. Les contrats de travail sont toujours prolongés d'office. Escorter un convoi de mineurs qui veulent partir. | `escort a colony convoy` | Colons liés par contrat. |
| `legacy-renaissance-1` | Héritage | **Dans les anneaux** | Chercher des débris de la station dans les anneaux de la planète. Un module de laboratoire est intact. | `board a drifting vessel` | Laboratoire de la compagnie. |
| `mire-renaissance` | Archive MIRE | **Avant les anneaux** | Archive 003, détaillée au §26.4 (4 missions). | — | Station de recherche. |

### 22.7 USM Auriga — `world-14-usm-auriga`

**Repères de l'œuvre :** vaisseau-laboratoire militaire, incident de 2381.
**Situation en 2204 :** **préquelle**. L'Auriga n'existe pas encore sous cette forme ; ce qui existe, ce sont les programmes militaires qui y mèneront.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `prequel-auriga-1` | Préquelle | **Le chantier militaire** | Un chantier militaire d'où partira, longtemps après, un vaisseau-laboratoire. Une équipe scientifique y conserve des échantillons issus de Fiorina 161 (lien `prequel-fury-auriga`). Le Tantalus livre une cargaison scellée sans pouvoir l'ouvrir. | `escort a colony convoy` | Préquelle : origine d'un programme futur. |
| `prequel-auriga-2` | Préquelle | **Les premiers essais** | Une alerte de confinement dans un module du chantier. L'éteindre sans que rien ne sorte ; le programme continue. | `escape the quarantine` | Le programme militaire est plus fort que l'incident. |

**Validé (2026-11-05) : les deux.** L'Auriga est jouable en **préquelle** (le chantier, ci-dessus) et en **archive MIRE fidèle** (§26.10). **Limite de cohérence :** en 2204, MIRE ne peut pas reconstituer des événements de 2381. Cette archive est donc proposée **hors chronologie**, comme contenu bonus du menu des archives, et le jeu l'indique.

### 22.8 Sulaco — `world-16-sulaco-drift`

**Repères de l'œuvre :** vaisseau des Marines coloniaux associé aux événements de 2179. Son sort après 2179 varie selon les œuvres ; ce document n'en utilise aucune.
**Situation en 2204 :** « épave militaire et baies de largage » d'après le catalogue.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-sulaco-1` | Héritage | **Les baies de largage** | Une épave militaire en orbite d'Acheron, pillée à moitié. Récupérer du matériel des Marines pour l'armurerie du Tantalus. | `board a drifting vessel` | Matériel des Marines. |
| `legacy-sulaco-2` | Héritage | **La quarantaine du bord** | Un module de la soute est scellé depuis des années. L'ouvrir ou le laisser. | `escape the quarantine` | Ce qu'on scelle reste dangereux. |

**Validé (2026-11-05) :** l'épave est un **vaisseau de la même classe** que le Sulaco, nom proposé **USS Gonfalon**, pour ne contredire aucune œuvre sur le sort du Sulaco.

### 22.9 Gateway Station — `world-17-gateway-station`

**Repères de l'œuvre :** station orbitale près de la Terre, siège d'audiences en 2179.
**Situation en 2204 :** station **en activité**. C'est le lieu naturel de l'audience de l'ICC dans la fin « Le dossier » (§18.8).

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `active-gateway-1` | En activité | **L'audience** | Présenter le dossier QZ17 devant l'ICC. Mission sans combat : choisir quelles pièces présenter, répondre aux avocats de la compagnie. Le résultat dépend des pièces réunies (§19). | `recover black-box data` | La compagnie se défend par le droit. |
| `active-gateway-2` | En activité | **Les quais civils** | Un témoin (Tomas Wren, Rask ou Szabo selon les campagnes faites) doit atteindre la salle d'audience. Des agents de sécurité privés essaient de l'en empêcher, sans arme visible. | `escort a colony convoy` | Intimidation corporative. |

### 22.10 LV-895 et Katanga — `world-06-lv-895`, `world-07-katanga`

**Repères de l'œuvre (2202) :** sur LV-895, la compagnie a trouvé des œufs et du Pathogène ; la station de raffinage Katanga, en orbite, a été détruite ; des stocks de Pathogène et des organismes restent en surface ; Weyland-Yutani et Hyperdyne envoient des forces pour revendiquer la planète.
**Situation en 2204 :** deux ans après. Course entre compagnies.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-lv895-1` | Héritage | **Deux compagnies** | Les équipes de W-Y et d'Hyperdyne se disputent un site de surface. L'Administration demande au Tantalus de constater, pas de choisir. | `hold the extraction zone` | Rivalité de compagnies. |
| `legacy-lv895-2` | Héritage | **Les stocks** | Localiser un stock de Pathogène abandonné avant les deux équipes. Lien avec la campagne 4. | `seal the hive` | Pathogène convoité. |
| `mire-katanga` | Archive MIRE | **Poste de nuit** | Archive 006, détaillée au §26.7 (4 missions). | — | Station en activité. |
| `legacy-katanga-1` | Héritage | **Ce qui reste de Katanga** | Les débris de la station de raffinage sont retombés en orbite basse. Fouiller un fragment pour retrouver des données de production. | `board a drifting vessel` | Épave d'une station infestée. |

### 22.11 Purdan — `world-09-purdan`

**Repères de l'œuvre :** installation Castor's Cradle de Gemini Exoplanet Solutions, entre *Alien* et *Aliens* ; la source consultée laisse son sort final ouvert.
**Situation en 2204 (validé) :** des décennies plus tard, Purdan est **toujours habité, en déclin** ; l'installation de Castor's Cradle est fermée, mais une colonie vit à proximité.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-purdan-1` | Héritage | **L'installation fermée** | Une balise automatique s'est rallumée sur Purdan. Descendre vérifier une installation abandonnée depuis longtemps. Des colons du voisinage y entrent pour récupérer du matériel, et certains ne ressortent pas. | `recover black-box data` | Installation corporative oubliée. |
| `legacy-purdan-2` | Héritage | **Les ruines xénobiologiques** | Explorer des ruines anciennes décrites par le catalogue. | `track an apex specimen` | Ruines anciennes. |

### 22.12 LV-1201 — `world-20-lv-1201`

**Repères de l'œuvre :** colonie de recherche Weyland-Yutani, « Incident » du 25 novembre 2230, Marines arrivés environ six semaines plus tard (AVP2).
**Situation en 2204 :** **préquelle** de 26 ans. Les sources consultées ne donnent pas la date de fondation de la colonie.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `prequel-lv1201-1` | Préquelle | **Le relevé** | Escorter une équipe de relevé de la compagnie dans une jungle de temples. Elle cherche un site pour une future installation. Les guides locaux du relevé meurent un par un, sans témoin. | `escort a colony convoy` | Préquelle : premiers signes d'un monde dangereux. |
| `prequel-lv1201-2` | Préquelle | **Les temples** | Trouver l'origine des disparitions dans un temple ancien : des traces d'une présence non humaine qui n'est pas l'organisme (trophées, marques). Le rapport du joueur est classé par la compagnie ; l'installation sera construite quand même. | `recover black-box data` | La compagnie ignore les avertissements. |

### 22.13 BG-386 — `world-21-bg-386`

**Repères de l'œuvre :** monde minier, colonie de Freya's Prospect, installation secrète de la compagnie bâtie sur des ruines anciennes (AvP 2010). **Année non confirmée dans nos sources ; mode héritage fixé par le propriétaire.** Freya's Prospect est la colonie principale de ce monde.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `bg386-1` | Héritage | **La raffinerie** | Une raffinerie de la colonie a cessé d'émettre. La colonie de Freya's Prospect vit encore autour des ruines de l'incident ; la raffinerie a cessé d'émettre. | `restore atmospheric processing` | Colonie minière. |
| `bg386-2` | Héritage | **Les pyramides** | Explorer des ruines anciennes sous la jungle, au-dessus desquelles la compagnie a construit. | `recover black-box data` | Ruines anciennes, laboratoire secret. |

### 22.14 Ryushi — `world-23-ryushi`

**Repères de l'œuvre :** monde d'élevage géré par la compagnie Chigusa, colonie de Prosperity Wells, détruite pendant l'incident raconté par *Prey*. **Année non précisée ; mode héritage fixé par le propriétaire.**

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `ryushi-1` | Héritage | **Les troupeaux** | Des éleveurs se sont réinstallés après la destruction de Prosperity Wells ; un ranch isolé signale des bêtes éventrées. | `defend the colony` | Hôtes animaux, colonie d'éleveurs. |
| `ryushi-2` | Héritage | **La gorge** | Retrouver une épave non humaine dans une gorge du désert. Il n'en reste qu'une carcasse fouillée depuis longtemps, mais quelque chose y niche. | `board a drifting vessel` | Épave ancienne. |

### 22.15 LV-742 — `world-25-lv-742`

**Repères de l'œuvre :** planète décrite comme terrain de chasse d'une ruche locale (*Extinction*). **Année non précisée ; mode héritage fixé par le propriétaire.** Le catalogue la décrit comme « station de terraformation assiégée ».

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `lv742-1` | Héritage | **Le siège du terraformeur** | Une station de terraformation tient sous un siège permanent. Ravitailler et évacuer une équipe. | `hold the extraction zone` | Terraformation, siège. |
| `lv742-2` | Héritage | **Les pièges** | Des organismes tués par une arme qui n'est pas humaine. Établir qui chasse sur ce monde, sans engager. Une silhouette camouflée peut être aperçue brièvement (§21.2, règle 7). | `track an apex specimen` | Traces d'un autre chasseur. |

### 22.16 Mission dédiée — lien avec *Yautja : la Longue Chasse*

**Validé (2026-11-05) :** une chaîne côté AVP fait le lien avec l'autre jeu du propriétaire. Les Yautja y restent des tiers : le joueur ne les combat pas frontalement et la mission n'est pas centrée sur eux.

**Lieu proposé :** LV-742, décrit par *Extinction* comme terrain de chasse d'une ruche locale (mode héritage).

| ID | Type | Titre | Résumé | Objectif | Ancrage |
| --- | --- | --- | --- | --- | --- |
| `avp-hunt-1` | Annexe | **La réserve** | Une équipe de relevé coloniale a disparu dans une zone où les organismes semblent **parqués** autour de structures anciennes. Le Tantalus la retrouve à moitié : les survivants parlent de « silhouettes qui tremblent dans l'air ». | `rescue survivors` | Terrain de chasse ; présence aperçue, jamais affrontée. |
| `avp-hunt-2` | Annexe | **Les trophées** | Un site de trophées : crânes d'organismes et armes humaines anciennes. Le joueur choisit de ne rien toucher, ou de prélever une pièce pour Inez. Prélever déclenche une traque brève par un chasseur camouflé, que le joueur doit **fuir**. | `escape the quarantine` | Les règles de la chasse ne concernent pas les humains, tant qu'ils ne volent rien. |
| `avp-hunt-3` | Annexe | **La saison** | La ruche de la réserve déborde. Évacuer le dernier camp pendant qu'un chasseur traverse la zone sans s'occuper des Marines. | `hold the extraction zone` | Deux espèces, une seule voie de sortie. |

**Lien avec l'autre jeu — validé le 2026-11-06 (« les trois en parallèle ») :**

| Élément | Choix | Source dans *Yautja : la Longue Chasse* |
| --- | --- | --- |
| Clan | **Gardiens du Confinement** (`CL10`) : doctrine « isolement des menaces incontrôlées » ; gestes « fermer un passage, guider une créature hors du couloir puis maintenir une voie d'extraction » ; « la retenue d'un tir peut compter davantage qu'un trophée si elle préserve le retour des autres » | `app/game/clanWarBibleV6Source.json`, entrée `W3-CL10` (dépôt `darknigthmare/yautja-la-longue-chasse`, commit `23b48e1`) |
| Chasseur partagé | **Garde du Seuil** (`threshold-guard`), responsable du confinement du vaisseau de clan, ici devenu **un ancien** | `app/game/systems/clanShipOperations.ts` (nom, rôle, réplique d'arrivée) |
| Époque | **Bien après** les événements de l'autre jeu | Décision du propriétaire ; aucune date de l'autre jeu n'est reprise ni contredite |
| Objets reconnaissables | Guides et obstacles qui marquent les pistes fermées et ouvertes ; dispositifs visibles retirés ou replacés | Accords `W3-DIP17` (« Réserve disputée ») et `W3-DIP03` (corridor de sortie de la proie) |

**Ce que cela change dans la chaîne :**

- **LV-742 est une réserve tenue par les Gardiens du Confinement.** La ruche locale n'y est pas élevée pour le plaisir de la chasse : le clan la **confine** et ferme les passages vers les zones où d'autres chassent. Les « structures anciennes » de `avp-hunt-1` sont leurs bornes et leurs obstacles de piste.
- **`avp-hunt-1` · La réserve** : les survivants de l'équipe de relevé ont franchi une piste fermée. Echo-9 trouve les guides de piste (bornes, barrières, dispositifs) et peut lire qu'une zone est fermée. Respecter les bornes à la sortie évite toute rencontre.
- **`avp-hunt-2` · Les trophées** : prélever une pièce est, pour ce clan, un acte constaté qui « ouvre enquête ou riposte » (`W3-CL10`, champ *Rupture*). La traque brève reste une fuite ; ne rien prendre la supprime.
- **`avp-hunt-3` · La saison** : la ruche déborde la réserve. Le **Garde du Seuil**, ancien, apparaît une seule fois : il ferme un passage et guide le flux de créatures hors du couloir d'évacuation, puis disparaît. Il ne parle pas aux Marines et ne combat pas à leurs côtés ; si l'escouade tire sur lui, il se retire et le couloir n'est plus tenu (registre A conservé).
- **Pas de lien de sauvegarde** entre les deux jeux à ce stade : le lien est narratif et visuel.

**Règles de fidélité à l'autre jeu :** reprendre les noms, rôles et doctrines tels qu'ils sont écrits dans ses fichiers ; ne pas inventer d'histoire personnelle au Garde du Seuil au-delà de son rôle et de son âge ; faire valider l'apparence d'ancien par le propriétaire, puisque l'autre jeu le dessine avec une illustration fixe de Yautja (`clanShipCrew.ts`, rôle d'art `guard`).

**Apparitions brèves ailleurs (règle 7) :** LV-1201 (traces dans les temples, une silhouette au loin), BG-386 (pyramides), Ryushi (épave de la gorge).

### 22.17 Biomes et atmosphères corrigés — [PROPOSÉ]

**Validé (2026-11-05) :** correction des mondes de la franchise. Les valeurs ci-dessous s'appuient sur la description du catalogue et sur l'œuvre. Une atmosphère marquée « à vérifier » n'est pas établie par nos sources : elle doit être confirmée avant d'être écrite dans le code.

| Monde | ID | Biomes actuels | Biomes proposés | Atmosphère actuelle | Atmosphère proposée |
| --- | --- | --- | --- | --- | --- |
| Acheron / LV-426 | `world-01-acheron-lv-426` | industrial / caverns | industrial / ruins | breathable | storm |
| LV-223 | `world-02-lv-223` | foundry / habitation | jungle / ruins | toxic | toxic |
| Fiorina 161 | `world-03-fiorina-161` | cryogenic / reactor | foundry / caverns | thin | à vérifier |
| Sevastopol | `world-04-sevastopol` | jungle / ruins | orbital / ruins | corrosive | vacuum |
| LV-895 | `world-06-lv-895` | badlands / laboratory | jungle / ruins | storm | à vérifier |
| Katanga | `world-07-katanga` | orbital / hive | orbital / ruins | breathable | vacuum |
| Purdan | `world-09-purdan` | industrial / caverns | colony / ruins | thin | à vérifier |
| Jackson's Star | `world-12-jackson-s-star` | jungle / ruins | colony / mines | storm | storm |
| Renaissance Station | `world-13-renaissance-station` | oceanic / mines | orbital / laboratory | breathable | vacuum |
| USM Auriga | `world-14-usm-auriga` | badlands / laboratory | shipyard / laboratory | toxic | vacuum |
| USCSS Nostromo | `world-15-uscss-nostromo` | orbital / hive | orbital / reactor | thin | vacuum |
| Épave de même classe (Sulaco Drift) | `world-16-sulaco-drift` | colony / shipyard | orbital / shipyard | corrosive | vacuum |
| Gateway Station | `world-17-gateway-station` | industrial / caverns | orbital / habitation | vacuum | breathable (intérieur) |
| LV-1201 | `world-20-lv-1201` | jungle / ruins | jungle / ruins | toxic | à vérifier |
| BG-386 (et Freya's Prospect) | `world-21-bg-386` | oceanic / mines | jungle / mines | thin | à vérifier |
| Ryushi | `world-23-ryushi` | orbital / hive | badlands / habitation | vacuum | à vérifier |
| LV-742 | `world-25-lv-742` | industrial / caverns | industrial / hive | breathable | à vérifier |

Les mondes sans source trouvée (Ceto, New Galveston, New Albion, Capua VII, Korari) et Hiémale gardent leurs valeurs ou reçoivent des valeurs tirées de leur seule description, au choix du propriétaire.


---

## 23. Mondes sous licence sans événement d'œuvre utilisé

Ces mondes sont marqués `licensed-continuity` dans le catalogue, mais la recherche faite pour ce document n'a pas confirmé leur source. Leurs missions n'utilisent **aucun événement d'œuvre** et se fondent seulement sur la description du catalogue.

| Monde | ID | Description du catalogue | Mission unique | Mode | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- |
| **Ceto** | `world-10-ceto` | océan, archipels et cité minière | **La cité sur pilotis** : une cité minière d'archipel perd ses foreuses sous-marines une à une. Plonger, réparer, comprendre. | Indépendant | `restore atmospheric processing` | Colonie isolée, menace sous l'eau. |
| **Hiémale** (TR-311, remplace Freya's Prospect) | `world-11-freya-s-prospect` | colonie minière sous glace (description conservée) | **Sous la glace** : une colonie enfouie sous un glacier n'a plus de chauffage ; les galeries se referment de givre. Rétablir l'énergie avant le gel total. | Indépendant | `restore atmospheric processing` | Survie technique. |
| **New Galveston** | `world-18-new-galveston` | ville-colonie et infrastructures profondes | **Les fondations** : sous une ville-colonie, des infrastructures profondes servent de nid. Purger sans alerter une population de dizaines de milliers d'habitants. | Indépendant | `purge a reactor nest` | Infestation sous une ville. |
| **New Albion** | `world-19-new-albion` | méga-colonie et réseau de métro | **La ligne 9** : une rame de métro arrive vide à chaque station. Descendre dans le réseau. | Indépendant | `navigate the vent network` | Peur urbaine, tunnels. |
| **Capua VII** | `world-22-capua-vii` | monde agricole et marais | **Les marais** : des ouvriers agricoles disparaissent dans les marais au moment de la récolte. | Indépendant | `rescue survivors` | Hôtes dans une colonie rurale. |
| **Korari** | `world-24-korari` | forêt hostile et laboratoires abandonnés | **Le laboratoire dans les arbres** : un laboratoire abandonné de la compagnie, envahi par la forêt, émet encore. | Indépendant | `recover black-box data` | Laboratoire abandonné. |
| **Station Orphée** | `world-08-pioneer-station` | station de recherche et réseau de défense | Lieu de l'arc 3 de la campagne 4 (§17.6). Mission unique hors campagne : **Les satellites** — désactiver un satellite de quarantaine qui vise une route commerciale. | Indépendant | `destroy a neuro-link relay` | Quarantaine armée. |

---

## 24. Mondes originaux du projet — missions hors campagne

Les mondes `project-canon` servent déjà aux campagnes annexes. Chacun reçoit en plus une mission unique, rejouable une fois la campagne terminée.

| Monde | ID | Campagne | Mission unique | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| **MIRE-9** | `world-26-mire-9` | 5 | **Le quartier oublié** : un quartier du labyrinthe que la compagnie n'a jamais ouvert ; des colons y vivent depuis l'évacuation. | `rescue survivors` | Expérience inachevée. |
| **Echo Basin** | `world-27-echo-basin` | 1 | **Le dernier relais** : reconstruire une tour relais pour couvrir les canyons. | `defend the colony` | Communications, isolement. |
| **Palimpste** | `world-28-palimpste` | 5 (annexe) | **Les archives** : récupérer un dossier MIRE sur un incident historique, dans des archives instables. | `recover black-box data` | Archives de la compagnie. |
| **Pallas Rift** | `world-29-pallas-rift` | 4 | **La source** : vérifier que la cavité scellée tient toujours. | `seal the hive` | Pathogène contenu. |
| **Sable Meridian** | `world-30-sable-meridian` | 2 | **La caravane fantôme** : une caravane sans conducteur circule toujours dans le désert. | `recover a synthetic` | Synthétique resté sur une consigne. |
| **Nacre-7** | `world-31-nacre-7` | 1 | **Le récif mort** : nettoyer un récif artificiel resté infesté. | `purge a reactor nest` | Lignée récifale. |
| **Khepri Forge** | `world-32-khepri-forge` | 5 | **Les cages vides** : vérifier qu'aucun broods blindé ne s'est échappé après la campagne. | `track an apex specimen` | Lignée blindée. |
| **Cocyte** | `world-05-lethe` | Principale | Missions locales de Port-Méridien et d'Asphodèle (§6.2, §7.2). | — | — |

---

## 25. Sites frontaliers — un contrat unique par monde

Le catalogue contient 32 mondes `frontier-adaptation` (IDs 33 à 64) : chacun porte le nom d'un monde suivi d'un suffixe (Prime, Reach, Basin, Drift, Station, Colony, Depths, Frontier). **[PROPOSÉ]** Chaque suffixe désigne un **site secondaire** du même monde, avec un contrat unique. Les sites frontaliers d'un monde de la franchise suivent le mode de ce monde (§21.3).

| ID | Site | Contrat unique | Mode | Objectif |
| --- | --- | --- | --- | --- |
| `world-33-acheron-lv-426-prime` | Acheron — plateau principal | **La piste d'atterrissage** : récupérer un cargo de ravitaillement jamais déchargé, resté sur l'ancienne piste. | Héritage | `recover black-box data` |
| `world-34-lv-223-reach` | LV-223 — périphérie | **Les sondes** : récupérer des sondes de relevé tombées en lisière de jungle. | Héritage | `recover black-box data` |
| `world-35-fiorina-161-basin` | Fiorina — bassin de déchets | **Le bassin** : sceller un bassin de déchets de fonderie où quelque chose a niché. | Héritage | `seal the hive` |
| `world-36-sevastopol-drift` | Sevastopol — dérive | **Le module à la dérive** : remorquer un module de la station vers un chantier de récupération. | Héritage | `board a drifting vessel` |
| `world-37-lethe-station` | Cocyte — station de surface | **Le relais oublié** : rallumer un relais QZ isolé, hors du réseau principal. | Indépendant | `destroy a neuro-link relay` |
| `world-38-lv-895-colony` | LV-895 — colonie | **Les colons de LV-895** : évacuer une petite colonie prise entre les deux compagnies. | Héritage | `rescue survivors` |
| `world-39-katanga-depths` | Katanga — profondeurs | **Le fragment profond** : récupérer un fragment de station tombé dans la haute atmosphère. | Héritage | `board a drifting vessel` |
| `world-40-pioneer-station-frontier` | Orphée — avant-poste | **L'avant-poste** : relever la garnison d'un avant-poste de défense isolé. | Indépendant | `hold the extraction zone` |
| `world-41-purdan-prime` | Purdan — site principal | **La plate-forme** : sécuriser une plate-forme d'atterrissage abandonnée. | Héritage | `defend the colony` |
| `world-42-ceto-reach` | Ceto — archipel extérieur | **L'île du phare** : rallumer le phare d'un archipel isolé. | Indépendant | `restore atmospheric processing` |
| `world-43-freya-s-prospect-basin` | Hiémale — bassin | **Le lac gelé** : récupérer une foreuse tombée sous la glace. | Indépendant | `secure the power loader` |
| `world-44-jackson-s-star-drift` | Jackson's Star — dérive | **Le cargo des mineurs** : escorter un cargo de mineurs qui quitte le système sans autorisation. | Héritage | `escort a colony convoy` |
| `world-45-renaissance-station-station` | Renaissance — module | **Le module froid** : ouvrir un module de laboratoire resté en froid. | Héritage | `escape the quarantine` |
| `world-46-usm-auriga-colony` | Auriga — colonie du chantier | **Les familles du chantier** : sécuriser les quartiers civils du chantier militaire pendant une alerte. | Préquelle | `defend the colony` |
| `world-47-uscss-nostromo-depths` | Route de Zeta — profondeurs | **La raffinerie dérivante** : aborder une raffinerie commerciale à la dérive sur la même route. | Indépendant | `board a drifting vessel` |
| `world-48-sulaco-drift-frontier` | Épave militaire — secteur | **Les capsules** : récupérer des capsules de sauvetage dispersées. | Héritage | `recover black-box data` |
| `world-49-gateway-station-prime` | Gateway — anneau principal | **Le témoin manquant** : retrouver un témoin disparu dans les quais avant l'audience. | En activité | `rescue survivors` |
| `world-50-new-galveston-reach` | New Galveston — banlieue | **Les égouts** : purger un nid sous un quartier ouvrier. | Indépendant | `purge a reactor nest` |
| `world-51-new-albion-basin` | New Albion — bassin | **Le dépôt de rames** : sécuriser un dépôt de métro. | Indépendant | `hold the extraction zone` |
| `world-52-lv-1201-drift` | LV-1201 — canyon | **Le pont de corde** : escorter des porteurs sur un pont au-dessus d'un canyon. | Préquelle | `escort a colony convoy` |
| `world-53-bg-386-station` | BG-386 — station | **La station minière** : rétablir l'énergie d'une station minière. | [À DÉCIDER] | `restore atmospheric processing` |
| `world-54-capua-vii-colony` | Capua VII — colonie | **La moisson** : protéger la récolte et les ouvriers une nuit entière. | Indépendant | `defend the colony` |
| `world-55-ryushi-depths` | Ryushi — canyons | **Les grottes** : retrouver des éleveurs réfugiés dans des grottes. | [À DÉCIDER] | `rescue survivors` |
| `world-56-korari-frontier` | Korari — lisière | **La lisière** : établir un poste d'observation à la limite de la forêt. | Indépendant | `track an apex specimen` |
| `world-57-lv-742-prime` | LV-742 — plaine | **Le convoi de terraformation** : escorter des machines de terraformation. | [À DÉCIDER] | `escort a colony convoy` |
| `world-58-mire-9-reach` | MIRE-9 — périphérie | **Les caméras** : démonter le réseau de caméras restant. | Indépendant | `destroy a neuro-link relay` |
| `world-59-echo-basin-basin` | Echo Basin — fond du bassin | **Le lac souterrain** : explorer un lac souterrain sous les canyons. | Indépendant | `navigate the vent network` |
| `world-60-palimpste-drift` | Palimpste — archives en orbite | **Le satellite d'archives** : récupérer un satellite d'archives MIRE. | Indépendant | `board a drifting vessel` |
| `world-61-pallas-rift-station` | Pallas Rift — station orbitale | **Le quai de quarantaine** : tenir le quai de quarantaine pendant une évacuation. | Indépendant | `hold the extraction zone` |
| `world-62-sable-meridian-colony` | Sable Meridian — colonie | **Le puits** : défendre le puits d'eau d'une colonie de caravaniers. | Indépendant | `defend the colony` |
| `world-63-nacre-7-depths` | Nacre-7 — grands fonds | **La fosse** : plonger dans une fosse pour récupérer une balise. | Indépendant | `recover black-box data` |
| `world-64-khepri-forge-frontier` | Khepri — avant-poste | **Le dépôt d'armes** : saisir un dépôt d'armes abandonné. | Indépendant | `secure the power loader` |

---

## 26. Archives MIRE — chapitres détaillés — [PROPOSÉ]

### 26.1 Cadre

**Dans la fiction :** le programme MIRE de Weyland-Yutani reconstitue des incidents passés à partir de journaux, de boîtes noires et de témoignages, pour en tirer des protocoles (§18.3). Le Tantalus découvre ses consoles sur MIRE-9 (campagne 5) et peut ensuite les rejouer au laboratoire du Tantalus ou d'Asphodèle.

**Ce que le joueur gagne :** chaque archive terminée donne une **pièce de renseignement** (fil QZ17 ou dossier d'une campagne) et un **protocole** utilisable ailleurs (bonus limité, §26.9). L'archive elle-même n'a aucun autre effet : sauvegarde isolée, aucun membre d'équipage ne peut y être blessé, aucune ressource n'y est gagnée ni perdue.

**Règles propres aux archives :**

1. Le joueur incarne un **personnage original** présent sur place, jamais un personnage de l'œuvre.
2. L'archive **s'arrête avant** l'événement raconté par l'œuvre : coupure en noir, message `MODÈLE INTERROMPU · DONNÉES INSUFFISANTES`. Ce qui suit appartient à l'œuvre.
3. Le jeu affiche un **indice de fidélité du modèle** : les zones peu documentées sont visiblement reconstituées (textures moins nettes, mobilier générique), pour rappeler que c'est un modèle de la compagnie.
4. Les personnages de l'œuvre peuvent être **mentionnés** (un nom sur un planning, une voix lointaine à la radio), jamais montrés ni joués.

### 26.2 Archive 001 — USCSS Nostromo (chapitre existant)

**Statut :** **[PARTIEL]** — opération `mire-archive-001` : « rejouer les événements du Nostromo, personnages dédiés, score de synchronisation et sauvegarde isolée » ; dettes déclarées `complete-nostromo-cast` et `complete-historical-campaign`.

**Conflit à signaler :** ce chapitre, tel que promis par le registre, rejoue les événements de l'œuvre avec ses personnages. Cela contredit les règles 1 et 2 ci-dessus.

**[À DÉCIDER]** Deux options :

| Option | Contenu |
| --- | --- |
| **A — Exception assumée** | Garder le chapitre tel quel comme seule archive « historique » ; le présenter comme un modèle imparfait de la compagnie (score de synchronisation = écart au journal de bord). |
| **B — Archive parallèle** | Le joueur incarne un technicien original de la raffinerie remorquée, pendant le trajet de retour, avant l'escale qui déclenche les événements. Missions : maintenance de la raffinerie, inspection des cuves, panne de liaison, fin à la réception du signal. Le score de synchronisation devient « fidélité du modèle ». |

**Validé (2026-11-05) : les deux.** Mire Archive 001 reste une **archive fidèle** (option A, elle reconstitue les événements connus). L'option B devient une **archive originale** distincte, `mire-nostromo-b` (4 missions). Les autres archives suivent le même principe (§26.10).

### 26.3 Archive 002 — Sevastopol, « Le dernier quart »

| Élément | Contenu |
| --- | --- |
| **Lieu et moment** | Station commerciale Seegson en orbite de KG-348, quelques semaines avant l'incident de 2137. |
| **Rôle joué** | **Yara Okonedo**, technicienne de maintenance Seegson, quartier des transits. |
| **Durée** | ≈ 1 h 40, 4 missions. |
| **Fin** | Le réseau de la station bascule en mode de sécurité ; coupure du modèle. |
| **Mécanique propre** | Rondes de maintenance chronométrées ; synthétiques de service Seegson qui obéissent à des procédures rigides ; aucune arme létale au départ. |
| **Gain** | Pièce : schéma de mise à jour des synthétiques Seegson (aide la campagne 2) · protocole « procédure Seegson » (les synthétiques Seegson ennemis réagissent plus lentement). |

| # | Titre | Déroulé | Objectif | Durée |
| --- | --- | --- | --- | --- |
| M2-1 | **La ronde** | Faire la ronde du quartier des transits : relever trois compteurs, réparer un ascenseur, répondre à un habitant inquiet. Tutoriel du rôle, sans danger. | `restore atmospheric processing` | 20 min |
| M2-2 | **Les rations** | Le quartier vit de rationnement depuis que la station décline. Escorter une livraison de vivres sans provoquer d'émeute ; un synthétique de service applique la règle à la lettre. | `escort a colony convoy` | 25 min |
| M2-3 | **Les disparus du niveau bas** | Deux techniciens ne répondent plus. Descendre dans les niveaux techniques ; ne trouver que des signes (conduits ouverts, outils abandonnés). | `navigate the vent network` | 30 min |
| M2-4 | **Mode de sécurité** | Le réseau verrouille les portes et les synthétiques passent en procédure d'urgence. Ramener trois habitants au refuge du quartier avant le verrouillage complet. Coupure. | `escape the quarantine` | 25 min |

### 26.4 Archive 003 — Renaissance Station, « Avant les anneaux »

| Élément | Contenu |
| --- | --- |
| **Lieu et moment** | Station de recherche Renaissance, en orbite de la planète de Jackson's Star, avant l'incident de 2142. |
| **Rôle joué** | **Ilan Varga**, technicien de laboratoire de nuit. |
| **Durée** | ≈ 1 h 30, 4 missions. |
| **Fin** | Alerte de dérive orbitale ; coupure du modèle. |
| **Mécanique propre** | Chambres froides, gravité artificielle instable dans certains modules, inventaire scientifique. |
| **Gain** | Pièce : registre de transfert d'échantillons de la station (fil QZ17, origine des méthodes de transport réfrigéré) · protocole « chaîne du froid » (bonus de capture d'organismes vivants). |

| # | Titre | Déroulé | Objectif | Durée |
| --- | --- | --- | --- | --- |
| M3-1 | **Le quart de nuit** | Prendre la relève, vérifier les chambres froides et les cultures. Les instruments relèvent de petites variations de température. | `recover black-box data` | 20 min |
| M3-2 | **La gravité** | Un module perd sa gravité artificielle. Remettre en route les stabilisateurs en traversant un module où les objets flottent. | `restore atmospheric processing` | 25 min |
| M3-3 | **L'échantillon 14** | Une cuve de l'inventaire est vide sans trace de transfert. Remonter les journaux et les caméras du laboratoire. | `recover black-box data` | 25 min |
| M3-4 | **Verrouillage** | La station verrouille le laboratoire ; l'alerte d'orbite s'allume. Mettre les données à l'abri dans une capsule de stockage avant la coupure. | `escape the quarantine` | 20 min |

### 26.5 Archive 004 — Acheron / LV-426, « Avant le silence »

| Élément | Contenu |
| --- | --- |
| **Lieu et moment** | Colonie Hadley's Hope, quelques semaines avant la perte de contact de 2179. |
| **Rôle joué** | **Ruben Akintola**, technicien du processeur atmosphérique. |
| **Durée** | ≈ 2 h, 5 missions. |
| **Fin** | La colonie n'arrive plus à joindre l'extérieur ; coupure du modèle. |
| **Mécanique propre** | Vie de colonie (horaires, rations, familles), maintenance du processeur atmosphérique, vent permanent. Aucune créature visible avant M4-4. |
| **Gain** | Pièce : relevés de maintenance du processeur et ordres de la compagnie reçus par la colonie (fil QZ17 : méthode de la compagnie face aux colonies) · protocole « routine coloniale » (bonus de moral lors des évacuations). |

| # | Titre | Déroulé | Objectif | Durée |
| --- | --- | --- | --- | --- |
| M4-1 | **Le vent** | Une journée de travail : traverser la colonie dans la tempête, réparer une conduite du processeur, retour au mess. Tutoriel. | `restore atmospheric processing` | 20 min |
| M4-2 | **Les familles** | Livrer des pièces à l'école et à l'infirmerie ; rencontrer les colons (personnages originaux). | `escort a colony convoy` | 20 min |
| M4-3 | **L'infirmerie** | Un patient est amené dans un état que le médecin ne comprend pas. Récupérer du matériel médical dans un entrepôt du quartier technique. | `rescue survivors` | 25 min |
| M4-4 | **Les conduits du niveau C** | Des ouvriers ne reviennent pas du niveau C. Y descendre avec une lampe et un détecteur de mouvement. Premier contact. | `navigate the vent network` | 30 min |
| M4-5 | **Plus de réponse** | Les liaisons tombent une par une. Barricader le bloc d'habitation et rassembler les colons. Coupure quand la dernière liaison s'éteint. | `defend the colony` | 25 min |

### 26.6 Archive 005 — Fiorina 161, « La fonderie »

| Élément | Contenu |
| --- | --- |
| **Lieu et moment** | Installation pénitentiaire et fonderie de Fiorina 161, avant l'incident de 2179. |
| **Rôle joué** | **Silas Brennan**, détenu affecté à la fonderie (personnage original). |
| **Durée** | ≈ 1 h 30, 4 missions. |
| **Fin** | Alerte d'arrivée d'un objet non identifié ; coupure du modèle. |
| **Mécanique propre** | Aucune arme ; outils de fonderie ; lumière rare ; la discipline de l'installation. |
| **Gain** | Pièce : inventaire des archives médicales de l'installation (lien `legacy-fury-2` et `prequel-fury-auriga`) · protocole « fonderie » (bonus contre les ennemis en zone chaude). |

| # | Titre | Déroulé | Objectif | Durée |
| --- | --- | --- | --- | --- |
| M5-1 | **Le plomb** | Travail à la fonderie : charger un creuset, faire couler, nettoyer. | `secure the power loader` | 20 min |
| M5-2 | **Les rats** | Chasser la vermine des réserves avec les autres détenus, à la torche, dans les galeries. | `purge a reactor nest` | 25 min |
| M5-3 | **Le courrier** | Le service médical attend une livraison qui n'arrive pas. Aller la chercher dans un hangar à moitié abandonné. | `recover black-box data` | 25 min |
| M5-4 | **La tempête** | Une tempête coupe l'énergie. Remettre en route les générateurs avant la nuit. Coupure à l'alerte d'arrivée. | `restore atmospheric processing` | 20 min |

### 26.7 Archive 006 — Katanga, « Poste de nuit »

| Élément | Contenu |
| --- | --- |
| **Lieu et moment** | Station de raffinage Katanga, en orbite de LV-895, avant l'incident de 2202. |
| **Rôle joué** | **Nadia Ferreira**, opératrice de raffinage. |
| **Durée** | ≈ 1 h 30, 4 missions. |
| **Fin** | Perte de contact avec les quais de réception ; coupure du modèle. |
| **Mécanique propre** | Chaîne de raffinage (vannes, pression, cuves), quais de réception des cargaisons de surface. |
| **Gain** | Pièce : manifestes de cargaison de surface de LV-895 (lien `legacy-lv895-2`, campagne 4) · protocole « raffinerie » (résistance accrue à la chaleur et à la pression). |

| # | Titre | Déroulé | Objectif | Durée |
| --- | --- | --- | --- | --- |
| M6-1 | **La chaîne** | Réguler la pression d'une ligne de raffinage. Tutoriel des vannes. | `restore atmospheric processing` | 20 min |
| M6-2 | **Le cargo de surface** | Réceptionner une cargaison venue de la surface ; ses scellés ne correspondent pas au manifeste. | `recover black-box data` | 25 min |
| M6-3 | **La soute 4** | La soute de réception ne répond plus. Y aller avec un chargeur. | `secure the power loader` | 25 min |
| M6-4 | **Plus de quais** | Les quais de réception tombent ; évacuer les opérateurs vers le module central. Coupure. | `escape the quarantine` | 20 min |

### 26.8 Archives et chronologie

| Archive | Œuvre de référence | Année de l'œuvre | L'archive s'arrête… |
| --- | --- | --- | --- |
| 001 Nostromo | *Alien* | 2122 | selon l'option retenue (§26.2) |
| 002 Sevastopol | *Alien: Isolation* | 2137 | au passage en mode de sécurité |
| 003 Renaissance | *Alien: Romulus* | 2142 | à l'alerte de dérive orbitale |
| 004 Acheron | *Aliens* | 2179 | à la perte de la dernière liaison |
| 005 Fiorina 161 | *Alien 3* | 2179 | à l'alerte d'arrivée |
| 006 Katanga | *Aliens: Fireteam Elite* | 2202 | à la perte des quais de réception |

### 26.9 Protocoles MIRE

Un protocole s'équipe au briefing, un seul à la fois, et n'est jamais obligatoire.

| Protocole | Effet proposé | Source |
| --- | --- | --- |
| Procédure Seegson | Synthétiques Seegson ennemis : temps de réaction +20 % | Archive 002 |
| Chaîne du froid | Capture d'organisme vivant : délai +15 s | Archive 003 |
| Routine coloniale | Moral des civils escortés : perte réduite | Archive 004 |
| Fonderie | Dégâts reçus en zone chaude réduits | Archive 005 |
| Raffinerie | Résistance à la chaleur et à la pression | Archive 006 |

Les valeurs sont des propositions de conception, à équilibrer en test.

### 26.10 Archives fidèles et archives originales — validé le 2026-11-05

Le propriétaire veut **les deux** : des archives **fidèles à 100 % aux événements connus**, et des archives **originales** (préquelles ou suites).

| Type | Contenu | Personnages | Fin |
| --- | --- | --- | --- |
| **Archive fidèle** | Reconstitution des événements connus d'une œuvre, dans leur ordre | Ceux de l'œuvre | Celle de l'œuvre |
| **Archive originale** | Préquelle ou suite, à côté des événements | Originaux | S'arrête avant l'événement de l'œuvre, ou se situe après |

**Archives fidèles proposées :**

| ID | Œuvre | Année | Lieu | Remarque |
| --- | --- | --- | --- | --- |
| `mire-fidele-nostromo` | *Alien* | 2122 | USCSS Nostromo | Chapitre existant **Mire Archive 001** [PARTIEL] ; dettes `complete-nostromo-cast`, `complete-historical-campaign` |
| `mire-fidele-lv223` | *Prometheus* | 2093 | LV-223 | — |
| `mire-fidele-sevastopol` | *Alien: Isolation* | 2137 | Sevastopol | — |
| `mire-fidele-renaissance` | *Alien: Romulus* | 2142 | Renaissance Station | Pièces de costumes d'Andy et Navarro préparées hors dépôt (`docs/development/SPRITE_PACK_V170.md`) |
| `mire-fidele-acheron` | *Aliens* | 2179 | Acheron / LV-426 | — |
| `mire-fidele-fiorina` | *Alien 3* | 2179 | Fiorina 161 | Costume Ripley *Alien 3* préparé hors dépôt (`docs/development/SPRITE_PACK_V170.md`) |
| `mire-fidele-katanga` | *Aliens: Fireteam Elite* | 2202 | Katanga, LV-895 | — |
| `mire-fidele-auriga` | *Alien Resurrection* | 2381 | USM Auriga | **Hors chronologie** (MIRE ne peut pas modéliser 2381 en 2204) : contenu bonus, signalé comme tel. Costume Ripley 8 préparé hors dépôt |

**Archives originales :** les cinq archives des §26.3 à §26.7, plus `mire-nostromo-b` (ancienne option B du §26.2 : technicien de la raffinerie remorquée, 4 missions).

**Conséquences pour la production :**

- Chaque archive fidèle demande les **personnages de l'œuvre** (planches, portraits), ses **lieux** reconstitués et son **découpage** en chapitres, à établir œuvre par œuvre. La Partie IV ne les comptait pas : ils s'ajoutent au §44.1.
- Le dépôt indique être « préparé pour un titulaire de licence de la franchise » (`LICENSE_NOTICE.md`). Reproduire fidèlement des œuvres relève de cette licence et du propriétaire ; cette bible ne le vérifie pas.
- Les règles 1 et 2 du §21.2 ne s'appliquent pas aux archives fidèles.


---

## 27. Intégration de la Partie III — [PROPOSÉ]

### 27.1 Déblocage

| Contenu | Condition |
| --- | --- |
| Chaînes Héritage (§22) | Fin de la campagne principale ; chaque chaîne se débloque à la première visite du monde sur la carte galactique. |
| Archives MIRE (§26) | Après l'arc 1 de la campagne 5 (découverte du programme MIRE). |
| Préquelles (§22.3, §22.7, §22.12) | Fin de la campagne principale ; `prequel-fury-auriga` après `legacy-fury-2`. |
| Gateway (§22.9) | Fin de la campagne 5 avec la fin « Le dossier ». |
| Missions §23-§25 | Visite du monde sur la carte galactique. |

### 27.2 Persistance

- Les archives MIRE utilisent une **sauvegarde isolée**, comme Mire Archive 001 : aucun effet sur l'équipage, les ressources ou la campagne.
- Les autres missions suivent le raccordement du §11 (récompenses versées dans la transaction de résolution, tests de parcours et de reprise).

### 27.3 Synthèse

| Section | Mondes | Missions |
| --- | --- | --- |
| §22 Opérations Héritage, préquelles et Gateway | 17 mondes en 15 chaînes | 33 (hors renvois aux archives) |
| §26 Archives MIRE | 6 lieux | 25 (dont Nostromo selon l'option du §26.2 : 4 missions en option B) |
| §23 Mondes sous licence sans événement utilisé | 7 | 7 |
| §24 Mondes originaux du projet | 8 | 7 (Cocyte renvoie aux §6-§7) |
| §25 Sites frontaliers | 32 | 32 |
| **Total** | **64 mondes du catalogue** | **104 missions** (79 sur les mondes, 25 en archives MIRE) |

### 27.4 Points ouverts de la Partie III

| # | Question | Section |
| --- | --- | --- |
| 10 | Mode des mondes sans année confirmée : BG-386, Ryushi, LV-742. | §21.3 — **Validé : héritage** |
| 11 | Freya's Prospect : monde distinct ou colonie de BG-386 ? | §21.3 — **Validé : fusion avec BG-386, nouveau monde glacé Hiémale** |
| 12 | Corriger les biomes et atmosphères générés des mondes de la franchise ? | §21.3 — **Validé : correction (§22.17)** |
| 13 | Présence active des Yautja dans les missions AVP, ou traces seulement ? | §21.2 — **Validé : traces, apparitions brèves, mission dédiée** |
| 14 | État de Jackson's Star et de Purdan en 2204. | §22.6, §22.11 — **Validé : habités, en déclin** |
| 15 | Épave de la §22.8 : le Sulaco lui-même ou un vaisseau de même classe ? | §22.8 — **Validé : vaisseau de même classe** |
| 16 | Auriga : chantier en préquelle plutôt que lieu jouable en 2204 ? | §22.7 — **Validé : préquelle et archive fidèle hors chronologie** |
| 17 | Mire Archive 001 : exception assumée (A) ou archive parallèle (B) ? | §26.2 — **Validé : les deux types** |


---

# PARTIE IV — Besoins de production

## 28. Méthode

### 28.1 Statuts

| Statut | Signification |
| --- | --- |
| **[PRÉSENT]** | Un fichier portant ce nom existe dans `assets/` (chemin indiqué). **Sa présence ne prouve ni son intégration au runtime, ni sa validation** (pivots, pieds, échelle, animation). |
| **[DETTE]** | L'art manquant est déjà déclaré dans le code (limites de `special-operations-v131.js`, `HIVE_ART_DEBT_V131`). |
| **[CODE]** | La mécanique existe dans le code (module cité) ; seul l'habillage peut manquer. |
| **[À CRÉER]** | Rien de correspondant n'a été trouvé dans `assets/` ni dans le code. |

Les fichiers de `assets/user/` sont des **références** fournies par le propriétaire, pas des assets de jeu : ils ne comptent pas comme [PRÉSENT].

### 28.2 Catégories

| Catégorie | Contenu | Format attendu dans ce moteur |
| --- | --- | --- |
| **Décors** | Fonds de zone en trois couches (lointain, intermédiaire, premier plan) | Comme `assets/openai/metroidvania/zones/*-far/-mid/-foreground.png` |
| **Props** | Objets posés, interactifs ou non (caisses, consoles, portes, machines) | PNG RGBA, atlas possibles |
| **Personnages** | PNJ et rôles joués : planche de déplacement et planche de mission | Comme `assets/openai/sprites/npcs/*-locomotion-sheet.png` et `*-mission-sheet.png` |
| **Ennemis** | Planche d'actions (déplacement, attaque, dégâts, mort) | Comme `assets/openai/sprites/enemies/*-action-sheet*.png` |
| **Véhicules** | Sprite natif et états | Comme `assets/openai/equipment/v121-vehicles/*-native-v121.png` |
| **Animations** | Poses nouvelles pour le joueur, les PNJ ou les ennemis | Planches ou pièces de rig (`rig-v165`) |
| **VFX** | Effets visuels (feu, acide, vapeur, étincelles, eau) | Cycles comme `assets/openai/metroidvania/hazards/*-cycle.png` |
| **Actions** | Verbes de jeu à implémenter ou à étendre | Code + invites d'interaction |
| **Cinématiques** | Plans fixes, panoramiques, cadres de dialogue | Images de plan + portraits (`npc-dialogue-portraits-v168.js`) |

### 28.3 Socle déjà présent (réutilisé partout)

**Équipage du Tantalus — [PRÉSENT]** : planches de déplacement et de mission pour les 16 membres (`assets/openai/sprites/npcs/` : `mara-vega`, `tamsin-velez`, `echo-a`, `david-8r`, `asha-mbaye`, `leila-s-rensen`, `noor-okafor`, `bishop-9`, `inez-harlow`, `sanaa-doyle`, `pablo-reyes`, `cal-mercer`, `maksim-orlov`, `idris-kwan`, `jun-park`, `rook`).

**Ennemis — [PRÉSENT]** (`assets/openai/sprites/enemies/`) : drone (`xenomorph-drone-combat-sheet`, `xenomorph-drone-locomotion-sheet`), guerrier (`xenomorph-warrior-*`), runner, lurker, praetorian, spitter, crusher, boiler, burster, carrier, ravager, prowler, reine (`xenomorph-queen-action-sheet-v56`, `xenomorph-queen-combat-sheet`), facehugger (`facehugger-locomotion-sheet`), chestburster, cycle de l'œuf (`ovomorph-cycle-sheet`), néomorphe (`neomorph-locomotion-sheet`), protomorph, `deacon-line`, `pathogen-mimic`, `abomination-pathogen-brute`, synthétique Seegson (`working-joe-combat-sheet`, `seegson-security`), commando W-Y (`weyland-yutani-commando`), UPP (`upp-vanguard`), cultiste (`cult-host`), ATARAX (`atarax-controller`, `atarax-ripper`), `ripper-queen`, `siege-royal`, récifaux (`ceto-reef-predator`, `reef-spitter`, `reef-stalker`), fonderie (`foundry-crusher`, `foundry-drone`), `korari-stalker`, `caravan-stalker`, `dust-runner`, `tantalus-tunnel-vermin`, `wild-boar-host`, `trilobite-echo`, `pale-crucible-hunter`, `salvage-hive-brute`, `colonial-raider`, `neuro-xeno-drone`.

**Véhicules — [PRÉSENT]** (`assets/openai/equipment/v121-vehicles/` et voisins) : `echo-9-recon-bike`, `ceto-patrol-boat`, `reef-hydrofoil`, `crucible-caravan-crawler`, `combat-power-loader`, `ripper-siege-loader`, `uscm-assault-gunship`, `orbital-lifeboat`, `atmospheric-processor-elevator`, `weyland-yutani-executive-shuttle`, `hyperdyne-synthetic-carrier`, `mining-bore-crawler`, `seegson-maintenance-tram`, `maglev-personnel-car`, `ice-driller`, `colony-cargo-lifter`, `neuro-xeno-transport-rig`, `tantalus-command-skiff`, `ua-571-remote-sentry-carrier`, `upp-combat-aerodyne` ; `p5000-work-loader-native-v120`. Planches d'action dans `assets/openai/sprites/vehicles/` : **M577** (`m577-apc-action-sheet`, `m577-command-apc-action-sheet`, planches d'accès et de dégâts), **Cheyenne** (`ud-4l-cheyenne-dropship-action-sheet`, `ud-4b-cheyenne-dropship-action-sheet`, accès et dégâts), `narcissus-lifeboat`, `eva-7c-pressure-pod`, `lander-one-class-e`, `m22a3-jackson-tank`, `m40-ridgeway-heavy-tank`, `nr-9-euv01-atv`, `rt01-group-transport`, `daihotai-tractor`, `p-5000-powered-work-loader`.

**Outils et équipements — [PRÉSENT]** (`assets/openai/sprites/normalized/tools/`, planches d'utilisation ; leur mécanique en jeu reste **à vérifier**, ils ne sont référencés que dans un à sept fichiers du code) : `pathogen-scanner`, `hazmat-suit`, `rebreather`, `pressure-suit`, `apesuit-mk3`, `catch-pole` (capture), `electroshock-trap`, `cryo-mine`, `seismic-surveyor`, `security-access-tuner` (accès aux systèmes), `signal-jammer`, `synthetic-repair-kit`, `neuro-link-helmet`, `atarax-control-rig`, `ripper-xenoarmor`, `portable-quarantine`, `portable-sentry`, `portable-battery`, `colony-beacon`, `drone-controller`, `welding-kit`, `flashlight`, `m314-motion-tracker`, `medkit`, `trauma-kit`, `m3-personnel-armor`, `incinerator-fuel-pack`, `ammo-satchel`, `maintenance-jack`.

**Joueur — [PRÉSENT]** (`assets/openai/sprites/player/`) : planches de combat, interaction, déplacement, corps à corps et outils d'Echo-9 ; pièces de costumes (`costume-parts-v165`, `costumes-v119`, `costumes-v165`, `colonial-v129`).

**Audio — [PRÉSENT]** (`assets/audio/`) : seulement 3 musiques (`hub`, `menu`, `mission`) et 5 bruitages (`alarm`, `hit`, `shot`, `tracker`, `ui`).

**Armes utiles aux scénarios — [PRÉSENT]** : `m41a-pulse-rifle`, `m56-smartgun`, `m240-incinerator`, `ua-571c-sentry`, `cutting-torch`, `harpoon-gun`, `sonic-harpoon`, `reef-caster`, `cryo-lance`, `pathogen-containment-projector`, `neuro-link-disruptor`, `stun-baton`, `maintenance-jack`, `fire-axe`.

**Props de mission — [PRÉSENT]** (`assets/openai/metroidvania/props/`) : `acid-floor-hazard`, `breakable-panel`, `cargo-cover`, `ceiling-cables`, `drop-platform`, `electrical-arc-hazard`, `floor-segment`, `foreground-pipes`, `locked-bulkhead`, `open-bulkhead`, `maintenance-pipe`, `overhead-catwalk`, `short-ledge`, `supply-crates`, `vent-entrance`, `wall-ladder`, `warning-lamp`, `mission-door-states-v58`, `tantalus-traversal-kit-atlas`.

**Terminaux — [PRÉSENT]** : `colony-medical-archive-terminal-sheet`, `planet-field-archive-beacon-sheet`, `ship-command-archive-terminal-sheet`.

**Objets ramassables — [PRÉSENT]** (`drops/`) : munitions, armure, médikit, récupération, clé de sécurité.

**Dangers et VFX — [PRÉSENT]** (`hazards/`) : obscurité, feu, eau (vaguelettes, ligne d'eau), radiation, jet de vapeur, brèche de vide, givre ; planche `combat-vfx-animation-sheet.png`.

**Décors de zone — [PRÉSENT]** (`zones/`) : soute, commandement, quais, ingénierie, extraction, habitat (vaisseau), colonie multi-routes, extérieur planétaire ; fonds de mission du Tantalus.

**Mécaniques — [CODE]** : nage (`swim`), soudure de portes (`weld`), transport d'objets (`carry`), conduits (`vent`), échelles et escalade, grappin (`grapple`), chargeur (`loader`), pilotage, cryostase, détecteur de mouvement (`motion-tracker-v160.js`), corps à corps, lancer de grenade, réanimation (`revive`), soudure, acide persistant, routage d'énergie, caméras (systèmes de survie).

**Mécaniques absentes du code — [À CRÉER]** : apesanteur ou gravité faible, piratage de terminal (aucune occurrence `hack` ; la planche `security-access-tuner` existe), jauge de contamination (la planche `pathogen-scanner` existe), test biologique de survivant, capture d'organisme (la planche `catch-pole` existe), infiltration phéromonale hors chapitre Jeri, dialogue à choix d'audience (Gateway).

---

## 29. Campagne principale — besoins par mission

### 29.1 Prologue

| Mission | Décors | Props | Personnages / ennemis | Animations | VFX | Actions | Cinématique |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CIN-00 Ouverture | Relais QZ-18 sous la pluie **[À CRÉER]** ; orbite avec Asphodèle **[À CRÉER]** ; Tantalus en orbite **[À CRÉER]** | Pupitre de relais, badge **[À CRÉER]** | Main hors champ **[À CRÉER]** | Écran qui passe en `EN ATTENTE` **[À CRÉER]** | Pluie **[À CRÉER]** ; voyant rouge | — | 8 plans **[À CRÉER]** |
| P-1 Réveil | Baie cryo **[PRÉSENT]** (hub) | Casier `ECHO-8` scellé **[À CRÉER]** | DAVID-8R **[PRÉSENT]** | Sortie de caisson **[CODE]** (onboarding) | Givre de caisson **[À CRÉER]** | Interagir avec le casier **[À CRÉER]** | CIN-01 (1 plan) **[À CRÉER]** |
| P-2 Pas de tir | Pas de tir **[PRÉSENT]** (`hub/proving-ground`) | — | Velez **[PRÉSENT]** | — | Écran de liaison qui reçoit un paquet de messages **[À CRÉER]** | — | — |
| CIN-02 Briefing | Salle de briefing **[PRÉSENT]** (hub) | Carte holographique de Cocyte et d'Asphodèle **[À CRÉER]** | Vega, Harlow, Velez **[PRÉSENT]** | Geste de pointage sur la carte **[À CRÉER]** | — | — | 4 plans, portraits **[PRÉSENT]** |
| P-3 Quai des vivants | Port-Méridien **[CODE]** (`port-meridien-v90.js`) | Lot médical, batterie de sas | Tomas Wren, Lucia Ferro **[À CRÉER]** ; blessé à poitrine bandée **[À CRÉER]** | Blessé allongé, respiration **[À CRÉER]** | — | Choix lot/batterie **[CODE]** | — |

### 29.2 Actes de l'enquête

| Mission | Décors | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| Acte I · QZ-17 | Intérieur vertical **[CODE]** ; quais sous la pluie **[À CRÉER]** | Conteneur réfrigéré « échantillons géologiques » givré **[À CRÉER]** ; berceau ouvert de l'intérieur, fixations **[À CRÉER]** ; PDA, chariot FL-09 **[CODE]** (collectables V68) | Facehugger **[PRÉSENT]** ; drone **[PRÉSENT]** | Facehugger sautant d'un berceau **[À CRÉER]** | Givre qui fond, marque d'acide sur paroi **[À CRÉER]** ; `acid-floor-hazard` **[PRÉSENT]** | Choix de piste **[CODE]** |
| CIN-10, CIN-11 | Dropship en approche **[À CRÉER]** | — | Orlov, Rook **[PRÉSENT]** | — | Pluie | — |
| Acte II · QZ-18 | Relais QZ-18 **[CODE]** | Six pièces, poste d'analyse **[CODE]** | Inez, Rook, MU/TH/UR **[PRÉSENT]** | — | — | Lecture, comparaison **[CODE]** |
| CIN-20 Treize minutes | Salle des quartiers du Tantalus **[PRÉSENT]** | Liste de noms à l'écran **[À CRÉER]** | Asha **[PRÉSENT]** | Lecture à voix haute (pose assise) **[À CRÉER]** | — | — |
| Acte III · M577 et C-12 | Corridor, C-12 **[CODE]** | Écran de manifeste fret/passagers **[À CRÉER]** ; conteneurs scellés à bord **[À CRÉER]** | Hordes, Crushers, Reine **[CODE]** (`apc-convoy-state-v121.js`) ; ouvriers de C-12 **[À CRÉER]** | Conteneur qui tressaute **[À CRÉER]** | — | Curseur fret/passagers **[À CRÉER]** |
| CIN-31 | Hangar du Tantalus **[PRÉSENT]** | Écran `CONTRÔLE BIOLOGIQUE · 1 ANOMALIE` **[À CRÉER]** | Colons descendant de la rampe **[À CRÉER]** | Marche en file **[À CRÉER]** | — | — |
| Interlude · Quarantaine | Ponts 2-3 du Tantalus **[PRÉSENT]** ; conduits **[PRÉSENT]** (`hub/vents`) | Conteneur ouvert en quarantaine **[À CRÉER]** | Créature à bord : drone ou chestburster **[PRÉSENT]** ; Jun Park blessé **[À CRÉER]** (pose) | Jun coincé dans un conduit **[À CRÉER]** | Alarme rouge de pont **[À CRÉER]** | Soudure, routage, caméras **[CODE]** ; capture d'organisme **[À CRÉER]** |
| CIN-40, CIN-41 | Support-vie, labo **[PRÉSENT]** | Journal de quarantaine à l'écran **[À CRÉER]** | BISHOP-9, Inez **[PRÉSENT]** | — | — | — |
| Acte IV · Cocon noir | Galeries colonisées **[CODE]** | Berceaux QZ17 vides **[À CRÉER]** ; cocons humains avec badges **[DETTE]** (`dedicated-cocoon-bitmap-corpus`) ; enregistreur d'Asphodèle **[À CRÉER]** | Drones, guerriers **[PRÉSENT]** | Caméra casque dégradée (CIN-50) **[À CRÉER]** | Bruit vidéo, coupure **[À CRÉER]** | Couper la résine **[CODE]** |
| CIN-51 Contrôle | Baie médicale **[PRÉSENT]** | Scanner corporel **[À CRÉER]** | Noor **[PRÉSENT]** | Passage dans le scanner **[À CRÉER]** | Balayage lumineux **[À CRÉER]** | — |
| Acte V · Non viable | Complexe, route, pont, murs du port **[À CRÉER]** | Pont qui cède, remorques fret/colons **[À CRÉER]** | Commandos W-Y **[PRÉSENT]** ; Reine du dépôt (poursuite) **[À CRÉER]** | Reine qui court derrière l'APC **[À CRÉER]** | Effondrement du pont, poussière **[À CRÉER]** | Course APC **[CODE]** (base) ; largage de remorque **[À CRÉER]** ; face-à-face sans tir **[À CRÉER]** |
| CIN-60, CIN-61 | Sortie du complexe sous la pluie **[À CRÉER]** ; portes du port **[À CRÉER]** | Compteur de colons **[À CRÉER]** | Rook **[PRÉSENT]** ; foule de colons **[À CRÉER]** | — | Pluie | — |
| Épilogue | Tantalus, Port-Méridien, Asphodèle | Étiquette du casier `RETOUR CONFIRMÉ` / `POSTE LIBÉRÉ` **[À CRÉER]** | Tous **[PRÉSENT]** | — | — | Visite libre **[CODE]** |

### 29.3 Front colonie — Port-Méridien

**Socle de l'arc [À CRÉER] :** décor de colonie portuaire en trois couches (quais, salle commune, infirmerie, processeur atmosphérique, mur nord, entrepôt) ; PNJ Adèle Sarrazin, Tomas Wren, Lucia Ferro, colons génériques (4 silhouettes au moins) ; table de reconstruction (prop + interface).

| Mission | Props spécifiques | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| La doyenne | Registre de dettes à l'écran **[À CRÉER]** | Adèle **[À CRÉER]** | Marche guidée **[CODE]** | — | Dialogue guidé **[CODE]** |
| C1 Tenir le port | Conteneur QZ17-04 ouvert **[À CRÉER]** ; lits d'infirmerie **[À CRÉER]** | Drones, runners **[PRÉSENT]** ; blessés à évacuer **[À CRÉER]** | Brancardage (deux porteurs) **[À CRÉER]** | Étincelles de soudure **[À CRÉER]** | Soudure **[CODE]** ; transport de blessé **[CODE]** (`carry`) |
| C2 L'air du port | Machinerie du processeur (turbines, conduites) **[À CRÉER]** ; `atmospheric-processor-elevator` **[PRÉSENT]** | Drones, nid **[PRÉSENT]** ; Jun Park **[PRÉSENT]** | — | Air chaud, vapeur **[PRÉSENT]** (`steam-jet-cycle`) | Relance du processeur **[À CRÉER]** |
| C3 Convoi des rescapés | Poste de contrôle biologique **[À CRÉER]** | Ouvriers arrivants **[À CRÉER]** ; chestburster **[PRÉSENT]** | Porteur qui se tient la poitrine **[À CRÉER]** | — | Test biologique **[À CRÉER]** ; repérage discret **[À CRÉER]** |
| C4 Culte du port | Autel improvisé, symboles **[À CRÉER]** | Cultiste **[PRÉSENT]** (`cult-host`, visuel à refaire, §1.5) | Ouverture furtive de sas **[À CRÉER]** | — | Enquête **[CODE]** (méthode V122) ; choix de sanction **[À CRÉER]** |
| C5 Nuit des murs | Murs, tourelles par niveau de chantier **[À CRÉER]** ; `ua-571c-sentry` **[PRÉSENT]** | Vagues mixtes **[PRÉSENT]** | — | Projecteurs, fusées éclairantes **[À CRÉER]** | Défense par vagues **[CODE]** ; aube (transition) **[À CRÉER]** |
| Annexes (7) | Carnets de quai, dossiers médicaux, abri pressurisé, entrepôt Seegson, balise de colonie, navire de Grue, galerie **[À CRÉER]** | Synthétique Seegson bloqué **[PRÉSENT]** (`working-joe-combat-sheet`) ; Grue **[À CRÉER]** ; jeune converti **[À CRÉER]** | Enfants qui suivent (escorte) **[À CRÉER]** | — | Escorte civile **[CODE]** |
| Reconstruction | 7 chantiers × 3 niveaux = 21 états visuels **[À CRÉER]** | — | Ouvriers au travail (boucle) **[À CRÉER]** | Soudure, poussière de chantier **[À CRÉER]** | Interface de chantiers **[À CRÉER]** |

### 29.4 Front station — Asphodèle

**Socle de l'arc [À CRÉER] :** décor de station orbitale en trois couches (anneau extérieur, pont de contrôle, laboratoire de transit, ponts inférieurs, serre, salle des relais, mémorial) ; PNJ Grue, récupérateurs Crucible ; interface vocale de CASSIUS ; dropship d'Echo-8 amarré.

**Mise à jour art de scène (16 novembre 2026, §7.8).** Les cartes d'extérieur, de CASSIUS et de l'enregistrement d'Echo-8 sont produites, ainsi que les trois autres cartes de preuve du lot. Elles servent les dialogues ; les besoins du tableau ci-dessous en décors jouables, props de hub, acteurs, animations et plans de CIN-70 à CIN-72 restent distincts. Le statut d'une illustration ne vaut pas achèvement d'une mission.

| Mission | Props spécifiques | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| Six heures de silence | Enregistrement casque à l'écran **[À CRÉER]** | Rook **[PRÉSENT]** | — | Bruit radio **[À CRÉER]** | — |
| S1 L'arrimage | Barricades de l'équipage, dropship d'Echo-8 **[À CRÉER]** | Récupérateurs **[À CRÉER]** (base possible : `colonial-raider` **[PRÉSENT]**) | — | Ventilateurs qui trompent le détecteur **[À CRÉER]** | Négociation ou combat **[À CRÉER]** |
| S2 La voix de CASSIUS | Noyau de CASSIUS, consoles Seegson **[À CRÉER]** | CASSIUS (voix + interface) **[À CRÉER]** | — | Écrans qui s'allument par secteur **[À CRÉER]** | Choix réécrire/brider/effacer **[À CRÉER]** |
| S3 Les ponts scellés | Berceaux QZ17, œufs **[PRÉSENT]** (`ovomorph-cycle-sheet`) ; plaque de Kessler **[À CRÉER]** | Drones, facehuggers **[PRÉSENT]** | — | Brèche de vide **[PRÉSENT]** | Routage d'énergie **[CODE]** |
| S4 Le hub | Modules du hub (7) **[À CRÉER]** | Occupants : techniciens, récupérateurs, colons **[À CRÉER]** | Routines PNJ **[CODE]** (`npc-dialogue-v62.js`) | Remise en pression **[À CRÉER]** | Nouveau hub jouable **[À CRÉER]** |
| Annexes (7) | Caches d'Echo-8, journaux, serre, balise UPP, caméras de CASSIUS, code administrateur **[À CRÉER]** | BISHOP-9, ECHO-A **[PRÉSENT]** | Plantes hydroponiques (boucle) **[À CRÉER]** | — | — |
| CIN-70 à 72 | Station en rotation, dropship au sas, dernier enregistrement **[À CRÉER]** | Kessler (visage sur enregistrement) **[À CRÉER]** | — | — | — |

### 29.5 Quêtes du Tantalus (16 + 6 + 4)

Elles se jouent surtout au hub, avec des PNJ **[PRÉSENT]**. Besoins **[À CRÉER]** : poses de dialogue assises ou au poste pour chaque membre (au moins une par personnage), objets de quête (composants de DAVID-8R, plaques de colons, fragment de sceau, tourelles sentinelles, enregistreurs de Kappa), écran de sélection des recrues (Voss, Bensaïd, Reed, Seo : planches de déplacement et de mission à créer pour chacun).

**Illustrations disponibles (16 novembre 2026).** Les onze cartes de §8.5 et les quatre cartes des premières quêtes de §8.4 sont produites. Leur présence ne fournit pas les poses ni les props animés de la liste ci-dessus. La carte d'Echo-8 est aussi réutilisée par la quête d'ECHO-A.

---

## 30. Campagne annexe 1 — La Saison des Reines

### 30.1 Arc 1 · Nacre-7

**Socle de l'arc :** décor colonie aquacole sur pilotis (plates-formes, bassins, salle des pompes, phare) **[À CRÉER]** ; décor sous-marin (coque du *Mariner's Debt*, fossé) **[À CRÉER]** ; Dr Navarre, pêcheurs **[À CRÉER]** ; capitaine Rask et escouade W-Y (base `weyland-yutani-commando` **[PRÉSENT]**, Rask lui-même **[À CRÉER]**) ; lignée récifale (`ceto-reef-predator`, `reef-spitter`, `reef-stalker` **[PRÉSENT]**, à vérifier comme lignée) ; VFX eau `flood-ripple-splash-cycle`, `flood-waterline-tiles` **[PRÉSENT]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1 Le quai noyé | Tables servies, pompes **[À CRÉER]** | Navarre **[À CRÉER]** | — | Pluie sur l'eau **[À CRÉER]** | — |
| 1.2 Les bassins | Œufs fixés comme des coraux **[À CRÉER]** ; filets avec cocons **[DETTE]** | Drones récifaux | Bassin qui se vide (niveau d'eau) **[À CRÉER]** | Écoulement **[À CRÉER]** | Pompage **[À CRÉER]** |
| 1.3 Plongée HADAL | Coque immergée, nid **[À CRÉER]** | Lurker récifal | Tenue HADAL modulaire **[PRÉSENT]** dans le chapitre local ; cycle de nage dédié **[DETTE]** (`dedicated-hadal-manta-art`) | Bulles, particules, lampe **[À CRÉER]** | Nage **[CODE]** ; oxygène limité **[À CRÉER]** dans cet arc proposé |
| 1.4 Reine des récifs | Fossé, nid royal **[À CRÉER]** | Reine récifale **[À CRÉER]** | Coque statique MANTA-6 **[PRÉSENT]** dans le chapitre local ; animations supplémentaires **[DETTE]** ; Reine nageant **[À CRÉER]** | Torpilles, traînées, projecteurs **[À CRÉER]** | Pilotage sous-marin **[CODE]** (chapitre existant) ; arc Nacre-7 proposé distinct |
| 1.5 Ce que Rask voulait | Œuf royal en caisson **[À CRÉER]** | Rask, escouade W-Y | — | — | Choix laisser/saisir/détruire **[À CRÉER]** |
| Annexes (3) | Laboratoire inondé, filets, phare **[À CRÉER]** | Pêcheur survivant **[À CRÉER]** | Canots qui approchent **[À CRÉER]** | Faisceau du phare **[À CRÉER]** | Hissage de filet **[À CRÉER]** |
| Cinématiques CQ-01, CQ-02 | Trois coquilles d'œuf, fossé éclairé **[À CRÉER]** | Inez **[PRÉSENT]** | — | — | — |

**V188 spec 011 :** missions, choix laisser/saisir/détruire et scènes de retour **[CODE]** (§14.11) ; décors, props, Navarre, Rask, Reine récifale nageant et VFX ci-dessus restent **[À CRÉER]** : les scènes et CQ-01/CQ-02 les remplacent par des primitives Canvas nommées (`queens-quay`, `queens-pools`, `queens-trench`, `queens-rask`, `queens-cin-three-shells`, `queens-cin-trench-queen`…). Les missions 1.1, 1.2 et 1.5 tournent sur des gabarits génériques.

### 30.2 Arc 2 · Echo Basin

**Socle de l'arc :** canyons rouges, tour relais, ville troglodyte de Gorge-Seize, aiguille rocheuse **[À CRÉER]** (fond `planet-exterior` **[PRÉSENT]** comme base) ; mineurs **[À CRÉER]** ; lignée fouisseuse (base `xenomorph-crusher-action-sheet`, `xenomorph-burster-action-sheet-v56` **[PRÉSENT]**, variante **[À CRÉER]**) ; lignée aérienne **[DETTE]** ; Reine ailée **[PRÉSENT]** dans le chapitre local Broodstorm (douze poses, voir §56.17), réemploi dans cet arc et atterrissage **[À CRÉER]** ; Cheyenne **[PRÉSENT]** (`ud-4l-cheyenne-dropship-action-sheet`), version modulaire **[DETTE]** (`complete-modular-dropship-corpus`).

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 2.1 Relais Gorge-Seize | Tour relais **[À CRÉER]** | Mineurs **[À CRÉER]** | — | Faux échos sur le détecteur (interface) **[À CRÉER]** | Lecture des faux signaux **[À CRÉER]** |
| 2.2 Le sol qui s'ouvre | Dalles renforcées, galeries qui s'ouvrent **[À CRÉER]** | Fouisseurs **[À CRÉER]** | Sortie de sol **[À CRÉER]** | Fissures, poussière **[À CRÉER]** | Vibrations à surveiller **[À CRÉER]** |
| 2.3 Nids sous les surplombs | Nids de falaise **[À CRÉER]** | Planeurs **[À CRÉER]** | Piqué **[À CRÉER]** | Tir aérien, explosions **[PRÉSENT]** (`combat-vfx-animation-sheet`) | Tir depuis l'appareil **[CODE]** (Broodstorm) |
| 2.4 La Reine volante | Aire au sommet **[À CRÉER]** | Art local Broodstorm **[PRÉSENT]** ; rencontre de cet arc **[À CRÉER]** | Poursuite, réaction et mort en vol **[PRÉSENT]** dans Broodstorm ; atterrissage **[DETTE]** | Vent, chutes de pierres **[À CRÉER]** | Combat en hauteur de cet arc **[À CRÉER]** |
| 2.5 Carte des lignées | Registre de vol **[À CRÉER]** | Inez **[PRÉSENT]** | — | — | Lecture **[CODE]** |
| Annexes (4) | Puits 7, épave Crucible, capteurs sismiques, route des crêtes **[À CRÉER]** | Contremaître, Rask, Grue **[À CRÉER]** | Remontée de puits (ascenseur) **[À CRÉER]** | — | — |
| CQ-03 | Coucher de soleil sur le canyon **[À CRÉER]** | Référence Broodstorm **[PRÉSENT]** ; mise en scène CQ-03 **[À CRÉER]** | — | — | — |

### 30.3 Arc 3 · TR-0, la Ruche-monde

**Socle de l'arc :** surface vivante, organes, noyau **[DETTE]** (`complete-organ-biomes`, `dedicated-planet-queen-art`) ; Base Ombelle sous la résine **[À CRÉER]** ; adulte Reine-Mère rouge **[PRÉSENT]** dans le chapitre local « Le chant de la Reine-Mère » (huit poses composées, §56.18), gardes locaux illustrés par réemploi adapté de l'atlas praetorian **[PRÉSENT]** (§56.19), réemploi dans l'arc étendu **[À CRÉER]** ; trois Chœurs locaux illustrés par création originale **[PRÉSENT]** (§56.20) ; casting royal complet **[DETTE]** (`complete-royal-cast`) ; praetorian **[PRÉSENT]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 3.1 Atterrissage | Croûte qui respire **[DETTE]** | — | Surface animée **[DETTE]** | Pulsations **[À CRÉER]** | Jauge de bruit **[CODE]** (alerte existante) |
| 3.2 Base Ombelle | Laboratoire W-Y sous résine, registres d'expédition **[À CRÉER]** | — | — | — | Lecture **[CODE]** |
| 3.3 Trois Chœurs | Nurserie, artère royale, balises **[CODE]** (chapitre existant) | Trois cibles locales illustrées **[PRÉSENT]** ; castes reliées **[DETTE]** | Quatre états de présentation originaux **[PRÉSENT]** (§56.20) | Ondes du Chœur **[À CRÉER]** | Rupture des Chœurs **[CODE]** |
| 3.4 La Reine-Mère | Salle royale **[CODE]** (chapitre existant) | Adulte rouge et gardes locaux illustrés **[PRÉSENT]** ; rencontre de l'arc étendu **[À CRÉER]** | Huit poses composées de l'adulte et seize cellules réemployées pour les gardes **[PRÉSENT]** ; quatre phases natives **[CODE]** | — | Boss local **[CODE]** |
| 3.5 Le noyau | Organes, noyau, sas **[CODE]** | — | Effondrement **[À CRÉER]** | Effondrement, poussière organique **[À CRÉER]** | Fuite chronométrée **[CODE]** |
| Annexes (2) | Chambre froide **[À CRÉER]** | Chercheur survivant **[À CRÉER]** ; praetorian capturé **[PRÉSENT]** | Créature entravée **[À CRÉER]** | — | Capture d'organisme **[À CRÉER]** |
| CQ-04 à 06 | Vue orbitale de TR-0, décollage **[À CRÉER]** | — | — | — | — |

---

## 31. Campagne annexe 2 — Directive zéro

### 31.1 Arc 1 · Sable Meridian

**Socle de l'arc :** désert, dunes, relais de Sel-Blanc, oasis **[À CRÉER]** ; caravane minière (`crucible-caravan-crawler` **[PRÉSENT]**) ; synthétiques Seegson (`working-joe-combat-sheet`, `seegson-security` **[PRÉSENT]**) ; `caravan-stalker`, `dust-runner` **[PRÉSENT]** ; colons du désert **[À CRÉER]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1 La caravane 12 | Cabine verrouillée **[À CRÉER]** | 40 synthétiques immobiles (une pose idle dédiée suffit) **[À CRÉER]** | Synthétique au repos, tête qui se tourne **[À CRÉER]** | Vent de sable **[À CRÉER]** | Libération discrète **[À CRÉER]** |
| 1.2 Le refus | — | Synthétiques qui attaquent **[PRÉSENT]** | Saisie, étranglement **[À CRÉER]** | Liquide blanc à l'impact **[À CRÉER]** | Escorte **[CODE]** |
| 1.3 Récupérer une tête | Tête synthétique transportable **[À CRÉER]** | — | Portage d'une tête **[CODE]** (`carry`) | — | Récupération de synthétique **[CODE]** (objectif) |
| 1.4 Sel-Blanc | Antenne de relais **[À CRÉER]** | Colons armés **[À CRÉER]** | — | Arc électrique **[PRÉSENT]** | Destruction de relais **[CODE]** (objectif) |
| Annexes (3) | Ferme de l'oasis, outil d'arrêt **[À CRÉER]** | Grue, famille de l'oasis **[À CRÉER]** | — | — | Commande d'arrêt synthétique **[À CRÉER]** |
| CS-01, CS-02 | Plan large de la caravane, écran `PRIORITÉ 0` **[À CRÉER]** | — | Tête qui se tourne à l'unisson **[À CRÉER]** | — | — |

### 31.2 Interlude · Tantalus

| Mission | Props | Personnages | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| I.1 Coupure | Interface d'isolement des relais **[À CRÉER]** | MU/TH/UR **[PRÉSENT]** | — | — | Choix d'isolement **[À CRÉER]** |
| I.2 ECHO-A | Armurerie verrouillée **[PRÉSENT]** (`hub/armory-v169`) | ECHO-A **[PRÉSENT]** | ECHO-A en garde devant une porte **[À CRÉER]** | — | Crise `synthetic` **[CODE]** (`world-crisis-core.js`) ; persuasion **[À CRÉER]** |

### 31.3 Arc 2 · Chantiers de Kéos

**Socle de l'arc :** station-usine Seegson (halls d'assemblage, chaînes, cuves, salle des mises à jour) **[À CRÉER]** ; `seegson-maintenance-tram` **[PRÉSENT]** ; Marta Oyelaran **[À CRÉER]** ; ouvriers enfermés **[À CRÉER]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 2.1 Arrimage | Comptoir d'accueil **[À CRÉER]** | Synthétique d'accueil poli **[À CRÉER]** | Geste d'accueil **[À CRÉER]** | — | Dialogue de refus **[À CRÉER]** |
| 2.2 Les ouvriers | Quartiers verrouillés, caméras **[À CRÉER]** | Ouvriers **[À CRÉER]** | — | Balayage de caméra **[À CRÉER]** | Caméras **[CODE]** |
| 2.3 La chaîne | Chaînes de montage, synthétiques en cours d'assemblage **[À CRÉER]** | Synthétiques neufs **[À CRÉER]** | Synthétique qui se décroche de la chaîne **[À CRÉER]** | Étincelles, vapeur **[PRÉSENT]** | Coupure d'énergie par section **[CODE]** |
| 2.4 Marta Oyelaran | Conduits **[PRÉSENT]** | Marta **[À CRÉER]** | — | — | — |
| 2.5 Serveur | Baies de serveurs **[À CRÉER]** | Synthétique de maintenance industrielle (boss) **[À CRÉER]** | Attaque lourde, câbles **[À CRÉER]** | Décharges **[PRÉSENT]** | Inversion de diffusion **[À CRÉER]** |
| Annexes (3) | Cuves de liquide synthétique **[À CRÉER]** | Vieux synthétique hors réseau **[À CRÉER]** | Synthétique qui flotte en cuve **[À CRÉER]** | Bulles laiteuses **[À CRÉER]** | — |
| CS-04 | Centaines de synthétiques qui ouvrent les yeux **[À CRÉER]** | — | — | — | — |

### 31.4 Arc 3 · Murmure

**Socle de l'arc :** forêt pâle sans vent, base Hyperdyne/W-Y **[À CRÉER]** ; Jeri et SAINT **[DETTE]** (`dedicated-jeri-and-saint-animation`, `complete-segmented-synthetic-art`) ; Éloïse **[DETTE]** (`dedicated-eloise-animation`, portrait statique disponible) ; HUSH-6 et Chasseur de Mères **[DETTE]** (`hush-six-and-mother-hunter-art`) ; drones gardés par des synthétiques **[PRÉSENT]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 3.1 Les arbres qui écoutent | Arbres pâles **[À CRÉER]** | Synthétiques et drones côte à côte **[PRÉSENT]** | Garde immobile partagée **[À CRÉER]** | Brume **[À CRÉER]** | — |
| 3.2 Le faux fils | Inspections ouvrière, nourrice, reine **[CODE]** | Jeri, SAINT **[DETTE]** | Jeri aux murs et au plafond **[DETTE]** | Nuage phéromonal **[À CRÉER]** | Infiltration **[CODE]** (chapitre) |
| 3.3 HUSH-6 | Station HUSH-6 **[CODE]** | HUSH-6 **[DETTE]** | — | — | Récupération **[CODE]** |
| 3.4 Reine sans couronne | Pylônes, Chœur, carte mutable **[CODE]** | Éloïse, Chasseur de Mères **[DETTE]** | Éloïse parlant à travers la ruche **[DETTE]** | Fils organiques lumineux **[À CRÉER]** | 4 fins **[CODE]** (`hive-control-v131.js`) |
| Annexes (2) | Contrats Hyperdyne **[À CRÉER]** | ECHO-A **[PRÉSENT]** | — | — | — |
| CS-05, CS-06 | Éloïse, 4 fins **[À CRÉER]** | — | — | — | — |

---

## 32. Campagne annexe 3 — Les Bâtisseurs

**Socle commun :** échelle surhumaine des Ingénieurs ; ampoules de Pathogène (intactes, fendues, brisées) **[À CRÉER]** ; glyphes et fresques (au moins 6 panneaux) **[À CRÉER]** ; néomorphe **[PRÉSENT]** (`neomorph-locomotion-sheet`), protomorph et `deacon-line` **[PRÉSENT]** ; Dr Viret et expédition **[À CRÉER]** ; Grue et récupérateurs **[À CRÉER]**.

| Mission | Décors / props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1 Camp de Grue | Camp sur astéroïde, hublot avec l'épave **[À CRÉER]** | Survivants Crucible **[À CRÉER]** | — | — | — |
| 1.2 La brèche | Couloirs en croissant, corps de récupérateurs **[À CRÉER]** | — | Déplacement en gravité faible **[À CRÉER]** | Poussière en suspension **[À CRÉER]** | Gravité faible **[À CRÉER]** |
| 1.3 Baie aux ampoules | Baie, ampoules **[À CRÉER]** | Récupérateur contaminé, forme pâle **[PRÉSENT]** (néomorphe) | Transformation d'un humain **[À CRÉER]** | Liquide noir qui se répand **[À CRÉER]** | Éviter de briser (collision) **[À CRÉER]** |
| 1.4 Siège du pilote | Siège colossal, pilote fossilisé **[À CRÉER]** | DAVID-8R **[PRÉSENT]** | DAVID touchant la console **[À CRÉER]** | Carte stellaire projetée **[À CRÉER]** | Déchiffrage avec indice de confiance **[À CRÉER]** |
| 1.5 Expédition Viret | Caisses de prélèvement **[À CRÉER]** | Viret, techniciens W-Y **[À CRÉER]** | — | Contamination qui gagne **[À CRÉER]** | Escorte **[CODE]** |
| 2.1-2.5 Pangaea | Canopée, marais, falaises, monolithe **[À CRÉER]** ; fond `planet-exterior` **[PRÉSENT]** | Faune géante, castes Sauria, Porte-Ruche Colosse **[DETTE]** (`dedicated-dinosaur-and-sauria-art`, `complete-prehistoric-corpus`) | Troupeau en mouvement **[DETTE]** | Pathogène sur la végétation **[À CRÉER]** | Nids, hôtes sains, boss **[CODE]** (chapitre) ; guidage de troupeau **[À CRÉER]** |
| 3.1 Le dôme | Dôme sous la neige **[À CRÉER]** | — | Ouverture du dôme **[À CRÉER]** | Neige **[À CRÉER]** | — |
| 3.2 Fresques | Galerie de fresques **[À CRÉER]** | — | — | Lumière rasante **[À CRÉER]** | Collectables **[CODE]** (système V68) |
| 3.3 Chambre de semence | Milliers d'ampoules, cuves **[À CRÉER]** | Deacon/Protomorph **[PRÉSENT]** | Sortie de cuve **[À CRÉER]** | Liquide noir, vapeur **[À CRÉER]** | Coupure d'alimentation **[À CRÉER]** |
| 3.4-3.5 Le Dormeur | Caisson de stase **[À CRÉER]** | Ingénieur (boss) **[À CRÉER]** | Réveil, marche, attaques, mort **[À CRÉER]** | Impacts lourds **[À CRÉER]** | Boss à grande échelle **[À CRÉER]** |
| Annexes (7) | Plaques, sonde UPP, chapelle, campement Viret **[À CRÉER]** | `upp-vanguard` **[PRÉSENT]** | — | — | — |

---

## 33. Campagne annexe 4 — Fièvre noire

**Socle commun :** jauge de contamination, masques et filtres (interface et équipement) **[À CRÉER]** ; `pathogen-containment-projector` **[PRÉSENT]** ; `pathogen-mimic`, `abomination-pathogen-brute`, néomorphe, protomorph **[PRÉSENT]** ; planche `pathogen-fauna-animation-sheet.png` **[PRÉSENT]** ; Dr Szabo, Moreau, colons de Pallas Rift **[À CRÉER]**.

| Mission | Décors / props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1 Pluie noire | Fracture, parois tachées, infirmerie barricadée **[À CRÉER]** | Colons armés **[À CRÉER]** | Tir de panique **[À CRÉER]** | Pluie noire **[À CRÉER]** | Établir le contact sans tirer **[À CRÉER]** |
| 1.2 Triage | Scanner de triage **[À CRÉER]** | Colons à tester **[À CRÉER]** | Éclosion pendant le test **[À CRÉER]** | Éruptions noires sur la peau **[À CRÉER]** | Test biologique avec incertitude **[À CRÉER]** |
| 1.3 Réservoirs | Réservoirs, vannes **[À CRÉER]** | Formes pâles **[PRÉSENT]** | — | Spores en suspension **[À CRÉER]** ; eau **[PRÉSENT]** | Fermeture de vannes **[À CRÉER]** |
| 1.4 La cavité | Parois sculptées, ampoules fendues **[À CRÉER]** | — | — | Liquide qui s'écoule **[À CRÉER]** | Scellement de puits **[À CRÉER]** |
| 1.5 Moreau | Laboratoire de colonie **[À CRÉER]** | Moreau **[À CRÉER]** | — | — | Escorte **[CODE]** |
| 2.1-2.4 *Clémence* | Vaisseau-hôpital : couloirs, service d'isolement, pharmacie, propulsion **[À CRÉER]** ; fonds `ship-habitation` **[PRÉSENT]** comme base | Patients transformés **[À CRÉER]** ; Szabo **[À CRÉER]** | Patient qui se lève du lit **[À CRÉER]** | Lumières de garde **[À CRÉER]** | Soudure **[CODE]** ; relance de propulsion **[À CRÉER]** |
| 3.1 Feu de quarantaine | Satellites de défense **[À CRÉER]** | — | Navette qui explose **[À CRÉER]** | Explosion silencieuse **[À CRÉER]** | Pilotage sous un réseau de tir **[À CRÉER]** |
| 3.2-3.4 Orphée | Laboratoire du niveau zéro, salle de contrôle des satellites **[À CRÉER]** | Deacon/Protomorph **[PRÉSENT]** | — | — | Prise de contrôle des satellites **[À CRÉER]** ; choix final **[À CRÉER]** |
| Annexes (7) | École, galeries, maternité, filtres **[À CRÉER]** | Institutrice, foreur, mère et nouveau-né **[À CRÉER]** | Noor exposé (pose) **[À CRÉER]** | — | Traitement d'exposition **[À CRÉER]** |

---

## 34. Campagne annexe 5 — Le banc d'essai

| Mission | Décors / props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1-1.5 MIRE-9 | Rues identiques, murs mobiles, caméras, salle d'observation, consoles MIRE **[À CRÉER]** | Colons observés **[À CRÉER]** ; drones **[PRÉSENT]** | Murs qui pivotent **[À CRÉER]** | Écrans de surveillance **[À CRÉER]** | Blocage des murs **[À CRÉER]** ; entrée dans une archive MIRE **[À CRÉER]** |
| 2.1-2.4 *Bonne-Espérance* | Baies d'hypersommeil (2 000 caissons, répétables), passerelle, bloc médical **[À CRÉER]** | Colons endormis, équipage barricadé **[À CRÉER]** ; chestburster **[PRÉSENT]** | Caissons qui s'allument en vert **[À CRÉER]** | Givre de caisson **[À CRÉER]** | Retrait d'embryon (mini-jeu) **[À CRÉER]** ; changement de cap **[À CRÉER]** |
| 3.1 Fonderies | Coulées de métal, cages **[À CRÉER]** | Broods blindés **[À CRÉER]** (base `foundry-crusher`, `foundry-drone` **[PRÉSENT]**) ; Rask **[À CRÉER]** | — | Métal en fusion **[À CRÉER]** ; feu **[PRÉSENT]** | Infiltration de nuit **[À CRÉER]** |
| 3.2 Quatre chargeurs | Arène de siège **[CODE]** | Atlas, Vulcain, Cerbère, Méduse, Reine de siège Morrigan **[DETTE]** (`dedicated-z110-and-morrigan-art`, `complete-mecha-animation-corpus`) ; `combat-power-loader` **[PRÉSENT]** | — | — | Chargeurs **[CODE]** (chapitre) |
| 3.3 Fausse reine | Trois artères, chambre royale **[CODE]** | Armure-reine, meute **[DETTE]** (`dedicated-regina-animation`, `complete-seven-sector-campaign`) ; `atarax-controller` **[PRÉSENT]** | — | Liaison neuronale **[À CRÉER]** | Ordres Griffe/Ombre/Rempart **[CODE]** |
| 3.4 Dr Asch | Centre ATARAX **[À CRÉER]** | Asch **[À CRÉER]** | — | — | — |
| 3.5 Halloran | Hangar de commandement **[À CRÉER]** | Halloran **[À CRÉER]** ; commandos W-Y **[PRÉSENT]** | — | — | Confrontation avec choix **[À CRÉER]** |
| 3.6 Talos contre le Titan | Arène destructible **[CODE]** | TALOS, Titan **[DETTE]** (`dedicated-talos-titan-art`, `canonical-mega-loader-corpus`) | 5 phases **[DETTE]** | Chaleur, corrosion **[CODE]** | Duel **[CODE]** |
| Annexes (7) | Fiches, Palimpste, journal du commandant, cages **[À CRÉER]** | Enfant perdu, colons de Cocyte captifs **[À CRÉER]** | — | — | Chirurgie d'urgence **[À CRÉER]** |

---

## 35. Archives MIRE — besoins par archive

**Socle commun [À CRÉER] :** filtre visuel « modèle » (zones peu documentées moins nettes), écran de coupure `MODÈLE INTERROMPU`, interface d'indice de fidélité, interface de choix de protocole.

| Archive | Décors | Rôle joué | PNJ / ennemis | Props | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 Nostromo | Selon option A ou B (§26.2) **[DETTE]** (`complete-nostromo-cast`, `complete-historical-campaign`) | Option B : technicien de raffinerie **[À CRÉER]** | — | Cuves de raffinerie **[À CRÉER]** | — | — | Score de fidélité **[CODE]** (synchronisation) |
| 002 Sevastopol | Quartier des transits, niveaux techniques, refuge **[À CRÉER]** | Yara Okonedo **[À CRÉER]** | Synthétiques Seegson **[PRÉSENT]** ; habitants **[À CRÉER]** | Compteurs, ascenseur, caisses de rations **[À CRÉER]** | Ronde, réparation **[À CRÉER]** | Lumières de secours **[À CRÉER]** | Rondes chronométrées **[À CRÉER]** |
| 003 Renaissance | Laboratoire de nuit, module sans gravité, chambres froides **[À CRÉER]** | Ilan Varga **[À CRÉER]** | — | Cuves, capsule de stockage **[À CRÉER]** | Objets flottants **[À CRÉER]** | Givre **[PRÉSENT]** | Gravité instable **[À CRÉER]** |
| 004 Acheron | Colonie dans la tempête, processeur, école, infirmerie, niveau C **[À CRÉER]** | Ruben Akintola **[À CRÉER]** | Colons, médecin **[À CRÉER]** ; drones **[PRÉSENT]** | Conduites, lampe, barricades **[À CRÉER]** | Marche contre le vent **[À CRÉER]** | Tempête, sable **[À CRÉER]** | Barricades **[CODE]** (soudure) |
| 005 Fiorina 161 | Fonderie, galeries, hangar, générateurs **[À CRÉER]** | Silas Brennan **[À CRÉER]** | Détenus **[À CRÉER]** ; vermine (`tantalus-tunnel-vermin` **[PRÉSENT]** comme base) | Creuset, torches **[À CRÉER]** | Coulée du métal **[À CRÉER]** | Métal en fusion, étincelles **[À CRÉER]** | Fonderie (manipulation) **[À CRÉER]** |
| 006 Katanga | Lignes de raffinage, quais, soute 4, module central **[À CRÉER]** | Nadia Ferreira **[À CRÉER]** | Opérateurs **[À CRÉER]** | Vannes, cargaison de surface **[À CRÉER]** | — | Vapeur **[PRÉSENT]** | Vannes et pression **[À CRÉER]** ; chargeur **[CODE]** |

---

## 36. Missions par planète — besoins

### 36.1 Chaînes Héritage, préquelles et Gateway (§22)

| Chaîne | Décors | Props | Personnages / ennemis | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| Acheron | Cratère, ruines fondues, drainage **[À CRÉER]** | Capteurs de la compagnie **[À CRÉER]** | Récupérateurs Crucible **[À CRÉER]** ; drones **[PRÉSENT]** | Radiation **[PRÉSENT]** | — |
| LV-223 | Jungle née de la substance noire, dôme, épave mangée **[À CRÉER]** | Cuves vides, fresques **[À CRÉER]** (partagées avec §31) | Faune mutante **[PRÉSENT]** (`pathogen-fauna-animation-sheet`) | Végétation qui bouge **[À CRÉER]** | — |
| Fiorina 161 | Fonderie froide, infirmerie **[À CRÉER]** (partagés avec archive 005) | Archives médicales, caissons d'échantillons **[À CRÉER]** | Équipe militaire **[À CRÉER]** | — | Échantillons emportés quoi qu'il arrive (script) **[À CRÉER]** |
| Sevastopol | Champ de débris orbital **[À CRÉER]** | Module de serveur Seegson **[À CRÉER]** | Synthétique Seegson **[PRÉSENT]** | Débris en rotation **[À CRÉER]** | Navigation dans les débris **[À CRÉER]** |
| Nostromo (route de Zeta) | Espace, balise **[À CRÉER]** | Balise de navigation **[À CRÉER]** | — | — | — |
| Jackson's Star / Renaissance | Colonie minière sous la pluie, anneaux **[À CRÉER]** | Module de laboratoire **[À CRÉER]** | Mineurs **[À CRÉER]** | Pluie **[À CRÉER]** | Escorte **[CODE]** |
| Auriga (préquelle) | Chantier militaire **[À CRÉER]** | Cargaison scellée **[À CRÉER]** | Scientifiques militaires **[À CRÉER]** | — | Confinement **[CODE]** |
| Épave militaire | Baies de largage, soute scellée **[À CRÉER]** | Matériel des Marines **[PRÉSENT]** (armes) | — | — | — |
| Gateway | Quais civils, salle d'audience de l'ICC **[À CRÉER]** | Bancs, pupitre **[À CRÉER]** | Juges, avocats de la compagnie, agents de sécurité **[À CRÉER]** | — | Audience à choix de pièces **[À CRÉER]** |
| LV-895 / Katanga | Site de surface disputé, débris de station **[À CRÉER]** | Stock de Pathogène **[À CRÉER]** | Équipes W-Y **[PRÉSENT]** (commandos) et Hyperdyne **[À CRÉER]** | — | — |
| Purdan | Installation fermée, ruines **[À CRÉER]** | Balise automatique **[À CRÉER]** | — | — | — |
| LV-1201 (préquelle) | Jungle de temples **[À CRÉER]** | Trophées, marques non humaines **[À CRÉER]** | Équipe de relevé, guides **[À CRÉER]** | — | — |
| BG-386 | Raffinerie, pyramides sous la jungle **[À CRÉER]** | — | — | — | — |
| Ryushi | Ranch, désert, gorge, épave **[À CRÉER]** | Enclos **[À CRÉER]** | Bétail hôte (`wild-boar-host` **[PRÉSENT]** comme base) | — | — |
| LV-742 | Station de terraformation assiégée **[À CRÉER]** | Pièges **[À CRÉER]** | — | — | — |

### 36.2 Mondes §23, §24 et sites frontaliers §25

Ces missions réutilisent au maximum les décors de zone **[PRÉSENT]** (`ship-*`, `colony-multiroute`, `planet-exterior`) et les ennemis du socle. Besoins propres **[À CRÉER]**, par famille de lieux :

| Famille de lieux | Missions concernées | Décors à créer | Props à créer |
| --- | --- | --- | --- |
| Océan, archipel, glace | Ceto, Freya's Prospect, Nacre-7 (§24), sites `ceto-reach`, `freya-s-prospect-basin`, `nacre-7-depths` | Cité sur pilotis, glacier intérieur, fosse | Foreuse sous-marine, phare, balise de fond |
| Ville et métro | New Galveston, New Albion, sites `new-galveston-reach`, `new-albion-basin` | Fondations urbaines, tunnels de métro, dépôt de rames | Rame de métro, quais |
| Agricole et forêt | Capua VII, Korari, sites `capua-vii-colony`, `korari-frontier` | Marais, champs, forêt, laboratoire envahi | Moissonneuse, poste d'observation |
| Orbital et épaves | Orphée, sites `sevastopol-drift`, `katanga-depths`, `uscss-nostromo-depths`, `sulaco-drift-frontier`, `palimpste-drift` | Satellites, modules dérivants, raffinerie dérivante | Capsules de sauvetage, satellite d'archives |
| Désert, canyon, avant-postes | Sable Meridian, Echo Basin (§24), sites `sable-meridian-colony`, `echo-basin-basin`, `lv-742-prime`, `ryushi-depths`, `lv-1201-drift` | Puits, lac souterrain, pont de corde, grottes | Pont, machines de terraformation |
| Installations de la compagnie | MIRE-9, Khepri, Pallas Rift (§24), sites `mire-9-reach`, `khepri-forge-frontier`, `pallas-rift-station`, `pioneer-station-frontier` | Quartier oublié, avant-poste, quai de quarantaine | Caméras démontables, dépôt d'armes |

---

## 37. Récapitulatif de production

### 37.1 Personnages originaux à créer

| Groupe | Personnages |
| --- | --- |
| Campagne principale | Adèle Sarrazin, Tomas Wren, Lucia Ferro, Directrice Halloran, Grue, Solène Ivarsson (journaux), Dario Kessler (enregistrement), I. Voss (portrait), colons génériques, récupérateurs |
| Recrues | Mara Voss, Nadia Bensaïd, Jonas Reed, Jun Seo |
| Campagne 1 | Dr Ilse Navarre, capitaine Tobiah Rask, mineurs, pêcheurs, chercheur de Base Ombelle |
| Campagne 2 | Marta Oyelaran, synthétique d'accueil, vieux synthétique, colons du désert, famille de l'oasis |
| Campagne 3 | Dr Anselme Viret et expédition, l'Ingénieur (le Dormeur) |
| Campagne 4 | Dr Hana Szabo, Aurèle Moreau, colons de Pallas Rift, patients |
| Campagne 5 | Dr Corwin Asch, colons de MIRE-9, équipage du *Bonne-Espérance* |
| Archives MIRE | Yara Okonedo, Ilan Varga, Ruben Akintola, Silas Brennan, Nadia Ferreira, technicien du Nostromo (option B), PNJ de chaque époque |
| Planètes | Juges et avocats de l'ICC, équipe militaire de Fiorina, équipe de relevé de LV-1201, équipe Hyperdyne |

### 37.2 Créatures et boss à créer ou à terminer

| Créature | Statut |
| --- | --- |
| Reine récifale, lignée fouisseuse, lignée aérienne | [À CRÉER] (variantes de castes [PRÉSENT]) |
| Reine volante | Art local Broodstorm [PRÉSENT] ; atterrissage et autres rencontres [À CRÉER] |
| Reine-Mère adulte | Art et huit poses du chapitre local [PRÉSENT] ; autres rencontres [À CRÉER] |
| Gardes de la Reine-Mère | Présentation locale adaptée de l'atlas praetorian [PRÉSENT] ; aucune nouvelle attribution de caste |
| Chœurs locaux de la Reine-Mère | Présentation originale des trois cibles [PRÉSENT] ; aucune attribution de caste |
| Casting royal complet et Ruche-monde | [DETTE] |
| Jeri, SAINT, Éloïse, HUSH-6, Chasseur de Mères | [DETTE] |
| Synthétique de maintenance industrielle (boss de Kéos) | [À CRÉER] |
| Faune de Pangaea, castes Sauria, Porte-Ruche Colosse | [DETTE] |
| Ingénieur | [À CRÉER] |
| Patients transformés du *Clémence* | [À CRÉER] (base néomorphe [PRÉSENT]) |
| Broods blindés de Khepri | [À CRÉER] (base fonderie [PRÉSENT]) |
| Loaders Z-110, Reine de siège Morrigan, armure-reine, TALOS, Titan | [DETTE] |
| Reine du dépôt (poursuite, Acte V) | [À CRÉER] |

### 37.3 Mécaniques à créer

Apesanteur et gravité faible · piratage ou déchiffrage avec indice de confiance · jauge de contamination et traitement · test biologique avec incertitude · capture d'organisme vivant · commande d'arrêt synthétique · oxygène limité en plongée · lecture des faux signaux du détecteur · largage de remorque · face-à-face sans tir · audience à choix de pièces · chantiers de reconstruction · second hub (Asphodèle) · choix de protocole MIRE · retrait d'embryon · blocage de murs mobiles.

### 37.4 Ordre de production conseillé

1. **Socle réutilisable** : PNJ génériques (colons, ouvriers, scientifiques), décors de colonie et de station, props de laboratoire, VFX pluie/neige/sable/liquide noir.
2. **Dettes déjà déclarées** (limites listées dans `special-operations-v131.js`) : elles complètent les chapitres déjà jouables.
3. **Campagne principale** : Port-Méridien, Asphodèle, cinématiques.
4. **Campagnes annexes** dans l'ordre du §20.
5. **Archives MIRE et missions par planète**, qui réutilisent le socle.

Ces listes sont des besoins de conception. Elles ne remplacent pas un inventaire technique (dimensions, pivots, nombre d'images par animation), à établir au moment de la production de chaque élément, selon le guide `create-game-assets` cité dans `AGENTS.md`.


---

# PARTIE V — Audit complet des manques

## 38. Corrections et méthode de l'audit

### 38.1 Corrections apportées à la Partie IV

La première version de la Partie IV sous-estimait l'inventaire existant. Elle est corrigée au §28.3 :

| Élément | Avant | Après vérification de `assets/` |
| --- | --- | --- |
| M577 et Cheyenne | Seule la dette du Cheyenne modulaire était citée | Planches d'action, d'accès et de dégâts **présentes** (`assets/openai/sprites/vehicles/`) |
| Outils | Capture, scanner de contamination, masques, accès aux systèmes notés « à créer » | 29 planches d'outils **présentes** (`catch-pole`, `pathogen-scanner`, `rebreather`, `hazmat-suit`, `security-access-tuner`, `seismic-surveyor`…) ; c'est leur **mécanique** qui reste à vérifier ou à créer |
| Audio | Non audité | 3 musiques et 5 bruitages seulement : **manque majeur** (§38.13) |
| Joueur | Non audité | Planches d'Echo-9 et pièces de costumes présentes |

### 38.2 Méthode

Chaque besoin de la bible a été comparé aux noms de fichiers de `assets/` (hors `assets/user/`, qui contient des références) et aux identifiants du code. **Un fichier présent n'est pas une validation** : pivots, échelle, pieds, animations et intégration au runtime restent à contrôler élément par élément, selon `AGENTS.md`.

Pour chaque élément à créer, un **lot de génération** type est indiqué :

| Type d'élément | Lot minimal à générer |
| --- | --- |
| Personnage jouable ou PNJ actif | Planche de déplacement + planche de mission + portrait de dialogue + pièces de rig si le personnage doit porter des costumes |
| PNJ de décor | Planche de déplacement simple + 1 pose d'inactivité |
| Ennemi | Planche d'actions : déplacement, attaque, dégâts, mort (+ apparition et capture si utilisées) |
| Boss | Planche d'actions par phase + VFX propres + portrait d'alerte |
| Véhicule | Sprite natif + planche d'actions + planche d'accès et de dégâts |
| Décor de zone | 3 couches (lointain, intermédiaire, premier plan), variantes jour/nuit si le lieu est revisité |
| Prop interactif | États (fermé/ouvert, intact/détruit, éteint/allumé) |
| VFX | Cycle d'animation en boucle ou ponctuel |

### 38.3 Personnages — manques

| Groupe | Personnages | Nombre | Lot par personnage | Statut |
| --- | --- | --- | --- | --- |
| Équipage du Tantalus | 16 membres | 16 | Planches de déplacement et de mission **présentes** ; **poses de dialogue assises / au poste** et **poses blessées** pour les quêtes | Partiel |
| Recrues | Mara Voss, Nadia Bensaïd, Jonas Reed, Jun Seo | 4 | Lot complet | [À CRÉER] |
| Campagne principale | Adèle Sarrazin, Tomas Wren, Lucia Ferro, Halloran, Grue, Kessler, Ivarsson, I. Voss | 8 | Lot complet (Kessler, Ivarsson, Voss : portrait + enregistrement seulement) | [À CRÉER] |
| Campagnes annexes | Navarre, Rask, Oyelaran, Viret, Szabo, Moreau, Asch, chercheur d'Ombelle | 8 | Lot complet | [À CRÉER] |
| Archives MIRE | Okonedo, Varga, Akintola, Brennan, Ferreira, technicien du Nostromo | 6 | Lot complet (rôles joués : planches de combat, interaction et outils comme Echo-9) | [À CRÉER] |
| Missions par planète | Juges et avocats de l'ICC, équipe militaire de Fiorina, équipe de relevé de LV-1201, équipe Hyperdyne | 4 groupes | PNJ de décor | [À CRÉER] |
| Génériques | Colons (hommes, femmes, âgés, enfants), ouvriers, mineurs, pêcheurs, scientifiques, détenus, opérateurs de raffinerie, récupérateurs Crucible, techniciens de station, patients, colons en hypersommeil | ≥ 14 silhouettes | PNJ de décor, variantes de couleur | [À CRÉER] |
| Synthétiques originaux | Synthétique d'accueil de Kéos, vieux synthétique, synthétique de maintenance industrielle (boss) | 3 | Lot ennemi ou PNJ | [À CRÉER] |
| IA | CASSIUS (interface, pas de corps) | 1 | Interface animée | [À CRÉER] |

**Total : 30 personnages nommés (dont une IA), 4 groupes de PNJ de mission et au moins 14 silhouettes génériques à créer, plus des poses supplémentaires pour l'équipage.**

### 38.4 Ennemis et boss — manques

| Élément | Statut | Base existante |
| --- | --- | --- |
| Lignée récifale (drone, lurker) | Variante [À CRÉER] | `ceto-reef-predator`, `reef-spitter`, `reef-stalker` |
| Reine récifale | [À CRÉER] | `xenomorph-queen-*` |
| Lignée fouisseuse | Variante [À CRÉER] | `xenomorph-crusher`, `xenomorph-burster` |
| Lignée aérienne (planeurs) | [À CRÉER] | — |
| Reine volante | Art local Broodstorm [PRÉSENT] ; autres rencontres [À CRÉER] | Trois planches de quatre poses ; §56.17 |
| Reine-Mère adulte | Art local [PRÉSENT] ; autres rencontres [À CRÉER] | Deux planches de corps, quatre bras composés ; §56.18 |
| Gardes de la Reine-Mère | Présentation locale adaptée [PRÉSENT] | Atlas praetorian existant, seize cellules, six gardes initiaux et douze renforts possibles ; §56.19 |
| Chœurs locaux de la Reine-Mère | Présentation originale [PRÉSENT] | Une même arche costale pour les trois cibles, quatre états et appuis fixes ; §56.20 |
| Casting royal complet et Ruche-monde | [DETTE] | Les trois objets locaux illustrés ne définissent pas les trois castes reliées ni le casting étendu de TR-0 |
| Jeri, SAINT, Éloïse, HUSH-6, Chasseur de Mères | [DETTE] | — |
| Faune de Pangaea, castes Sauria, Porte-Ruche Colosse | [DETTE] | `wild-boar-host` (principe d'hôte animal) |
| Ingénieur (le Dormeur) | [À CRÉER] | — |
| Patients transformés du *Clémence* | Variante [À CRÉER] | `neomorph-locomotion-sheet`, `pathogen-mimic` |
| Broods blindés de Khepri | Variante [À CRÉER] | `foundry-crusher`, `foundry-drone` |
| Loaders Z-110, Reine de siège Morrigan | [DETTE] | `combat-power-loader`, `siege-royal` |
| Armure-reine A.T.A.X.-Q | [DETTE] | `atarax-controller`, outil `ripper-xenoarmor` |
| TALOS, Titan | [DETTE] | — |
| Reine du dépôt (poursuite, Acte V) | [À CRÉER] | `xenomorph-queen-*` |
| Récupérateurs Crucible armés | Variante [À CRÉER] | `colonial-raider`, `pale-crucible-hunter` |
| Équipes de sécurité Hyperdyne | [À CRÉER] | `weyland-yutani-commando` (gabarit) |
| Vermine de Fiorina | Variante [À CRÉER] | `tantalus-tunnel-vermin` |

**Animations ennemies transverses à créer :** sortie de berceau ou de conteneur, sortie du sol, piqué aérien, nage, sortie de cuve, transformation humaine, capture (créature entravée), réveil d'Ingénieur, synthétique qui se décroche d'une chaîne, synthétique immobile qui tourne la tête.

### 38.5 Véhicules et vaisseaux — manques

| Véhicule | Utilisé dans | Statut |
| --- | --- | --- |
| M577 | Acte III, Acte V, missions | [PRÉSENT] |
| Cheyenne | Insertion, Echo Basin, Broodstorm | [PRÉSENT] ; modulaire [DETTE] |
| Scaphandre HADAL, sous-marin MANTA-6 | Chapitre local Abysse Noir ; arc Nacre-7 proposé | Tenue HADAL modulaire et coque statique MANTA-6 [PRÉSENT] (V188, 17 novembre 2026) ; cycle de nage et animations supplémentaires [DETTE] (`dedicated-hadal-manta-art`) |
| USS Tantalus, vue extérieure | Cinématiques, carte galactique | [À CRÉER] (aucun fichier trouvé ; `tantalus-command-skiff` est une navette) |
| Station Asphodèle, vue extérieure et anneau | Cinématiques, hub | [À CRÉER] |
| Vaisseau de Grue (Crucible) | Asphodèle, Tyndare | [À CRÉER] |
| Vaisseau de récupération W-Y (Rask, Halloran) | Campagnes 1 et 5 | [À CRÉER] (base possible : `weyland-yutani-executive-shuttle`) |
| Vaisseau-hôpital *Clémence* | Campagne 4 | [À CRÉER] |
| Transport colonial *Bonne-Espérance* | Campagne 5 | [À CRÉER] |
| Vaisseau en croissant des Ingénieurs | Campagne 3 | [À CRÉER] |
| Navette de l'expédition Viret | Campagne 3 | [À CRÉER] |
| Satellites de quarantaine (Orphée) | Campagne 4 | [À CRÉER] |
| Transport Kappa | Acte IV | Présent dans le code de Cocon noir ; art dédié à vérifier |
| Navette civile qui explose | Campagne 4 | [À CRÉER] (base : `rt01-group-transport`) |
| Canots de Nacre-7 | Campagne 1 | [À CRÉER] (base : `reef-hydrofoil`, `ceto-patrol-boat`) |
| Rame de métro | New Albion | [À CRÉER] (base : `maglev-personnel-car`) |
| Moissonneuse | Capua VII | [À CRÉER] (base : `daihotai-tractor`) |
| Chargeurs Atlas, Vulcain, Cerbère, Méduse ; TALOS | Campagne 5 | [DETTE] |
| Caravane minière | Campagne 2 | [PRÉSENT] (`crucible-caravan-crawler`) |

### 38.6 Armes et équipements — manques

| Élément | Utilisé dans | Statut |
| --- | --- | --- |
| Arme anti-Reine (récompense de la campagne 1) | Campagne 1 | [À CRÉER] |
| Outil de commande d'arrêt synthétique | Campagne 2 | [À CRÉER] (base : `neuro-link-disruptor`, `signal-jammer`) |
| Traitement d'exposition (consommable) | Campagne 4 | [À CRÉER] |
| Masques et filtres améliorés | Campagne 4 | Base [PRÉSENT] (`rebreather`, `hazmat-suit`) ; versions améliorées [À CRÉER] |
| Scaphandre froid extrême | Campagne 3 | Base [PRÉSENT] (`pressure-suit`) ; variante [À CRÉER] |
| Scanner de contamination | Campagne 3 et 4 | [PRÉSENT] (`pathogen-scanner`) ; mécanique [À CRÉER] |
| Perche de capture | Interlude, campagnes 1 et 3 | [PRÉSENT] (`catch-pole`) ; mécanique [À CRÉER] |
| Capteurs sismiques | Campagne 1 | [PRÉSENT] (`seismic-surveyor`) ; mécanique [À CRÉER] |
| Outils de fonderie (archive 005) | MIRE | [À CRÉER] (creuset, crochet, torche) |
| Armes improvisées des civils | Colonie, MIRE | [À CRÉER] (outils, fusées de détresse) |
| Fusées éclairantes | C5, missions de nuit | [À CRÉER] |
| Armes Hyperdyne | Campagne 2, LV-895 | [À CRÉER] (base : catalogue d'armes existant) |

**Arsenal (spec 014, 22 novembre 2026).** Le catalogue garde ses 178 armes et en ajoute trois sans plaque native, donc non achetables : le fusil à pompe de Hicks (*Aliens*, 1986 ; identification Ithaca 37 par l'IMFDB, source secondaire), le fusil à pompe et le lance-flammes de Sevastopol (*Alien: Isolation*, classes nommées par le manuel Feral) — silhouettes Canvas provisoires [À CRÉER : plaques]. Alimentations raccordées au jeu pour les armes des marines : tube et pompe (M37A2, fusils ajoutés), barillet (.357), bande (M56), réservoir (M240, lance-flammes de Sevastopol), une roquette par tube (M6B, M83, M5). Seul le M41A garde un chargeur physique (preuve V193) ; aucun autre chargeur n'est inventé. Capacités, cadences et temps : réglages du projet [PROPOSÉ]. Animations natives de pompe, barillet, bande et réservoir, sons propres et plaques : [À CRÉER]. Inventaire complet : `docs/development/ARSENAL_COMPLETION_V188.md`. Aucune arme n'est déclarée fidèle « 1:1 ».

**Arsenal, lot B (spec 014, 23 novembre 2026).** Trente-huit armes de la franchise rejoignent le catalogue (197–235), achetables avec une **plaque provisoire dessinée** [À CRÉER : plaques natives] : le lance-flammes, l'aiguillon électrique et le pistolet du Nostromo (*Alien*, 1979) ; le pistolet de Vasquez (*Aliens*, 1986) ; le Lacrima 99, le Draco Double Burner et six armes d'*Alien Resurrection* (les six dernières connues par leur seul nom de suivi [À VÉRIFIER]) ; l'ES-7 Supernova et le lance-flammes de *Prometheus* ; cinq armes d'*Alien: Covenant* ; cinq armes d'*Alien: Earth* (identifications de la presse spécialisée) ; le M39-U, le XM99A1 et le M42A3 d'*Aliens: Dark Descent* ; six armes d'*Aliens vs Predator* (2010) et cinq d'*Aliens versus Predator 2*. Les identités viennent de sources secondaires citées arme par arme ; dégâts, cadences, temps et la plupart des capacités sont des réglages du projet [PROPOSÉ] (cinq capacités seulement viennent d'une liste de jeu). Le M41A cite désormais « 900 coups/min » comme chiffre documenté de source secondaire, sans changer sa cadence de jeu. Le VP70 reçoit un chargeur physique (accessoire réel Heckler & Koch VP70) ; le M4A3 et le F44AA restent sans preuve propre au modèle. Restent à faire : lance-grenades sous le M41A et combinaison de Ripley (tir secondaire), familles *Fireteam Elite*, *Colonial Marines*, *Alien RPG*, comics et romans. Aucune arme n'est déclarée fidèle « 1:1 ».

### 38.7 Costumes — manques

| Costume | Pour | Statut |
| --- | --- | --- |
| Tenue de colon de Port-Méridien (pluie) | Génériques, Adèle, Tomas | [À CRÉER] |
| Tenue de technicien de station (Asphodèle, Kéos) | Génériques, Oyelaran | [À CRÉER] |
| Blouse et tenue d'isolement médical | Ferro, Szabo, patients | Base `hazmat-suit` [PRÉSENT] ; variantes [À CRÉER] |
| Tenue de détenu (archive 005) | Brennan, détenus | [À CRÉER] |
| Combinaison de raffinerie | Ferreira, opérateurs | [À CRÉER] |
| Tenue Seegson (archive 002) | Okonedo | [À CRÉER] |
| Tenue de colon d'Hadley's Hope (archive 004) | Akintola, colons | [À CRÉER] (adaptation originale, pas une copie) |
| Tenue d'expédition W-Y | Viret, Rask | Base `weyland-yutani-commando` [PRÉSENT] ; variantes [À CRÉER] |
| Tenue de récupérateur Crucible | Grue, récupérateurs | [À CRÉER] |
| Scaphandre HADAL | Nacre-7 | Art modulaire [PRÉSENT] dans le chapitre local Abysse Noir ; arc Nacre-7 proposé distinct |

### 38.8 Props — manques par famille

| Famille | Exemples | Nombre approximatif | Statut |
| --- | --- | --- | --- |
| Biologie de la ruche | Berceaux réfrigérés QZ17 (fermé, ouvert de l'intérieur), œufs-coraux, nids de falaise, cocons humains avec badges, résine murale | 12 | [À CRÉER] / cocons [DETTE] |
| Fret et preuves | Conteneurs scellés (états), écran de manifeste, registres, PDA, plaques d'identité | 10 | Partiel (collectables V68 [CODE]) |
| Colonie | Lits d'infirmerie, poste de triage, table de reconstruction, autel du culte, barricades, panneaux de quartier | 15 | [À CRÉER] |
| Chantiers de reconstruction | 7 chantiers × 3 niveaux | 21 états | [À CRÉER] |
| Station | Noyau de CASSIUS, consoles Seegson, baies hydroponiques, mémorial, quais d'arrimage, barricades d'Echo-8 | 14 | [À CRÉER] |
| Usine de synthétiques | Chaînes de montage, cuves de liquide synthétique, baies de serveurs, têtes et membres | 10 | [À CRÉER] |
| Ingénieurs | Ampoules (intactes, fendues, brisées), siège du pilote, fresques (6 panneaux minimum), caisson de stase, monolithe | 14 | [À CRÉER] |
| Médical et pathogène | Scanner de triage, cuves de laboratoire, lits d'hôpital, chariots, vannes de réservoir | 12 | [À CRÉER] |
| Compagnie | Consoles MIRE, murs mobiles, caméras démontables, caissons d'hypersommeil verts, centre ATARAX, cages d'élevage | 14 | [À CRÉER] |
| Archives MIRE | Compteurs, ascenseur de quartier, caisses de rations, creuset, vannes de raffinerie, capsule de stockage | 12 | [À CRÉER] |
| Tantalus | Voir §41 | 70 | [À CRÉER] |
| Asphodèle et Port-Méridien | Voir §42 et §43 | 90 | [À CRÉER] |

### 38.9 Décors — manques

| Lieu | Zones (3 couches chacune) | Statut |
| --- | --- | --- |
| Cocyte : quais sous la pluie, relais QZ-18 extérieur, route et pont, sortie du complexe | 4 | [À CRÉER] |
| Port-Méridien : quais, salle commune, infirmerie, processeur, mur nord, entrepôt, habitat | 7 (+ vue plan au sol, §43) | [À CRÉER] |
| Asphodèle : anneau, pont de contrôle, laboratoire, ponts inférieurs, serre, relais, mémorial, quartiers | 8 (+ §42) | [À CRÉER] |
| Campagne 1 : Sous-Récif, épave immergée, fossé, canyons, ville troglodyte, aiguille, TR-0, Base Ombelle | 8 | [À CRÉER] / TR-0 [DETTE] |
| Campagne 2 : désert, Sel-Blanc, Kéos (accueil, halls, cuves, serveurs), Murmure | 7 | [À CRÉER] |
| Campagne 3 : camp sur astéroïde, épave en croissant (3 zones), Pangaea (4 biomes), Hiéron (dôme, fresques, chambre) | 11 | [À CRÉER] / Pangaea [DETTE] |
| Campagne 4 : fracture, réservoirs, cavité, *Clémence* (3 zones), Orphée (2 zones) | 8 | [À CRÉER] |
| Campagne 5 : MIRE-9 (rues, observation), *Bonne-Espérance* (baies, passerelle), Khepri (fonderies, centre ATARAX, hangar) | 7 | [À CRÉER] |
| Archives MIRE : 6 lieux × 2 à 4 zones | 18 | [À CRÉER] |
| Missions par planète | ≈ 30 zones, dont une partie réutilise les fonds présents | ≈ 30 | [À CRÉER] |

**Total : environ 108 zones de décor à créer, soit environ 324 couches** (hors vues en plan au sol des §41 à §43).

### 38.10 Animations du joueur et des PNJ — manques

| Animation | Utilisée dans | Statut |
| --- | --- | --- |
| Gravité faible / apesanteur | Tyndare, Renaissance, Asphodèle | [À CRÉER] |
| Nage en scaphandre | Nacre-7 | [DETTE] ; nage simple [CODE] |
| Brancardage à deux | Colonie, *Clémence* | [À CRÉER] |
| Portage d'un blessé, d'une tête synthétique | Plusieurs | [CODE] (`carry`) ; poses dédiées [À CRÉER] |
| Utilisation de la perche de capture | Interlude, campagnes 1 et 3 | [À CRÉER] (planche d'outil présente) |
| Manœuvre de vanne, de levier lourd | Campagne 4, archive 006 | [À CRÉER] |
| Test biologique (scanner tenu) | Campagnes 4, C3 | [À CRÉER] (planche `pathogen-scanner` présente) |
| Chirurgie d'urgence (retrait d'embryon) | Campagne 5 | [À CRÉER] |
| Marche contre le vent | Archive 004 | [À CRÉER] |
| Poses assises et au poste (équipage) | Quêtes du Tantalus | [À CRÉER] |
| Gestes de dialogue (pointer, désigner une carte) | Cinématiques | [À CRÉER] |
| Civils escortés : suivre, s'arrêter, paniquer | Colonie, MIRE | [À CRÉER] |
| Déplacement en plan au sol (8 directions) | Vues 2.5D (§40) | [À CRÉER] pour chaque personnage utilisé en 2.5D |

### 38.11 VFX — manques

| VFX | Statut |
| --- | --- |
| Pluie (légère, battante), pluie noire, neige, tempête de sable, vent | [À CRÉER] |
| Liquide noir (écoulement, flaque, contamination), spores en suspension, éruptions cutanées | [À CRÉER] |
| Liquide synthétique blanc (impact, flaque) | [À CRÉER] |
| Bulles, particules sous-marines, faisceau de lampe sous l'eau, torpilles | [À CRÉER] |
| Étincelles de soudure, métal en fusion, coulée | [À CRÉER] |
| Fils organiques lumineux, ondes du Chœur, pulsations de la ruche-monde | [À CRÉER] |
| Carte stellaire projetée, glyphes qui s'allument | [À CRÉER] |
| Balayage de scanner corporel, balayage de caméra | [À CRÉER] |
| Bruit vidéo de caméra casque, écran `MODÈLE INTERROMPU`, filtre de modèle MIRE | [À CRÉER] |
| Explosion silencieuse dans l'espace, effondrement de terrain, poussière | [À CRÉER] |
| Fusées éclairantes, projecteurs | [À CRÉER] |
| Feu, vapeur, eau, radiation, brèche de vide, givre, obscurité, arc électrique, acide au sol | [PRÉSENT] |

### 38.12 Gameplay et systèmes — manques

| Système | Statut |
| --- | --- |
| État de campagne `storyCampaign` (drapeaux `story-*`, dossier QZ17) | [À CRÉER] |
| Gestion de colonie (chantiers, population, paliers, événements) | [À CRÉER] |
| Second hub Asphodèle (navigation, modules, PNJ) | [À CRÉER] |
| Vue plan au sol 2.5D (§40) | [À CRÉER] |
| Voyage galactique avec temps et carburant | Carte présente ; temps et coût [À CRÉER] |
| Archives MIRE en sauvegarde isolée, protocoles | Base [CODE] (Mire Archive 001) ; généralisation [À CRÉER] |
| Gravité faible, apesanteur | [À CRÉER] |
| Accès aux systèmes avec indice de confiance | [À CRÉER] |
| Contamination, traitement, transformation d'un Marine | [À CRÉER] |
| Test biologique avec incertitude | [À CRÉER] |
| Capture d'organisme vivant | [À CRÉER] |
| Commande d'arrêt synthétique | [À CRÉER] |
| Oxygène limité en plongée | [À CRÉER] |
| Faux signaux du détecteur de mouvement | [À CRÉER] (détecteur [CODE]) |
| Manifeste fret / passagers, largage de remorque | [À CRÉER] |
| Face-à-face sans tir, audience à choix de pièces | [À CRÉER] |
| Murs mobiles, retrait d'embryon | [À CRÉER] |
| Choix CASSIUS, isolement des synthétiques du bord | [À CRÉER] |
| Crises à bord (xénomorphe, synthétique, pathogène) | [CODE] (`world-crisis-core.js`) |
| Soudure, routage d'énergie, caméras, acide | [CODE] |

### 38.13 Audio — manques

Le dépôt ne contient que 3 musiques et 5 bruitages (compositions originales, `LICENSE_NOTICE.md`).

| Famille | Contenu à créer | Nombre approximatif |
| --- | --- | --- |
| Musiques | Thème principal, Cocyte, Port-Méridien, Asphodèle, une par campagne annexe, archives MIRE, combats de boss, cinématiques de fin | ≈ 18 pistes |
| Ambiances | Une par pièce du Tantalus (35), modules d'Asphodèle, quartiers de la colonie, biomes des campagnes | ≈ 70 boucles |
| Créatures | Cris et déplacements par lignée et par boss, Ingénieur, formes du Pathogène | ≈ 60 sons |
| Synthétiques | Voix synthétique, pas, impacts, arrêt | ≈ 15 sons |
| Véhicules | M577, Cheyenne, MANTA, chargeurs, caravane, navettes | ≈ 25 sons |
| Armes et outils | Compléments des armes et outils utilisés par les scénarios | ≈ 40 sons |
| Interface | Dossier, chantiers, CASSIUS, carte galactique, MIRE | ≈ 20 sons |
| Environnement | Pluie, vent, eau, vapeur, alarmes, portes, sas, ascenseurs | ≈ 40 sons |

### 38.14 Interface — manques

| Écran | Statut |
| --- | --- |
| Carte galactique avec temps et carburant | Image présente (`galaxy-navigation-v115.png`) ; fonctions [À CRÉER] |
| Table de reconstruction de Port-Méridien | [À CRÉER] |
| Vue de gestion de la colonie (plan au sol, §43) | [À CRÉER] |
| Interface de CASSIUS | [À CRÉER] |
| Tableau du dossier QZ17 | [À CRÉER] |
| Manifeste fret / passagers | [À CRÉER] |
| Choix de protocole MIRE, indice de fidélité | [À CRÉER] |
| Jauge de contamination, résultat de test biologique | [À CRÉER] |
| Audience de l'ICC | [À CRÉER] |
| Isolement des synthétiques du bord | [À CRÉER] |
| Portraits de dialogue des nouveaux personnages | [À CRÉER] (système [CODE], `npc-dialogue-portraits-v168.js`) |

### 38.15 Cinématiques — manques

| Groupe | Nombre de cinématiques | Plans approximatifs |
| --- | --- | --- |
| Campagne principale | 18 | ≈ 60 |
| Campagnes annexes | 28 | ≈ 90 |
| Archives MIRE | 6 coupures + 6 introductions | ≈ 24 |
| Missions par planète | Introductions de chaînes (15) | ≈ 30 |
| **Total** | **≈ 73** | **≈ 200 plans** |


---

# PARTIE VI — Missions sur les lieux originaux de la bible

## 39. Lieux inventés — missions après campagne — [PROPOSÉ]

Ces lieux ont été créés par cette bible (§1.4, §14 à §18). Chacun reçoit des missions jouables **après** la campagne qui l'introduit. Leur contenu dépend de l'état du lieu à la fin de cette campagne : l'état est indiqué pour chaque mission.

Types : **A** = annexe écrite, **L** = locale rejouable, **D** = défi (difficulté élevée, récompense unique).

### 39.1 Cocyte

| ID | Lieu | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `orig-cocyte-1` | Relais QZ-19 | A | **Le troisième relais** | Un relais QZ que personne n'a visité. Sa mémoire contient d'autres priorités de fret, sur d'autres dates. | Après l'Acte II | `recover black-box data` | Le système, pas l'incident. |
| `orig-cocyte-2` | Relais QZ-21, en altitude | L | **Givre sur l'antenne** | Dégager une antenne gelée sous le vent, avec des contacts dans les gaines techniques. | Après l'Acte II | `restore atmospheric processing` | Infrastructure isolée. |
| `orig-cocyte-3` | Le dépôt | D | **Le dépôt, après** | Redescendre au dépôt après l'Acte V pour sceller définitivement les galeries. Difficulté selon la fin. | Après l'Acte V | `seal the hive` | Nid nourri par la compagnie. |
| `orig-cocyte-4` | Complexe C-12 | A | **Les ouvriers de C-12** | Retrouver les derniers ouvriers restés dans les étages du complexe. | Après l'Acte III | `rescue survivors` | Survivants oubliés. |
| `orig-cocyte-5` | Fermes éloignées | L | **La tournée des fermes** | Ravitailler trois fermes isolées et réparer leurs balises. | Colonie au palier *Rétablie* | `escort a colony convoy` | Colonie dispersée. |
| `orig-cocyte-6` | Corridor du convoi | L | **La route rouverte** | Escorter le premier convoi civil sur le corridor. | Après l'Acte V | `escort a colony convoy` | APC, route. |

### 39.2 Station Asphodèle

| ID | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- |
| `orig-asphodele-1` | A | **L'anneau qui grince** | Une section de l'anneau extérieur se désaccouple. Évacuer les marchands Crucible et sceller la section. | Hub actif | `escape the quarantine` | Panne structurelle. |
| `orig-asphodele-2` | L | **Inspection de nuit** | Ronde dans les conduits des ponts inférieurs pendant le cycle de nuit. | Hub actif | `navigate the vent network` | Ce qui reste caché dans une station. |
| `orig-asphodele-3` | A | **CASSIUS se souvient** | Si CASSIUS a été réécrit : il retrouve une sauvegarde ancienne de ses priorités et commence à les réappliquer. | CASSIUS réécrit | `destroy a neuro-link relay` | Système qui retourne à ses ordres. |
| `orig-asphodele-4` | D | **Accès administrateur** | Si BISHOP-9 a gardé le code compagnie : une équipe W-Y tente de reprendre la station. | Code non remis | `hold the extraction zone` | La compagnie reprend ses actifs. |

### 39.3 Campagne 1 — Nacre-7, Echo Basin, TR-0

| ID | Lieu | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `orig-recif-1` | Sous-Récif | A | **Rebâtir Sous-Récif** | Aider la colonie aquacole à relancer ses bassins ; un œuf-corail oublié éclot au mauvais moment. | Après l'arc 1 | `restore atmospheric processing` | Rescapés qui reconstruisent. |
| `orig-recif-2` | Le fossé | D | **La seconde reine** | Un relevé du MANTA montre une deuxième chambre royale au fond du fossé. | Après la campagne 1 | `track an apex specimen` | Une ruche peut renaître. |
| `orig-gorge-1` | Gorge-Seize | A | **Les puits rouverts** | Rouvrir les puits de la ville troglodyte un par un. | Après l'arc 2 | `seal the hive` | Lignée fouisseuse. |
| `orig-gorge-2` | Aiguille rocheuse | L | **Les nids de printemps** | Détruire les nouveaux nids de falaise depuis le Cheyenne. | Après l'arc 2 | `purge a reactor nest` | Lignée aérienne. |
| `orig-tr0-1` | TR-0 | D | **La peau morte** | Retourner sur TR-0 effondrée pour récupérer les serveurs de Base Ombelle. Le sol cède par endroits. | Après la campagne 1 | `recover black-box data` | Monde-ruche mort. |
| `orig-ombelle-1` | Base Ombelle | A | **Les registres d'expédition** | Retrouver la liste complète des mondes où Ombelle a expédié des œufs. Débloque des alertes sur la carte galactique. | Après la campagne 1 | `recover black-box data` | La compagnie a semé ailleurs. |

### 39.4 Campagne 2 — Sable Meridian, Kéos, Murmure

| ID | Lieu | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `orig-selblanc-1` | Sel-Blanc | L | **Les caravanes repartent** | Escorter la première caravane avec des synthétiques réparés. | Après l'arc 1 | `escort a colony convoy` | Confiance retrouvée envers les synthétiques. |
| `orig-keos-1` | Kéos | A | **La chaîne redémarre** | Seegson veut relancer la production. Inspecter les nouveaux synthétiques avant leur départ. | Après l'arc 2 | `recover a synthetic` | Les compagnies recommencent. |
| `orig-keos-2` | Kéos | D | **Les cuves oubliées** | Si les cuves ont été gardées : des modèles Hyperdyne non activés se réveillent seuls. | Cuves gardées | `escape the quarantine` | Synthétiques comme marchandise. |
| `orig-murmure-1` | Murmure | A | **La quarantaine du Chœur** | Selon la fin : vérifier qu'Éloïse respecte l'accord, ou détruire les derniers synthétiques reliés. | Après la campagne 2 | `seal the hive` | Synthétique-ruche. |
| `orig-murmure-2` | Murmure | L | **Les balises de quarantaine** | Remplacer les balises qui interdisent l'atterrissage. | Après la campagne 2 | `restore atmospheric processing` | Monde interdit. |

### 39.5 Campagne 3 — Tyndare, Pangaea, Hiéron

| ID | Lieu | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `orig-tyndare-1` | Dérive de Tyndare | A | **Les pilleurs** | D'autres récupérateurs veulent démonter l'épave. Les en empêcher avant qu'ils ne brisent une baie d'ampoules. | Épave non détruite | `board a drifting vessel` | Convoitise de la technologie des Ingénieurs. |
| `orig-tyndare-2` | Dérive de Tyndare | L | **Débris en croissant** | Récupérer des fragments de coque dans la dérive. | Après l'arc 1 | `recover black-box data` | Matériaux non humains. |
| `orig-pangaea-1` | Pangaea | A | **Le troupeau sauvé** | Suivre le troupeau sain guidé pendant la campagne ; vérifier qu'il n'a pas été infecté. | `builders-a-troupeau` réussi | `track an apex specimen` | Préserver un écosystème. |
| `orig-pangaea-2` | Pangaea | D | **Le dernier nid** | Un nid Sauria a survécu dans les marais. | Après la campagne 3 | `purge a reactor nest` | Infection persistante. |
| `orig-hieron-1` | Hiéron | A | **Le dôme vide** | Selon la fin : vérifier la destruction de la chambre, ou escorter l'équipe de l'Administration qui l'étudie. | Après la campagne 3 | `hold the extraction zone` | Le savoir et son prix. |

### 39.6 Campagne 4 — Pallas Rift, *Clémence*, Orphée

| ID | Lieu | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `orig-clemence-1` | *Clémence* | A | **L'hôpital rouvert** | Si le *Clémence* a été sauvé, il devient un vaisseau-hôpital du Reach. Escorter son premier convoi de patients. | *Clémence* stabilisé | `escort a colony convoy` | Soigner malgré la quarantaine. |
| `orig-clemence-2` | *Clémence* | L | **Ronde d'isolement** | Vérifier les cellules d'isolement pendant un transfert. | *Clémence* stabilisé | `escape the quarantine` | Patients sous surveillance. |
| `orig-pallas-1` | Pallas Rift | A | **Les survivants de la fracture** | Selon la fin : retrouver des survivants restés dans les galeries, ou fouiller les ruines stérilisées. | Après la campagne 4 | `rescue survivors` | Conséquence de la décision finale. |
| `orig-orphee-1` | Station Orphée | D | **Le laboratoire du niveau zéro, scellé** | Une forme avancée a survécu dans le laboratoire scellé. | Après la campagne 4 | `track an apex specimen` | Laboratoire de la compagnie. |

### 39.7 Campagne 5 — MIRE-9, *Bonne-Espérance*, Khepri Forge

| ID | Lieu | Type | Titre | Résumé | État requis | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `orig-mire9-1` | MIRE-9 | A | **Les colons restés** | Des colons refusent de quitter le labyrinthe. Les convaincre, ou les protéger sur place. | Après l'arc 1 | `defend the colony` | Victimes qui ne veulent pas partir. |
| `orig-esperance-1` | *Bonne-Espérance* | A | **Les dormeurs installés** | Les colons réveillés s'installent à Port-Méridien ou à Asphodèle. Escorter le premier groupe. | Cap changé vers Cocyte | `escort a colony convoy` | Nouveaux colons. |
| `orig-esperance-2` | *Bonne-Espérance* | D | **Le caisson oublié** | Un caisson vert n'a pas été vérifié. | Après l'arc 2 | `escape the quarantine` | Gestation. |
| `orig-khepri-1` | Khepri Forge | A | **Ce que la forge produisait** | Selon la fin : faire l'inventaire pour l'ICC, ou saboter ce qui reste. | Après la campagne 5 | `recover black-box data` | Programme d'armement. |
| `orig-khepri-2` | Khepri Forge | D | **Le second Titan** | Une deuxième cuve de croissance est encore active. | Après la campagne 5 | `track an apex specimen` | Organisme-arme. |

**Total Partie VI : 35 missions** (17 annexes, 9 locales, 9 défis).


---

# PARTIE VII — Vues et organisation des hubs : Tantalus, Asphodèle, Port-Méridien

## 40. Trois vues — [PROPOSÉ]

### 40.1 Ce qui existe aujourd'hui

- **Tantalus :** 35 pièces (`HUB_ROOM_PARALLAX_V134`). **34 sont en vue latérale 2D** ; **une seule, `maintenance-spine`, est en « 2.5d »**. Dans le code, ce « 2.5d » est une **présentation** : profondeur de parallaxe et coupe transversale (`transverse-depth-cutaway`). Le jeu reste sur un plan 2D (`gameplayPlane: '2d'`), avec le sol à `y=624` et des acteurs d'environ 92 à 96,5 pixels de haut.
- **Yautja : la Longue Chasse (homeworld) :** caméra orthographique à 35° sur un plan au sol (6 300 × 5 300 unités), projection `(x, y × sin 35° − z)`. Les collisions viennent de l'**empreinte au sol** et du **pivot avant** des objets, jamais de la hauteur peinte. 43 bâtiments ont un intérieur. Source : `docs/V64-HOMEWORLD-GEOMETRIE.md` du dépôt `yautja-la-longue-chasse`.
- ***Alien vs. Predator* (Capcom, arcade, 1994)** : défilement horizontal, sol en bande oblique où les personnages se déplacent aussi en profondeur. Le projet référence déjà ce jeu pour des castes (« AVP Arcade » dans le catalogue).

### 40.2 Les trois vues proposées

| Vue | Principe | Mouvement | Utilisation |
| --- | --- | --- | --- |
| **V1 — Latérale 2D** (existante) | Coupe de vaisseau, ponts superposés, échelles, conduits | Gauche-droite, sauts, échelles | Couloirs, pièces étroites, pièces techniques, missions en intérieur vertical |
| **V2 — Couloir de profondeur** (style arcade) | Vue latérale avec un **sol en bande oblique** de 160 à 240 pixels de profondeur | Gauche-droite **et** avant-arrière dans la bande | Grandes pièces ouvertes du Tantalus, anneau d'Asphodèle, rues de la colonie en mission, combats de foule |
| **V3 — Plan au sol à 35°** (style homeworld) | Caméra orthographique à 35° sur un plan au sol | 8 directions sur toute la carte | Vue de gestion de Port-Méridien, plan général d'Asphodèle |

### 40.3 Règles communes aux vues V2 et V3

Reprises du contrat du homeworld de Yautja, adaptées à ce moteur Canvas 2D :

1. **Coordonnées au sol.** La simulation travaille en `(x, y)` sur le sol ; l'affichage projette (`y × sin 35° − z` en V3 ; bande oblique à facteur fixe en V2).
2. **Collision par empreinte.** L'empreinte d'un objet va de `y − profondeur` à son pivot avant `y`. Elle ne se déduit jamais de la hauteur peinte.
3. **Tri par profondeur.** Les acteurs et objets sont dessinés dans l'ordre de leur pivot avant.
4. **Portes.** Une porte a un rectangle de passage inscrit dans son ouverture visible, sans les jambages. On interagit depuis le sol praticable, devant la porte.
5. **Transitions.** Passer de V1 à V2 ou V3 se fait par une porte : le point d'arrivée de chaque côté est fixé, comme les points d'arrivée actuels du hub.
6. **Échelle.** Garder l'échelle actuelle des acteurs du hub (environ 92 à 96,5 pixels pour un humain). Le homeworld utilise 100 unités pour un Yautja de 2,3 m ; il n'est pas utile de la reprendre telle quelle.
7. **Sauvegarde.** Les positions en V2 ou V3 ne sont pas indispensables dans la sauvegarde ; si elles le sont, une donnée invalide ne doit pas renvoyer le joueur ailleurs que dans la pièce courante.

### 40.4 Travail moteur nécessaire

| Tâche | Statut |
| --- | --- |
| Mode de pièce `ground-plane` (V2, V3) distinct du « 2.5d » de présentation actuel | [À CRÉER] |
| Intégrateur de déplacement 8 directions avec collisions par empreinte | [À CRÉER] |
| Tri des sprites par pivot avant | [À CRÉER] |
| Routines des PNJ sur grille au sol (le système actuel suit le sol 2D) | [À CRÉER] |
| Caméra V3 avec défilement en deux axes | [À CRÉER] |
| Transitions de porte V1 ↔ V2/V3 | [À CRÉER] |
| Planches 8 directions pour le joueur et chaque PNJ présent en V2/V3 | [À CRÉER] |
| Tests : empreintes sans chevauchement, chemins vers chaque porte et poste, aller-retour, reprise (sur le modèle de `audit-homeworld-geometry-v64.mjs` du dépôt Yautja) | [À CRÉER] |

---

## 41. Tantalus — réorganisation pièce par pièce

### 41.1 Principes

- **Ne passent en V2 que les grandes pièces ouvertes**, où se déplacer en profondeur sert le jeu : se rassembler, circuler entre des véhicules, ranger du fret, accueillir des civils.
- **Les pièces à enveloppe protégée** (`preserve-native-envelope` : passerelle, hangar dropship, pas de tir, cockpit) restent en V1 tant que le propriétaire ne décide pas de rouvrir leur géométrie.
- **Les 200 installations décoratives existantes** (lots V168 et V177, 52 types) sont conservées ; les ajouts ci-dessous les complètent.
- **Chaque pièce reçoit des éléments vivants** : écrans animés, lumières, fumées, PNJ au travail. Le Tantalus est un foyer (§1.3).

### 41.2 Pièces par secteur

**Secteur commandement**

| Pièce | Vue actuelle | Vue proposée | Existant (V168+V177) | Props à ajouter | Effets et animations à ajouter | Interactions nouvelles |
| --- | --- | --- | --- | --- | --- | --- |
| Passerelle `bridge` | V1 | V1 (enveloppe protégée) | 6 | Table de navigation, carte galactique murale, fauteuil du commandant, voyant de quarantaine | Étoiles qui défilent selon le voyage, écrans de trajectoire | Carte galactique avec temps et carburant |
| Briefing `briefing` | V1 | **V2** | 5 | Table holographique centrale, sièges en arc, tableau du dossier QZ17, projecteur | Carte holographique animée, poussière dans le faisceau | Tableau du dossier QZ17 ; briefings des campagnes |
| Info. de combat `combat-information` | V1 | V1 | 6 | Pupitre de liaison, écrans de caméras casque, casques suspendus | Bruit radio, oscilloscopes | Relecture des enregistrements (Echo-8, Kappa) |
| Baie cryo `cryo-bay` | V1 | V1 | 6 | Rangée de caissons ouverts et fermés, casier `ECHO-8`, chariot de réveil | Givre, buée d'ouverture, voyants de caisson | Casier d'Echo-8 ; nouvelles recrues sortent d'hypersommeil |
| CCTV `cctv` | V1 | V1 | 6 | Mur d'écrans, magnétophones à bandes | Écrans qui changent de caméra, bandes qui tournent | Caméras pendant les crises à bord |
| Archives MIRE `mire-archives` | V1 | V1 | 6 | Consoles MIRE, fauteuil d'immersion, casiers de preuves | Filtre « modèle », lumière froide | Lancement des archives MIRE (§26) |
| Baie synthétique `synthetic-bay` | V1 | V1 | 6 | Table de réparation, bras robotisé, bac de liquide synthétique, interface d'isolement des relais | Liquide blanc, étincelles | Isolement des synthétiques (campagne 2) |
| Durandal `durandal` | V1 | V1 | 5 | Baies de calcul, refroidissement | Ventilateurs, voyants de calcul | — |
| Cockpit `flight-control-cockpit` | V1 | V1 (enveloppe protégée) | 4 | Sièges de pilotes, manettes | Vue extérieure animée (espace, planète, station) | Arrimages et atterrissages en cinématique |

**Secteur habitat**

| Pièce | Vue actuelle | Vue proposée | Existant | Props à ajouter | Effets et animations | Interactions nouvelles |
| --- | --- | --- | --- | --- | --- | --- |
| Quartiers `crew-quarters` | V1 | V1 | 6 | Couchettes personnalisées (photos, objets), casiers ouverts | Lampes de lecture, rideaux | Objets personnels qui changent selon les quêtes |
| Mess `mess` | V1 | **V2** | 6 | Tables longues, bancs, plateaux, distributeur, tableau d'affichage | Vapeur des plats, PNJ assis qui mangent | « Repas de relève » ; scènes collectives |
| Infirmerie `medical` | V1 | V1 | 6 | Lits, scanner corporel, chariot de soins | Balayage du scanner, moniteurs cardiaques | Contrôle biologique au retour (CIN-51) ; traitement d'exposition |
| Morgue `morgue` | V1 | V1 | 6 | Tiroirs réfrigérés, table d'autopsie, registre des pertes | Givre, lumière blafarde | Registre de Noor (quête) |
| Refuge personnel `personal-refuge` | V1 | V1 | 4 | Bureau, souvenirs des campagnes (trophées non létaux) | Lumière chaude | Souvenirs ajoutés après chaque campagne |
| Cuisine `galley-service` | V1 | V1 | 6 | Fourneaux, réserves | Vapeur, ustensiles qui s'entrechoquent | — |
| Sanitaires `sanitary-bay` | V1 | V1 | 6 | Douches, miroirs | Eau, buée | — |
| Soins animaux `animal-care` | V1 | V1 | 6 | Enclos, nourriture | Animaux du bord en boucle (module existant `ship-animal-habitat-v87.js`) | — |
| Comptoir civil `frontier-civil-counter` | V1 | **V2** | 4 | Comptoir, file d'attente, bancs, tableau des colonies | Civils qui attendent, écran des arrivées | Accueil des réfugiés de Port-Méridien, MIRE-9, *Bonne-Espérance* |

**Secteur industriel**

| Pièce | Vue actuelle | Vue proposée | Existant | Props à ajouter | Effets et animations | Interactions nouvelles |
| --- | --- | --- | --- | --- | --- | --- |
| Laboratoire `science-lab` | V1 | V1 | 6 | Cuves d'échantillons, microscope, tableau des lignées | Bulles dans les cuves | Arbre des lignées (campagne 1), analyses |
| Quarantaine `quarantine` | V1 | V1 | 6 | Cellule vitrée, perche de capture au râtelier, conteneur QZ17 ouvert (après l'interlude) | Alarme rouge, ventilation forcée | Créature capturée visible si conservée |
| Armurerie `armory` | V1 | V1 | 6 | Râteliers par campagne (armes récupérées), établi de modification | Lumière de sécurité | Armes de récompense des campagnes |
| Atelier `workshop` | V1 | V1 | 6 | Établi, pièces de chargeur, tête synthétique sur un étau (campagne 2) | Étincelles de meuleuse | Fabrication des récompenses |
| Baie véhicules `vehicle-bay` | V1 | **V2** | 6 | M577 garé, pont élévateur, pièces de blindage, chargeur P-5000 | Fumée d'échappement, gyrophares | Réparation du M577 (quête de Cal) |
| Logistique `logistics` | V1 | **V2** | 8 | Rayonnages de fret, palettes, chariot élévateur, caisses scellées | Chariot qui circule, scanner de caisse | Gestion des ressources, fret de Port-Méridien |
| Bioforge `bioforge` | V1 | V1 (laboratoire de confinement, spec 013) | 6 salles → 8 zones | Stockage froid, salle de contrôle, sas biologique, admission, hall des cuves (2 cuves de stase de la file), cellule de confinement et galerie d'observation (profondeur), baie d'analyse et incinérateur, sas de sortie — **primitives Canvas** derrière des emplacements nommés `bioforge-lab-*`, PNG V80 conservés | Liquides et bulles des cuves (VFX V188 `bubble`), brume de décontamination, givre, braises, cycle de purge animé | Console → terminal ; stockage froid, analyse, incinérateur en lecture ; décontamination de sortie obligatoire puis retour au hub à pied. Accès narratif (quête « Ce qu'on garde en vie ») **non codé** |
| Pas de tir `proving-ground` | V1 | V1 (enveloppe protégée) | 6 | Cibles mobiles, tableau des scores | Impacts sur cibles | Temps de Velez (quête) |

**Secteur ingénierie**

| Pièce | Vue actuelle | Vue proposée | Existant | Props à ajouter | Effets et animations | Interactions nouvelles |
| --- | --- | --- | --- | --- | --- | --- |
| Sas d'arrivée `arrival-airlock` | V1 | V1 | 6 | Douche de décontamination, râtelier de dépôt d'armes, scanner | Brouillard de décontamination | Dépôt des armes avant le scanner (Acte IV) |
| Hangar dropship `dropship-hangar` | V1 | **V2 (validé : enveloppe rouverte)** | 5 | Cheyenne posé, chariot de munitions, rampe, pont roulant, zone de chargement | Moteurs qui chauffent, vapeur, gyrophares | Départs en mission ; préparation de l'équipe en profondeur |
| Réacteur `reactor` | V1 | V1 | 6 | Cœur du réacteur visible, tableau d'énergie | Lueur pulsée, chaleur | Service d'énergie (quête de Kwan) |
| Support-vie `life-support` | V1 | V1 | 6 | Grands filtres, ventilateurs | Air qui circule, filtres qui vibrent | Améliorations de filtres (campagne 4) |
| Capteurs `sensor-array` | V1 | V1 | 6 | Antennes, écrans d'écoute | Spectres radio | « Écoute de nuit » |
| Capsules de sauvetage `escape-pods` | V1 | V1 | 6 | Capsules (`narcissus-lifeboat` comme base) | Voyants d'éjection | — |
| Salle des machines `engine-room` | V1 | V1 | 6 | Arbres de transmission, pistons | Vibrations, vapeur | Vibrations pendant les voyages |
| Recyclage d'eau `water-recycling` | V1 | V1 | 5 | Cuves, pompes | Eau qui coule | — |
| Colonne de maintenance `maintenance-spine` | « 2.5d » de présentation | **V2 jouable** | 4 | Gaines, chariots de maintenance, panneaux d'accès | Câbles qui pendent, lampes qui oscillent | Couloir de profondeur pour les traques à bord (interlude, crises) |

### 41.3 Bilan du Tantalus

| Élément | Nombre |
| --- | --- |
| Pièces passant en V2 | 7 (briefing, mess, comptoir civil, baie véhicules, logistique, colonne de maintenance, hangar dropship) |
| Pièces restant en V1 | 28, dont 3 à enveloppe protégée (passerelle, cockpit, pas de tir) |
| Props à ajouter | ≈ 110 (3 en moyenne par pièce), plus ≈ 35 états liés aux campagnes |
| Effets et animations d'ambiance | ≈ 70 |
| Interactions nouvelles | ≈ 25 |
| Fonds V2 à refaire (3 couches + bande de sol) | 7 pièces |

---

## 42. Station Asphodèle — second hub

### 42.1 Organisation

La station tourne sur elle-même : son **anneau extérieur** (quais, marché) donne sur un **moyeu** (pont de contrôle, relais) relié par des rayons aux **ponts inférieurs** (laboratoire, quartiers). La station est un **hub explorable complet** (décision §45.1) : l'anneau, les rayons et le moyeu se parcourent à pied en **V3** (vue à 35°), et chaque module s'ouvre par une porte en V1 ou V2. Aucun module n'est atteint par un simple menu.

### 42.2 Modules

| Module | Vue | Props | Effets et animations | PNJ | Fonction en jeu | Débloqué par |
| --- | --- | --- | --- | --- | --- | --- |
| **Plan de la station** | V3 | Anneau, rayons, moyeu, vaisseaux amarrés | Rotation lente, navettes qui arrivent | Passants, équipes de maintenance | Espace parcouru à pied entre les modules | S4 |
| **Quais d'arrimage** | V2 | Passerelles, bras d'arrimage, caisses, vaisseau de Grue | Gyrophares, vapeur de dépressurisation | Dockers, récupérateurs | Navettes vers la colonie et le Tantalus | S1 |
| **Marché de l'anneau** | V2 | Étals Crucible, pièces détachées, comptoir | Enseignes lumineuses, fumée | Marchands Crucible | Commerce de pièces et d'armes | *Le pacte de l'anneau* |
| **Pont de contrôle** | V1 | Consoles Seegson, noyau de CASSIUS, carte du réseau QZ | Écrans du réseau, voix de CASSIUS | Techniciens | Relais à ouvrir, état de Port-Méridien | S4 |
| **Salle des relais** | V1 | Baies de transmission, file des messages retenus | Messages qui défilent | Opérateur | Messages libérés, missions sur tout Cocyte, envoi du dossier | *Relais en dérive* ×3 |
| **Laboratoire de transit** | V1 | Paillasses, berceaux QZ17 vides, archives | Lumière froide | Inez (visites) | Recherche avancée | S3 |
| **Serre** | V2 | Baies hydroponiques, bacs, arrosage | Brume d'arrosage, lumière de croissance | Jardiniers | Nourriture pour la colonie | *La serre* |
| **Mémorial** | V1 | Plaques, noms, casier de Kessler | Bougies électriques | Visiteurs | Noms des morts | *Les journaux de l'équipage* |
| **Quartiers** | V1 | Cabines superposées | Lumières individuelles | Recrues, colons | Installation des recrues | Colonie *Autonome* |
| **Infirmerie de station** | V1 | Lits, scanner | Moniteurs | Médecin de station | Soins, quarantaine de passage | S4 |
| **Ponts inférieurs** | V1 | Barricades d'Echo-8, conduits | Lampes de secours | — | Missions de nuit (§39.2) | S3 |
| **Hangar de réparation** | V2 | Vaisseau en réparation, grue | Soudure, étincelles | Mécaniciens | Améliorations du Cheyenne | S4 |

### 42.3 Bilan d'Asphodèle

| Élément | Nombre |
| --- | --- |
| Modules | 12 (1 en V3, 4 en V2, 7 en V1) |
| Décors à créer | 12 modules × 3 couches + plan V3 |
| Props | ≈ 50 |
| Effets et animations | ≈ 30 |
| PNJ génériques | Dockers, marchands, techniciens, jardiniers, mécaniciens, médecin (6 silhouettes) |
| Systèmes | Plan V3, commerce, relais, rotation de la station (visuelle) |

### 42.4 Première version — [PARTIEL] V188 (spec 007, 2026-11-15)

Construits : plan (anneau + rayon A, en V2, sans vue V3, Q23 A), quais (V2), pont de contrôle, salle des relais, laboratoire de transit, mémorial, serre, marché (V1) : 8 modules sur 12, en placeholders Canvas. Scellés, visibles avec leur raison : quartiers, infirmerie de station, ponts inférieurs, hangar de réparation. PNJ : Grue seule (silhouette) ; dockers, marchands, techniciens, jardiniers, mécaniciens et médecin restent à faire. Commerce (Q30) et rotation visuelle de l'anneau non faits. Détail en §7.6.

**Suite du 2026-11-16 (§7.7)** : les 12 modules sont atteignables à pied — quartiers (*Autonome*), infirmerie (S4), ponts inférieurs (S3) et hangar de réparation (V2, après une remise en pression) rouverts avec leurs interactions. Commerce Crucible ouvert (Q30 A). PNJ : dockers, marchands et techniciens (foules, primitives) ; jardiniers, mécaniciens nommés et médecin restent à faire. Rotation visuelle de l'anneau et plan V3 non faits.

---

## 43. Port-Méridien — la colonie à gérer

### 43.1 Organisation

- **Vue de gestion en V3** : plan au sol à 35° de toute la colonie, sur le modèle de la cité du homeworld de Yautja. Le joueur s'y déplace à pied entre les quartiers, voit les chantiers évoluer, parle aux habitants.
- **Intérieurs en V1** : infirmerie, salle commune, processeur, entrepôt, abri. Ils servent aussi de niveaux de mission.
- **Missions de défense en V2** : rues et murs en couloir de profondeur (C1, C5, contrats locaux).

### 43.2 Quartiers et bâtiments

| Quartier | Bâtiments | Chantier lié (§6.3) | États visuels | Intérieur |
| --- | --- | --- | --- | --- |
| **Quais** | Quai des vivants, entrepôt du quai, plate-forme d'atterrissage | Quais | 3 niveaux + état endommagé | Entrepôt (V1) |
| **Centre** | Salle commune, bureau de la doyenne, panneau des annonces | — | Normal, nuit, alerte | Salle commune (V1) |
| **Santé** | Infirmerie de Lucia Ferro, poste de triage | Infirmerie | 3 niveaux | Infirmerie (V1) |
| **Air et eau** | Processeur atmosphérique, réservoirs | Processeur atmosphérique | 3 niveaux + panne | Processeur (V1) |
| **Énergie** | Générateurs, sous-station | Énergie | 3 niveaux | — |
| **Communications** | Balise, relais indépendant | Communications | 3 niveaux | — |
| **Habitat** | Dortoirs, quartiers familiaux, école | Habitat | 3 niveaux | Abri (V1) |
| **Défense** | Mur nord, sas, tourelles | Murs et sas | 3 niveaux + brèches | — |
| **Serres** (palier *Autonome*) | Serres pressurisées | Processeur, niveau 2 | 2 états | — |

### 43.3 Vie de la colonie

| Élément | Contenu proposé |
| --- | --- |
| **Cycle jour/nuit** | La nuit, éclairage réduit, rondes, risques d'intrusion plus élevés |
| **Routines des habitants** | Travail aux chantiers, repas à la salle commune, école, rondes ; 12 habitants nommés à terme (sur le modèle des 12 habitants du homeworld) |
| **Événements** | Panne de processeur, arrivée de réfugiés, intrusion dans les sas, tempête, visite d'un agent de la compagnie, fête de fin de chantier |
| **Indicateurs** | Population, moral, air, eau, énergie, sécurité, stabilité et infestation (valeurs existantes du monde) |
| **Effets des campagnes** | Réfugiés de MIRE-9 et du *Bonne-Espérance*, serre d'Asphodèle, *Clémence* comme hôpital, recrues |

### 43.4 Bilan de Port-Méridien

| Élément | Nombre |
| --- | --- |
| Plan V3 | 1 carte complète, 9 quartiers |
| Bâtiments à dessiner en vue 35° | ≈ 20, avec leurs états de chantier (≈ 45 états) |
| Intérieurs V1 | 5 |
| Rues de mission V2 | 3 (quais, centre, mur nord) |
| Props extérieurs (vue 35°) | ≈ 40 |
| PNJ | 12 habitants nommés + génériques, en 8 directions |
| Effets | Pluie, nuit, fumées de chantier, projecteurs, fusées éclairantes |

---

## 44. Liste complète de ce qui reste à faire et à générer

### 44.1 À générer (art et audio)

| Catégorie | Quantité | Détail |
| --- | --- | --- |
| Personnages nommés | 30 | §38.3 |
| Silhouettes génériques | ≥ 20 | §38.3 + PNJ d'Asphodèle et de Port-Méridien |
| Planches 8 directions (V2/V3) | Joueur + chaque PNJ présent en V2/V3 | §40.4 |
| Poses d'équipage (assis, au poste, blessé) | ≈ 48 | 16 membres × 3 poses |
| Ennemis et variantes | ≈ 15 | §38.4 |
| Boss | ≈ 12 | §38.4 (dont 7 en dette) |
| Véhicules et vaisseaux | ≈ 15 | §38.5 |
| Armes et équipements | ≈ 10 | §38.6 |
| Costumes | ≈ 10 | §38.7 |
| Props de missions | ≈ 150 | §38.8 |
| Props du Tantalus | ≈ 145 | §41.3 |
| Props d'Asphodèle | ≈ 50 | §42.3 |
| Props et bâtiments de Port-Méridien | ≈ 60 (+ 45 états de chantier) | §43.4 |
| Décors de mission | ≈ 108 zones (≈ 324 couches) | §38.9 |
| Décors des hubs | 6 pièces V2 du Tantalus, 12 modules d'Asphodèle + plan V3, 5 intérieurs + 3 rues + plan V3 de Port-Méridien | §41-43 |
| VFX | ≈ 40 cycles | §38.11 + effets d'ambiance |
| Animations d'ambiance des hubs | ≈ 100 | §41.3, §42.3 |
| Cinématiques | ≈ 73 (≈ 200 plans) | §38.15 |
| Musiques | ≈ 18 | §38.13 |
| Ambiances | ≈ 70 | §38.13 |
| Bruitages | ≈ 200 | §38.13 |
| Portraits de dialogue | 30 nouveaux | §38.14 |
| Archives MIRE fidèles | 8 archives : personnages des œuvres (planches, portraits), lieux reconstitués, découpage en chapitres | §26.10 |

### 44.2 À faire (code et données)

| Chantier | Référence |
| --- | --- |
| Renommage des noms hérités (textes, tests, nouvelle succession d'audit) | §1.5 |
| État de campagne `storyCampaign` et dossier QZ17 | §11, §19 |
| Gestion de la colonie | §6.3, §43 |
| Second hub Asphodèle | §7.3, §42 |
| Mode de pièce `ground-plane` (V2 et V3) | §40.4 |
| Réorganisation des pièces du Tantalus (6 en V2, ajouts aux 29 autres) | §41 |
| Voyage galactique avec temps et carburant | §13.2 |
| Archives MIRE généralisées et protocoles | §26 |
| Mécaniques nouvelles (16) | §37.3, §38.12 |
| Raccordement des chapitres V131 à leurs campagnes et déplacement de leur `worldId` | §13.4 |
| Correction des attributs générés des mondes de la franchise | §21.3 |
| Tests de parcours, de reprise et de sauvegarde pour chaque mission raccordée | §11 |

### 44.3 Décisions à prendre avant production

Les 17 points ouverts des §12 et §27.4, plus :

| # | Question | Section |
| --- | --- | --- |
| 18 | Ouvrir l'enveloppe protégée du hangar dropship pour une vue V2 ? | §41.2 — **Validé : hangar en V2** |
| 19 | Valider la répartition V1 / V2 / V3 du Tantalus, d'Asphodèle et de Port-Méridien. | §41-43 — **Validé (avec le hangar en plus)** |
| 20 | Échelle et projection exactes de la V2 (profondeur de la bande, facteur oblique). | §40.3 — **Validé : bande large** ; valeurs numériques à fixer à l'implémentation |

---

## 45. Décisions validées le 2026-11-05

Réponses du propriétaire aux points ouverts. Les tableaux des §12, §27.4 et §44.3 indiquent la décision ligne par ligne.

| Sujet | Décision | Effet |
| --- | --- | --- |
| Noms originaux (§1.5) | Validés | Cocyte, Station Orphée, Enfants de l'Hôte Parfait, Solène Ivarsson, Dario Kessler deviennent la référence du renommage dans le code |
| Signataire du badge | Révélé avec 6 pièces sur 7 | §5.7 |
| Mara Voss | Lien familial avec I. Voss | §8.3 |
| Noms de la campagne principale | Validés | Asphodèle, CASSIUS, Sarrazin, Wren, Ferro, Halloran, Grue |
| ICC et Marshals coloniaux | Gardés | Institutions du récit, sans faction jouable |
| Chapitres V131 | Répartis dans les campagnes annexes, mondes déplacés | Changement de `worldId` à faire dans les données, identifiants conservés |
| MIRE | Programme de modélisation de la compagnie, **archives fidèles et originales** | §21.2, §26.10 |
| Lieux et personnages des campagnes annexes | Validés | §14 à §18 |
| Ordre des campagnes annexes | Déblocage progressif | §13.5 |
| Yautja | Traces surtout, apparitions brèves, mission dédiée liée à *Yautja : la Longue Chasse* | §21.2, §22.16 |
| BG-386, Ryushi, LV-742 | Mode héritage | §22.13 à §22.15 |
| Freya's Prospect | Fusionné avec BG-386 ; nouveau monde glacé **Hiémale** | §21.3, §23 |
| Biomes et atmosphères | Corrigés pour les mondes de la franchise | §22.17 |
| Jackson's Star, Purdan | Habités, en déclin | §22.6, §22.11 |
| Épave en orbite d'Acheron | Vaisseau de même classe que le Sulaco (USS Gonfalon) | §22.8 |
| USM Auriga | Préquelle **et** archive fidèle hors chronologie | §22.7, §26.10 |
| Hangar dropship | Passe en couloir de profondeur (V2) | §41.2 ; sa géométrie protégée doit être refaite et retestée |
| Répartition des vues | Validée (7 pièces du Tantalus en V2 avec le hangar) | §41 à §43 |
| Échelle de la V2 | **Bande large**, type arcade AVP | Valeurs numériques à fixer à l'implémentation (§45.1) |


### 45.1 Décisions de cadrage (deuxième série, 2026-11-05)

Réponses du propriétaire aux questions sur les parties peu détaillées. Chaque ligne indique ce qui reste à concevoir.

| Sujet | Décision | Conséquence pour la conception |
| --- | --- | --- |
| Ton horreur / action | **Variable selon la mission** | Chaque fiche de mission déclare son registre : *horreur* (peu d'ennemis, munitions rares, fuite), *tension* (montée puis combat) ou *action* (vagues). Le directeur de tension (§53.3) lit ce registre. Registres à attribuer mission par mission. |
| Echo-9 | **Mixte** : apparence libre, passé et répliques écrits | Le passé est **choisi par le joueur** dans une liste d'origines à écrire : le parcours **avant** l'affectation au Tantalus (par exemple vétéran d'une unité anéantie, ancien garde de colonie, dossier caviardé), Echo-9 restant un Marine colonial. Chaque origine : un court texte, 3 à 6 répliques propres, une ou deux options de dialogue. Liste des origines à rédiger. |
| Mort de l'équipage | **Option choisie au début de la partie** | Mort définitive activable ; sinon blessures et convalescence. Option non modifiable en cours de partie, sauf vers « blessures ». |
| Narration | **Texte + portraits** | Sons de voix courts, cinématiques en plans fixes dans le moteur (§10). Pas de doublage. |
| Plateforme de référence | **PC clavier-souris** | Réglages, tests et tranche verticale faits au clavier-souris. Manette et tactile restent présents mais secondaires. |
| Durée de la campagne principale | **25 h et plus** | La bible ne chiffre pas encore la durée actuelle de la campagne de Cocyte. Il faut la chiffrer puis l'étendre : missions locales de Port-Méridien et d'Asphodèle, quêtes du Tantalus, missions de nuit (§39.2), reconstruction (§6.3). |
| Temps de la colonie | **Entre les missions** | Chaque retour au hub fait avancer d'un cycle les chantiers, les ressources et les événements de Port-Méridien. |
| Asphodèle | **Hub explorable complet** | Le plan V3 (§42) devient un espace parcouru à pied (anneau, rayons, moyeu), et non un menu de navigation. Les 12 modules sont tous accessibles à pied, avec portes et points d'arrivée vérifiés (`AGENTS.md`). |
| Langues | **Français et anglais dès maintenant** | Mettre en place un système de traduction avant d'écrire de nouveaux textes. Tout nouveau texte joueur est écrit dans les deux langues. Les textes existants (en dur dans le code) sont à extraire. |
| Coopération | **Coop locale et en ligne** : un joueur remplace un membre IA de l'escouade | Pas de mode séparé : la coop se branche sur l'escouade. Le code déclare aujourd'hui une coop locale du convoi inachevée (`special-operations-v131.js`) ; il n'y a pas de réseau. L'en-ligne demande une architecture à concevoir (hôte, synchronisation, reprise). |
| Mort d'un joueur en coop | **Mélange** des trois règles | Proposition à valider : relève par un coéquipier pendant un délai ; à défaut, la règle d'équipage s'applique (blessure ou mort définitive) et le joueur reprend un autre membre de l'escouade ou attend le prochain checkpoint s'il n'en reste aucun. |
| Source des images | **Génération par IA**, faite par le propriétaire | Les listes de production (§28-37, §44) servent de commandes d'images. Une génération ne certifie pas la fidélité aux œuvres (`AGENTS.md`) ; la provenance est à noter dans `LICENSE_NOTICE.md`. |
| Diffusion | **Entre gratuite publique et privée, non décidé** | §53.10 reste une décision du propriétaire. |
| Profondeur V2 | **Bande large**, type arcade AVP | Déplacement libre en profondeur, échelle des sprites nettement réduite au fond. Valeurs exactes à fixer et tester. |
| Musiques de moments de jeu | **Toutes** : alerte, boss/reine, fins, retour au calme | Quatre nouveaux emplacements musicaux et leurs points d'accroche dans le jeu (§53.2). |
| Lien avec *Yautja : la Longue Chasse* (`avp-hunt`, LV-742) | **Les trois en parallèle** | Un clan de l'autre jeu à une autre époque, des objets reconnaissables, et un chasseur partagé qui apparaît brièvement. Choisis le 2026-11-06 : **Gardiens du Confinement**, **Garde du Seuil** devenu ancien, époque **bien après** (§22.16). |
| Première archive MIRE fidèle | **Hadley's Hope (*Aliens*)** | Première archive à produire dans l'ordre du §26.10. |
| Accessibilité | **Tout** | Mode daltonien, taille du texte, sous-titres des sons, remappage complet (§53.8). |

### 45.2 Décisions de cadrage (troisième série, 2026-11-06)

| Sujet | Décision | Conséquence pour la conception |
| --- | --- | --- |
| Mort d'un joueur en coop | **Proposition du §45.1 validée** | Relève par un coéquipier pendant un délai ; à défaut, règle de l'équipage (blessure ou mort définitive) ; le joueur reprend un autre membre de l'escouade, ou attend le prochain checkpoint s'il n'en reste aucun. |
| Coop en ligne | **Passer par le compte Supabase existant** | Le dépôt utilise déjà Supabase pour l'authentification (`src/cloud-auth-v119.js`, SDK `src/vendor/supabase-2.117.2.js`) et la synchronisation de sauvegarde (`src/cloud-sync-v119.js`). Piste à évaluer : les canaux Realtime de Supabase (diffusion et présence) pour relayer les entrées et l'état entre l'hôte et les invités. Latence, quotas du compte et reprise après coupure sont à mesurer avant de s'engager. |
| Nombre de joueurs | **Taille de l'escouade** | Vérifié dans le moteur : `configureMissionSquad` (`src/game-v52-runtime.js`) déploie Echo-9 (`player-echo9`) et jusqu'à **4 alliés** (`MAX_SQUAD_SIZE = 4`, `src/save.js`). La coop va donc jusqu'à **5 joueurs** : l'hôte et 4 invités. Le moteur a déjà une coop locale à deux (« J2 », `coopEnabled`) où le second joueur prend la place d'un allié existant au lieu d'en créer un ; plusieurs chapitres spéciaux la désactivent (`coopEnabled = false`, par exemple `apc-convoy-runtime-v121.js`, `black-cocoon-runtime-v121.js`). C'est la base à étendre. |
| Gains de l'invité | **Objets et expérience** | L'invité garde ce qu'il gagne ; seule l'histoire de l'hôte avance. Les objets gagnés passent par la même validation de fin de mission que ceux de l'hôte. |
| Origines d'Echo-9 | **20 origines, rédigées par Claude** | §2.4 : fiches, capacités proposées, 60 répliques FR/EN, fil du dossier caviardé. À valider. |
| Registres des missions | **Claude propose, le propriétaire valide** | §0.3 (campagne principale) et §0.4 (campagnes annexes, planètes, archives MIRE, lieux inventés). |
| Sauvegarde en mission | **Terminaux physiques et sauvegarde libre hors combat**, avec les checkpoints | Proposition liée au registre (§0.3) : en Horreur, terminaux seulement ; en Tension et Action, sauvegarde libre hors combat en plus. |
| Extension vers 25 h | **Les quatre leviers** | Chiffré au §5.9 : ≈ 17 h 30 estimées aujourd'hui, ≈ 27 h avec 4 missions principales, 8 annexes, contrats locaux et cycles de gestion. |
| Économie | **Crédits et ressources** | Le code a déjà les deux : `credits`, `alloy`, `fuel`, `medical`, `research`, `pathogen` (`src/save.js`). La décision confirme ce modèle. |
| Difficulté | **Les quatre** | Le code a déjà trois niveaux : `story`, `standard`, `nightmare` (`src/game-runtime.js`), qui couvrent le mode histoire et le mode cauchemar. À ajouter : des réglages séparés (munitions, dégâts, fréquence des alertes). |
| Fins | **Choix cumulés et choix final** | Réécrit : §5.6 (étape 2) et §5.7.1. Echo-9 recommande une option à Vega ; les options ouvertes dépendent des choix cumulés ; Vega suit si sa confiance est au moins *operationnel*. |
| Après la fin | **Continuer et nouvelle partie +** | Continuer avec la même sauvegarde vers les campagnes annexes (§13). La nouvelle partie + repart du prologue avec une partie des acquis, à définir (la sauvegarde d'origine reste intacte). |

### 45.3 Validations du 2026-11-06

| Proposition | Décision |
| --- | --- |
| Origines d'Echo-9 (§2.4) | **Validées avec capacités** : 19 capacités à régler et tester ; `origin-20` sans capacité |
| Registres (§0.3, §0.4) | **Validés** |
| Choix final (§5.7.1) | **Validé** : recommandation d'Echo-9, suivie si la confiance de Vega est au moins *operationnel* |
| Missions ajoutées (§5.9, §5.10) | **Toutes validées** : 4 principales, 8 annexes, CIN-21, CIN-59, CIN-73 |
| Lien *Yautja : la Longue Chasse* (§22.16) | **Validé** : Gardiens du Confinement, Garde du Seuil devenu ancien, époque bien après |


---

# PARTIE VIII — Musique : prompts pour Google Flow Music

## 46. Méthode

### 46.1 Ce que l'on sait de l'outil

D'après les guides consultés (novembre 2026) : Flow Music utilise le modèle Lyria 3.5 ; un morceau dure **jusqu'à environ 3 minutes** ; le prompt peut décrire genre, ambiance, instruments, tempo et durée ; l'outil propose de **remplacer une section, prolonger (Extend) ou décliner (Cover)** un morceau ; il est conseillé de décrire **ce que le morceau doit faire**, de générer deux versions et de corriger une section à la fois. Les règles exactes de l'outil (noms d'artistes, longueur maximale du prompt, langues) n'ont pas été vérifiées.

Sources : [Jack Righteous — guide Google Flow Music 2026](https://jackrighteous.com/fr/blogs/music-creation-process-guide/google-flow-music-complete-guide-2026), [Google — Lyria 3.5](https://blog.google/innovation-and-ai/models-and-research/google-labs/lyria-3-5/?type=AI).

### 46.2 Choix d'écriture

- **Prompts en anglais**, par convention ; l'outil accepte du texte, mais l'avantage de l'anglais n'est pas vérifié.
- **Aucun nom de compositeur, de film ou de jeu dans les prompts.** L'ambiance de la franchise est décrite par ses traits musicaux. Cela évite un éventuel refus de l'outil et la copie de thèmes protégés. Les morceaux restent des **compositions originales**, comme l'exige `LICENSE_NOTICE.md`.
- **Toujours « instrumental, no vocals »**, sauf les chœurs sans paroles indiqués.
- **Boucles :** pour la musique de hub ou d'exploration, demander une fin qui revient au début ; couper ensuite la boucle dans un éditeur audio.

### 46.3 Palette commune de la franchise (à garder d'un morceau à l'autre)

| Trait | Description |
| --- | --- |
| Cordes | Nappes tenues très graves ou très aiguës, clusters dissonants, glissandos lents, trémolos nerveux |
| Cuivres | Gonflements lents des cors et trombones graves, appels militaires en sourdine |
| Bois | Flûtes et clarinettes basses étranges, souffles, notes tenues fragiles |
| Percussions | Caisse claire militaire, frappes métalliques type enclume, timbales profondes, percussions industrielles |
| Électronique | Bourdons analogiques chauds, impulsions de sonar, échos à bande, souffle de machine |
| Espace sonore | Grand vide, longues réverbérations, silences, dynamique très large (du presque rien au fortissimo) |
| Chœurs | Rares, sans paroles, murmurés ou tenus, jamais héroïques |

### 46.4 Le motif du relais

Un **motif de trois notes descendantes**, comme un bip de relais qui ralentit, sert de signature au jeu (il rappelle l'ouverture, §4). Conseil : générer d'abord le **thème principal (M-01)**, garder la version où le motif est le plus net, puis utiliser **Cover** à partir de ce morceau pour les pièces qui doivent le rappeler (indiquées « motif du relais »).

---

## 47. Hub, menus et voyage

### M-01 · Thème principal — *Tantalus Frontier*

| Usage | Durée | Tempo | Boucle | Motif du relais |
| --- | --- | --- | --- | --- |
| Écran titre, cinématique d'ouverture (CIN-00) | 2 min 30 | 60 BPM, rubato | Non | Oui (référence) |

```
Instrumental cinematic sci-fi horror main theme, no vocals. Opens in near silence with a low analog drone and a slow three-note descending motif played on a lonely muted trumpet, like a distress beacon slowing down. Dissonant high string clusters creep in, low brass swells rise and fall, distant metallic anvil hits mark the pulse. A restrained military snare enters halfway, giving a sense of duty and dread, then the full orchestra swells once to a cold, unresolved climax before collapsing back into the drone and the three-note motif. Mood: isolation, deep space, corporate menace, quiet courage. Wide dynamics, long reverb, 60 BPM rubato, about 2 minutes 30 seconds.
```

### M-02 · Tantalus, quart de nuit (hub calme)

| Usage | Durée | Tempo | Boucle | Motif du relais |
| --- | --- | --- | --- | --- |
| Hub du Tantalus hors alerte | 3 min | 55 BPM | Oui | Discret |

```
Instrumental ambient underscore for a military spaceship at night, no vocals. Warm low synth pad, soft hum of ship machinery, sparse piano notes, gentle sustained strings, occasional sonar-like pings. The three-note descending motif appears once, very softly, on celesta. Calm but never fully safe: a faint dissonant string note lingers underneath. Feeling of a tired crew resting between missions, home among the stars. Slow, 55 BPM, seamless loop that ends where it began, about 3 minutes.
```

### M-03 · Tantalus, alerte à bord

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Crises à bord (xénomorphe, synthétique, pathogène), interlude « Quarantaine » | 2 min 30 | 120 BPM | Oui |

```
Instrumental tense action-horror cue for an alarm aboard a spaceship, no vocals. Pulsing low synth ostinato like a klaxon, frantic string tremolos, stabbing low brass, industrial metallic percussion, sharp military snare rolls. Moments of sudden silence broken by dissonant orchestral hits, as if something moves in the vents. Claustrophobic, urgent, mechanical. 120 BPM, loopable, about 2 minutes 30 seconds.
```

### M-04 · Hypersommeil (voyage galactique)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Carte galactique, trajets entre systèmes | 3 min | Sans pulsation | Oui |

```
Instrumental slow ambient piece about cryosleep travel between stars, no vocals. Very slow evolving synth pads, glassy high strings, soft breathing-like textures, faint heartbeat-like low pulse, distant harp harmonics. Weightless, cold, serene but lonely, time stretching. No drums. Seamless loop, about 3 minutes.
```

### M-05 · Briefing

| Usage | Durée | Tempo | Boucle | Motif du relais |
| --- | --- | --- | --- | --- |
| Salle de briefing, choix de mission | 2 min | 80 BPM | Oui | Oui |

```
Instrumental military briefing underscore, no vocals. Steady muted snare pattern, low strings in a determined ostinato, restrained horns, analog synth pulses like tactical displays. The three-note descending motif played by low horns as a reminder of the lost signal. Focused, serious, professional soldiers preparing, with an undercurrent of dread. 80 BPM, loopable, about 2 minutes.
```

---

## 48. Campagne principale — Cocyte

### M-06 · Cocyte, la pluie sur les relais (exploration)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Actes I et II, exploration des relais QZ | 3 min | 65 BPM | Oui |

```
Instrumental atmospheric horror exploration music, no vocals. Constant soft rain texture, low droning cellos, eerie woodwind breaths, sparse metallic taps like water dripping on steel, faint radio static and sonar pings. Long silences between phrases. A lonely, abandoned industrial relay station on a stormy colony world, something unseen nearby. 65 BPM, slow, loopable, about 3 minutes.
```

### M-07 · L'enquête (analyse des preuves)

| Usage | Durée | Tempo | Boucle | Motif du relais |
| --- | --- | --- | --- | --- |
| Poste d'analyse, retours d'enquête, dossier QZ17 | 2 min 30 | 70 BPM | Oui | Oui |

```
Instrumental investigative underscore, no vocals. Ticking clock-like percussion, muted piano repeated notes, soft analog synth arpeggio, low strings questioning in unresolved intervals. The three-note descending motif returns on vibraphone, slightly out of time, like timestamps being compared. Cold, precise, uneasy, a mystery about delayed distress calls. 70 BPM, loopable, about 2 minutes 30 seconds.
```

### M-08 · Contact (combat contre la ruche)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Combats sur Cocyte, Acte IV | 2 min 30 | 130 BPM | Oui |

```
Instrumental intense sci-fi horror combat music, no vocals. Driving low string ostinato, aggressive brass stabs, pounding timpani and metallic anvil hits, fast military snare, screeching high string clusters like creatures in the walls. Relentless, chaotic, desperate firefight in dark tunnels against a hive. 130 BPM, loopable, about 2 minutes 30 seconds.
```

### M-09 · Corridor de feu (course du M577)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Acte III, convoi blindé ; Acte V, course | 2 min 30 | 140 BPM | Oui |

```
Instrumental high-speed military action cue, no vocals. Heavy rolling percussion like tank treads, propulsive low brass, galloping string ostinato, industrial clanks, rising tension every 16 bars. An armored personnel carrier racing through a burning corridor while creatures chase it. Heroic but grim, never triumphant. 140 BPM, loopable, about 2 minutes 30 seconds.
```

### M-10 · Port-Méridien, le jour (reconstruction)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Vue de gestion de la colonie, chantiers | 3 min | 75 BPM | Oui |

```
Instrumental hopeful frontier colony theme, no vocals. Warm acoustic guitar and soft strings, gentle hand percussion, distant work sounds blended as rhythm, a simple folk-like melody on oboe. Underneath, a faint low drone reminds that the colony is fragile and surrounded by danger. Rebuilding, community, rain clearing for a moment. 75 BPM, loopable, about 3 minutes.
```

### M-11 · La nuit des murs (siège de la colonie)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Mission C5, défenses de nuit | 3 min | 110 BPM | Oui |

```
Instrumental siege music for a colony defending its walls at night, no vocals. Ominous low brass chords, steady war drums, tense string ostinato, metallic alarms woven into percussion, the oboe melody from the colony theme returning broken and minor. Builds wave after wave, with short silences between attacks. Desperate resistance until dawn. 110 BPM, loopable, about 3 minutes.
```

### M-12 · Asphodèle, la station morte

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Front station S1 à S3 | 3 min | Sans pulsation | Oui |

```
Instrumental dark ambient for an abandoned orbital station, no vocals. Deep hum of dead machinery, slow metallic groans, eerie high string harmonics, distant fragments of an old corporate announcement melody on a detuned synth, breathing ventilation sounds. Long silences, sudden low swells. Emptiness, lost crew, something still awake. No steady beat, loopable, about 3 minutes.
```

### M-13 · CASSIUS

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Pont de contrôle, dialogue avec l'IA (S2) | 2 min | 90 BPM, mécanique | Oui |

```
Instrumental cold machine-intelligence theme, no vocals. Precise repeating analog synth arpeggios, clean digital bleeps, glassy pads, a slow string line that never resolves. Polite, logical, inhuman, obeying old orders with no one left to correct it. Hypnotic and unsettling. 90 BPM, strictly mechanical rhythm, loopable, about 2 minutes.
```

### M-14 · Asphodèle, le hub vivant

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Hub Asphodèle après S4 | 3 min | 70 BPM | Oui |

```
Instrumental calm orbital hub music, no vocals. The same machinery hum as an abandoned station, but now warm: soft synth pads, gentle marimba pulses, light strings, a quiet hopeful melody on French horn, faint marketplace murmur as texture. A reclaimed station coming back to life above a stormy planet. 70 BPM, loopable, about 3 minutes.
```

### M-15 · Non viable (finale de la campagne)

| Usage | Durée | Tempo | Boucle | Motif du relais |
| --- | --- | --- | --- | --- |
| Acte V, confrontation avec la compagnie et la Reine du dépôt | 3 min | 120 BPM | Non | Oui |

```
Instrumental epic but dark finale cue, no vocals except a wordless low choir. Begins with cold corporate synth pulses and a tense string pedal, then explodes into full orchestra: thunderous timpani, anvil hits, massive low brass, frantic strings, the three-note descending motif blasted by the horns as a call to resist. A giant creature pursues an armored convoy toward the colony walls. Ends abruptly on a single held dissonant chord. 120 BPM, about 3 minutes.
```

### M-16 · Fin « Le relais parle »

| Usage | Durée | Tempo | Motif du relais |
| --- | --- | --- | --- |
| Fin favorable | 2 min 30 | 60 BPM | Oui, résolu |

```
Instrumental emotional ending theme, no vocals. Solo piano and soft strings, then warm horns. The three-note descending motif finally rises and resolves into a major chord, like a distress call answered at last. Dignified, bittersweet, hopeful, the losses still remembered. Slow 60 BPM, about 2 minutes 30 seconds.
```

### M-17 · Fin « Le fret d'abord »

| Usage | Durée | Tempo |
| --- | --- | --- |
| Fin où la compagnie l'emporte | 2 min | 55 BPM |

```
Instrumental somber ending, no vocals. Cold synth drone, a slow minor string elegy, the three-note descending motif played once more on a lonely muted trumpet and left unresolved. Corporate victory, quiet defeat, a colony handed over. Slow 55 BPM, about 2 minutes.
```

### M-18 · Fin « Les vivants, sans preuve »

| Usage | Durée | Tempo |
| --- | --- | --- |
| Fin ambiguë | 2 min | 60 BPM |

```
Instrumental ambiguous ending, no vocals. Gentle colony guitar melody over low dissonant strings that refuse to settle, soft rain texture, a distant military snare fading out. People saved, truth lost, an uncertain future. Slow 60 BPM, about 2 minutes.
```

---

## 49. Campagnes annexes

### M-19 · La Saison des Reines — sous la surface

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Nacre-7, plongée HADAL, récifs | 3 min | 60 BPM | Oui |

```
Instrumental underwater horror ambient, no vocals. Muffled deep bass drones, slow bubbling textures, whale-like low brass glissandi, glassy high harmonics, a distant pulse like a submarine sonar. Pressure, darkness, something huge circling below. Slow 60 BPM, loopable, about 3 minutes.
```

### M-20 · La Saison des Reines — les Reines (boss)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Reine récifale, Reine volante, Reine-Mère | 3 min | 135 BPM | Oui |

```
Instrumental monstrous boss battle music, no vocals except a wordless low choir. Massive low brass roars, pounding timpani and metallic anvil hits, savage string ostinatos, shrieking high clusters, an ominous three-voice choir chord pulsing like a hive mind. A colossal alien queen defending her nest. Overwhelming, primal, terrifying. 135 BPM, loopable, about 3 minutes.
```

### M-21 · Directive zéro — synthétiques

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Sable Meridian, Kéos | 3 min | 100 BPM | Oui |

```
Instrumental unsettling synthetic-uprising music, no vocals. Rigid mechanical rhythms of factory percussion, cold analog synth sequences, clean bell tones repeating like instructions, slow strings that slowly bend out of tune as if obedience is breaking. Dozens of artificial workers standing still in the sand, then all turning at once. 100 BPM, loopable, about 3 minutes.
```

### M-22 · Directive zéro — le Chœur d'Éloïse (finale)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Murmure, pylônes, Chasseur de Mères | 3 min | 90 BPM | Non |

```
Instrumental eerie finale, wordless choir allowed, no lyrics. A soft synthetic voice-like pad merges with an organic breathing choir, glassy synth arpeggios entwine with low pulsing biological textures, strings rising in strange harmonies. Beautiful and wrong at the same time: a machine and a hive singing together. Builds to a vast, sorrowful climax. 90 BPM, about 3 minutes.
```

### M-23 · Les Bâtisseurs — l'épave et le temple

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Dérive de Tyndare, Hiéron | 3 min | Sans pulsation | Oui |

```
Instrumental ancient alien sacred ambient, no vocals except a distant wordless choir. Enormous slow low brass chords, deep organ-like drones, ritual-like slow drum beats far away, eerie high string harmonics, a simple solemn melody on a low flute. Vast, ancient, cathedral-like, beyond human scale, both awe-inspiring and threatening. No steady beat, loopable, about 3 minutes.
```

### M-24 · Les Bâtisseurs — le Dormeur (boss)

| Usage | Durée | Tempo |
| --- | --- | --- |
| Combat contre l'Ingénieur | 3 min | 110 BPM |

```
Instrumental colossal boss battle, no vocals except a powerful wordless choir. Crushing low brass, giant drums, slow heavy orchestral blows like footsteps of a giant, dark choir chords, frantic strings in between. An ancient towering being awakens and attacks. Majestic, merciless, overwhelming. 110 BPM, about 3 minutes.
```

### M-25 · Fièvre noire — contamination

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Pallas Rift, vaisseau-hôpital *Clémence* | 3 min | 75 BPM | Oui |

```
Instrumental body-horror contamination ambient, no vocals. Wet organic textures, slow sickly string glissandi, detuned music-box notes, hospital monitor beeps woven into the rhythm, low throbbing pulse like a fever. Quarantine, black rain, patients changing in their beds. Nauseous, intimate, dread. 75 BPM, loopable, about 3 minutes.
```

### M-26 · Le banc d'essai — la compagnie

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| MIRE-9, *Bonne-Espérance*, Khepri Forge | 3 min | 95 BPM | Oui |

```
Instrumental cold corporate-conspiracy music, no vocals. Clean minimalist synth pulses, sterile piano, precise string ostinatos, distant industrial foundry clangs, an elegant but heartless melody on strings like a polished boardroom. Experiments on colonists, cameras everywhere, everything legal on paper. 95 BPM, loopable, about 3 minutes.
```

### M-27 · Le banc d'essai — Talos contre le Titan

| Usage | Durée | Tempo |
| --- | --- | --- |
| Duel final en exosquelette | 3 min | 145 BPM |

```
Instrumental giant-scale mech battle music, no vocals. Heavy industrial percussion, hydraulic hisses as rhythm, thunderous low brass, driving strings, metallic anvil hits, a defiant horn theme answering a monstrous low brass roar. A pilot in a heavy loader suit fighting a titanic creature in a collapsing foundry. Epic, mechanical, brutal. 145 BPM, about 3 minutes.
```

---

## 50. Archives MIRE, planètes et missions spéciales

### M-28 · Archives MIRE — le modèle

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Menu des archives, archives originales | 3 min | 70 BPM | Oui |

```
Instrumental retro-futuristic simulation music, no vocals. Warm vintage analog synthesizers, slightly wobbly tape-echo textures, soft drum machine, glitchy pauses as if a recording skips, a nostalgic melody that sometimes drifts out of tune. A corporate computer reconstructing a past disaster from old records. Nostalgic, uncanny, artificial. 70 BPM, loopable, about 3 minutes.
```

### M-29 · Ruines de l'héritage (missions sur les mondes connus)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Opérations Héritage (Acheron, Fiorina, Sevastopol…) | 3 min | 60 BPM | Oui |

```
Instrumental elegiac exploration music for ruins of past disasters, no vocals. Lonely solo cello, wind textures, slow dissonant string clusters, distant metallic resonances, faint echoes of a military snare from long ago. Visiting the remains of places where others died decades before. Haunted, respectful, ominous. 60 BPM, loopable, about 3 minutes.
```

### M-30 · L'audience (Gateway)

| Usage | Durée | Tempo |
| --- | --- | --- |
| Audience de l'ICC, mission sans combat | 2 min 30 | 72 BPM |

```
Instrumental courtroom tension music, no vocals. Restrained low strings, measured timpani strokes like a judge's gavel, a cold synth pad, a hesitant oboe line rising as evidence is presented. Truth against corporate lawyers in a sterile hearing room. Tense, quiet, dignified. 72 BPM, about 2 minutes 30 seconds.
```

### M-31 · La réserve (mission liée à *Yautja : la Longue Chasse*)

| Usage | Durée | Tempo | Boucle |
| --- | --- | --- | --- |
| Chaîne `avp-hunt` sur LV-742 | 3 min | 85 BPM | Oui |

```
Instrumental jungle hunting-ground tension music, no vocals. Tribal-like low drums at a distance, rattling percussion, clicking textures, humid jungle ambience, low brass swells, nervous high strings. Two predators share the same territory and the humans are only passing through. Primal, watchful, the feeling of being observed from the trees. 85 BPM, loopable, about 3 minutes.
```

---

### 50.1 Correspondance avec les emplacements audio du jeu

Après la PR #43, le jeu lit ces fichiers s'ils existent (`assets/audio/music/<emplacement>.ogg`, ou `.mp3`, `.wav`, `.m4a`, `.webm`), puis `npm run audio:scan` met à jour le manifeste :

| Emplacement | Piste conseillée | Joué dans |
| --- | --- | --- |
| `menu` | M-01 | Menus et écran titre |
| `hub` | M-02 | Hub du Tantalus |
| `mission` | M-06 (ou M-08 pour une version plus tendue) | Missions et Bioforge |
| `travel` | M-04 | Carte galactique |
| `briefing` | M-05 | Écran des opérations |
| `archives` | M-28 | Archives |

Les autres pistes (alerte, boss, fins, campagnes annexes) attendent de nouveaux emplacements reliés à des moments précis du jeu.

## 51. Récapitulatif et conseils

| Groupe | Pistes |
| --- | --- |
| Hub, menus, voyage | M-01 à M-05 |
| Campagne principale | M-06 à M-18 |
| Campagnes annexes | M-19 à M-27 |
| Archives, planètes, missions spéciales | M-28 à M-31 |
| **Total** | **31 pistes** (le §38.13 estimait environ 18 pistes) |

**Conseils de production :**

1. Générer M-01 en premier et choisir la version au motif le plus net ; s'en servir comme référence (Cover) pour M-02, M-05, M-07, M-15 à M-17.
2. Pour une boucle, générer, puis couper le morceau au même point de mesure en début et en fin dans un éditeur audio.
3. Si un morceau est trop « épique » ou trop propre, ajouter au prompt : *more silence, more dissonance, less melody, darker, sparse*.
4. Garder une trace du prompt et de la version retenue pour chaque piste, et vérifier les conditions d'utilisation de l'outil (droits, marquage éventuel) avant intégration au jeu.
5. Les fichiers retenus vont dans `assets/audio/music/` avec une mise à jour de `assets/audio/manifest.json` et de la note de provenance (`LICENSE_NOTICE.md`), qui indique aujourd'hui que l'audio est produit par synthèse hors ligne : cette note devra mentionner l'outil de génération.


---

# PARTIE IX — Feuille de route pour rendre le jeu attractif

## 52. Principes et état au 2026-11-05

### 52.1 Principes

1. **Finir avant d'ajouter.** Une heure de jeu finie attire davantage que dix chapitres partiels.
2. **Le son et les sensations d'abord.** Dans un jeu Alien, la peur passe par le son, le rythme et les silences.
3. **Mesurer avec des joueurs.** Les tests techniques du dépôt (4 062 tests Node à cette date, 4 061 réussis, 0 échec, 1 non exécuté) prouvent la robustesse, pas l'intérêt.
4. **Respecter les protections du dépôt.** Certaines données sont protégées volontairement (§52.3) ; les lever est une décision du propriétaire.

### 52.2 Statuts

| Statut | Signification |
| --- | --- |
| **Fait** | Livré dans cette PR ou déjà présent dans le dépôt |
| **Prêt** | Conçu en détail, réalisable sans décision supplémentaire |
| **Bloqué** | Dépend d'une décision ou d'une ressource indisponible ici |
| **À faire** | Non commencé |

### 52.3 Renommage dans le code : protection levée pour ce changement, PR #42

**Tentative faite le 2026-11-05**, sur une branche locale non publiée :

- `content-core-v50.js` : Lethe → Cocyte, Pioneer Station → Station Orphée, emplacement de Freya's Prospect → Hiémale, description de BG-386 avec Freya's Prospect, secteurs passés au Tantalus Reach, provenance `project-canon`, biomes et atmosphères corrigés pour 16 mondes de la franchise. **Les 64 identifiants de mondes et leurs valeurs de danger, d'infestation et de stabilité restaient identiques** (comparaison champ par champ avec `main`).
- Textes affichés : `COCYTE · …` dans les scènes du convoi et de QZ-18, « TR-0 · LA RUCHE-MONDE ».
- Les 68 suites de tests liées aux fichiers modifiés passaient (1 188 tests, 0 échec).

**Pourquoi la première tentative n'a pas été publiée :** l'audit V179 (`scripts/audit-succession-v163.mjs`) classe `src/content-core-v50.js` parmi les **`protectedGameplayBytes`**, avec `src/save.js` et `src/cloud-sync-v119.js`. Les vérificateurs `verify-audit-continuation-v163.mjs` et `verify-parallel-completion-v165.mjs` refusent donc toute modification de ce fichier. C'est une protection voulue des données de jeu, pas une empreinte oubliée.

**Options pour le propriétaire :**

| Option | Contenu | Conséquence |
| --- | --- | --- |
| **A — Lever la protection pour cette modification** | Ajouter un maillon d'audit (V183) qui déclare la nouvelle empreinte de `content-core-v50.js` et autorise cette seule modification dans les vérificateurs V163 et V165 | Renommage complet et cohérent ; les identifiants et l'équilibrage restent stables |
| **B — Renommer seulement l'affichage** | Laisser `content-core-v50.js` intact et remplacer le nom des mondes au moment de l'affichage | Moins sûr : les noms existent alors en double, et chaque écran doit passer par la couche d'affichage |
| **C — Reporter** | Garder les anciens noms dans le code jusqu'à une intégration groupée | Le jeu et la bible restent en désaccord sur les noms |

**Décision du propriétaire (2026-11-05) : option A.** Le renommage est publié dans la **PR #42** : module source uniquement `scripts/audit-original-names-v183.mjs` (12 reçus de succession), résolveur V182 prolongé sans réécrire d'enregistrement historique, suite Node complète identique à `main` (4 062 tests, 4 061 réussis, 0 échec, 1 non exécuté), contrôle de publication et build réussis.

**Fiches de référence non renommées :** `premium-personnel-v119.js` (Maeko Hayes, Jonas Harper), `franchise-costumes-v119.js` (tenues « de Lethe ») et les cultistes Darwin Era des catalogues d'ennemis décrivent des éléments réels d'*Aliens: Dark Descent*, avec leur source citée. Depuis la décision d'avoir des **archives MIRE fidèles**, ils restent des références de cette œuvre. Les renommer rendrait leur source fausse. Solène Ivarsson et Dario Kessler restent des personnages originaux de la bible, pas des remplacements de ces fiches.

---

## 53. Feuille de route détaillée

### 53.1 Tranche verticale : la première heure

**Objectif :** une séquence jouable sans coupure, au niveau final : ouverture → réveil → qualification → Port-Méridien → briefing → Acte II (QZ-18) → retour et compte rendu.

| Tâche | Statut | Dépend de |
| --- | --- | --- |
| Écrire l'enchaînement exact des écrans et transitions | Prêt (§4, §5.2) | — |
| CIN-00, CIN-01, CIN-02, CIN-20 (plans, textes) | Prêt (§4, §10) | Art des plans |
| Raccorder prologue → Port-Méridien → briefing → QZ-18 dans l'état de campagne | À faire | `storyCampaign` (§11) |
| Musique de la séquence : M-01, M-02, M-05, M-06, M-07 | Prêt (prompts §47-48) | Génération par le propriétaire |
| Bruitages de la séquence (détecteur, pas, portes, sas, pluie, relais) | À faire | §53.2 |
| Test de jeu de la séquence par 3 à 5 joueurs | À faire | Séquence jouable |

**Critère de réussite :** un joueur extérieur finit la séquence sans aide, en moins de 70 minutes, et sait dire ce qui s'est passé à QZ-18.

### 53.2 Audio

| Tâche | Statut | Remarque |
| --- | --- | --- |
| 31 prompts musicaux | **Fait** (§46-51, fichier `PROMPTS_MUSIQUE_FLOW.md`) | — |
| Génération des musiques | Bloqué ici | Faite par le propriétaire avec Flow Music |
| Élargir les emplacements audio du jeu | **Fait** (PR #43, après la #42) | 10 emplacements de bruitages (+ `checkpoint`, `locked`, `kill`, `pickup`, `victory`, avec sons de secours synthétisés) et 6 de musique (+ `travel`, `briefing`, `archives`, qui rejouent la musique du menu tant qu'aucun fichier n'existe) |
| Musique par scène | Partiel (PR #43) | Carte galactique → `travel`, opérations → `briefing`, archives → `archives`. Validé (§45.1) : ajouter alerte, boss/reine, fins et retour au calme, avec leurs points d'accroche dans le jeu |
| Bruitages prioritaires (≈ 40) : détecteur (variantes), pas par sol, portes, sas, ascenseurs, alarmes, pluie, cris par caste, armes principales | À faire | Le dépôt sait synthétiser des sons originaux hors ligne (`scripts/generate-audio-v132.mjs`) ; c'est une piste possible |
| Mise à jour de la provenance audio | À faire | `LICENSE_NOTICE.md` décrit aujourd'hui une synthèse hors ligne ; il faudra y mentionner l'outil utilisé |

**Critère :** chaque action du joueur et chaque événement de menace a un son ; les silences sont voulus, jamais des absences.

### 53.3 Sensations de jeu et tension

| Tâche | Statut |
| --- | --- |
| Session de réglage du tir (recul, impact, réaction des ennemis, retour sonore) avec captures avant/après | À faire |
| Directeur de tension : apparitions dosées selon le stress, temps calmes garantis | À faire |
| Fausses alertes du détecteur de mouvement (échos, ventilateurs) | Prêt (§14.5, §7.2) |
| Comportements propres à chaque caste (plafond, contournement, fuite de la lumière, embuscade) | À faire, selon `game-ai` (`AGENTS.md`) |

**Critère :** en test, les joueurs décrivent la peur ou la tension, pas seulement la difficulté.

### 53.4 Art provisoire

| Tâche | Statut |
| --- | --- |
| Liste des chapitres à art provisoire ou en dette | **Fait** (§28.1, §37.2) |
| Masquer les chapitres non finis derrière un statut « en préparation » | À faire (décision du propriétaire) |
| Terminer d'abord l'art des 4 chapitres de la campagne 1 | À faire |
| Production d'images | Bloqué ici | Génération par IA faite par le propriétaire (§45.1) ; aucun outil de génération d'image dans cette session |

### 53.5 Progression

| Tâche | Statut |
| --- | --- |
| Tableau « ce que le joueur gagne à chaque heure » | À faire |
| Récompenses visibles au hub (trophées, râteliers, colonie) | Prêt (§41, §43) |
| Option de mort définitive de l'équipage (choisie au début de la partie) et blessures durables | À faire |
| État de colonie et chantiers | Prêt (§6.3, §43) |

**Critère :** aucune heure de jeu sans gain visible ni décision.

### 53.6 Personnages

| Tâche | Statut |
| --- | --- |
| Quêtes des 16 membres d'équipage | **Fait** en conception (§8, §14-18) |
| Répliques réactives (mission ratée, colon mort, retour blessé) | À faire |
| Scènes collectives du mess | Prêt (§8.2) |
| Portraits expressifs (3 expressions par membre) | À faire |
| 20 origines d'Echo-9 avec capacités : réglage des capacités, répliques en jeu (§2.4) | Validé, à implémenter |

### 53.7 Rejouabilité

| Tâche | Statut |
| --- | --- |
| Contrats locaux, missions par planète, archives MIRE | **Fait** en conception (§6, §7, §21-26, §39) |
| Modificateurs de partie (cauchemar, mort définitive, ressources rares) | À faire |
| Difficulté à la carte (munitions, dégâts, fréquence des alertes), en plus des niveaux `story`, `standard`, `nightmare` existants (§45.2) | À faire |
| Terminaux de sauvegarde physiques et sauvegarde libre hors combat selon le registre (§0.3, §45.2) | À faire |
| Choix final ouvert par les choix cumulés (§5.7.1) : écrit, à implémenter | À faire |
| Continuer après la fin et nouvelle partie + (§45.2) | À faire |
| Score par mission | À faire |
| Coop locale et en ligne : un joueur remplace un membre IA de l'escouade (§45.1) ; coop locale du convoi déclarée inachevée dans `special-operations-v131.js`, aucun réseau dans le code | À faire |

### 53.8 Options et accessibilité

| Tâche | Statut | Constat dans le code |
| --- | --- | --- |
| Manette, tactile, trois difficultés, réduction des mouvements, volume | Présent | Mentions dans le code (manette 11 fichiers, tactile 66, difficulté 18, réduction des mouvements 79, volume 31) ; qualité non évaluée |
| Mode daltonien | À faire (validé §45.1) | Aucune occurrence |
| Version anglaise | Partielle : PR #44 intégrée ; entretien et retour FR fiabilisés dans le lot V186 (§55.1) | Dictionnaires explicites et catalogue automatique DOM/Canvas ; textes inconnus en français, revue linguistique et parcours complets encore ouverts |
| Remappage complet des commandes | À vérifier puis compléter (validé §45.1) | 4 fichiers mentionnent un remappage |
| Taille du texte | À faire (validé §45.1) | — |
| Sous-titres des sons importants | À faire (validé §45.1) | — |

### 53.9 Interface et lisibilité

| Tâche | Statut |
| --- | --- |
| Écran d'objectif toujours accessible | À faire |
| Carte du Tantalus et de la station | Prêt (§41, §42) |
| Audit « aucun écran technique pour le joueur » | À faire |

### 53.10 Présentation publique

| Tâche | Statut |
| --- | --- |
| Page de présentation, résumé en une phrase | À faire |
| Bande-annonce de 60 à 90 secondes issue de la tranche verticale | Bloqué par §53.1 |
| 6 à 8 captures soignées | Bloqué par §53.1 |
| Décision sur la diffusion au regard de la propriété intellectuelle (`LICENSE_NOTICE.md`) | Décision du propriétaire : entre gratuite publique et privée, non tranchée (§45.1) |

### 53.11 Tests de jeu

| Tâche | Statut |
| --- | --- |
| Protocole : 3 à 5 joueurs, sans aide, notes sur les blocages, l'ennui et la peur | Prêt |
| Grille de notes (moment, lieu, réaction, cause supposée) | Prêt |
| Première session | Bloqué par §53.1 |

**Suivi automatisé du 2026-11-09 :** le commit `8219837892fc8c5ede58f2c500a934192fea1ae0` réussit ses 4 094 tests Node (un test artistique optionnel ignoré), les 19 contrôles Chromium FR/EN et quatre workflows GitHub. La CI Excel reste à 14/15 : le préalable Jun/Asha atteint son plafond de 900 s murales alors que Jun progresse encore. Le [lot V187](../development/NATIVE_QA_RESOURCES_V187.md) qualifie un profil de ressources explicite, en conservant les limites natives, l'immobilité et l'arrivée physique exacte. Ce suivi ne remplace pas les sessions humaines prévues ci-dessus ; ses nouveaux résultats demandent leur propre tête vérifiée.

---

## 54. Ordre de travail

| Étape | Contenu | Pourquoi maintenant |
| --- | --- | --- |
| 1 | Renommage intégré par la PR #42 : Cocyte, Station Orphée, Hiémale et TR-0 ; identifiants historiques conservés (§52.3) | Étape réalisée ; les références documentaires des jeux sources gardent leurs noms |
| 2 | Emplacements audio étendus par la PR #43 ; génération des musiques M-01 à M-07 encore attendue du propriétaire | Les emplacements présents ne prouvent pas la livraison des morceaux |
| 3 | FR/EN intégré par la PR #44 : entretenir le catalogue, vérifier la tranche verticale (§53.1), puis bruitages prioritaires | Les textes de la tranche sont écrits dans les deux langues (§45.1) ; la couverture automatique ne clôt pas la revue des parcours |
| 4 | Réglage des sensations et de la tension (§53.3) | Rend la tranche convaincante |
| 5 | Premier test de jeu (§53.11) | Mesure avant d'aller plus loin |
| 6 | Masquage ou finition de l'art provisoire (§53.4) | Évite la mauvaise impression |
| 7 | Progression et personnages (§53.5-53.6) | Donne envie de continuer |
| 8 | Mode daltonien et autres options d'accessibilité (§53.8) | Élargit le public ; la traduction anglaise, elle, commence dès l'étape 3 (§45.1) |
| 9 | Présentation publique (§53.10) | Quand la tranche est prête |
| 10 | Campagnes annexes, dans l'ordre du §20 | Une fois le cœur du jeu solide |

---

## 55. Conception technique des décisions de cadrage — [PROPOSÉ]

Cette section traduit les décisions des §45.1 à §45.3 en travail sur le code. Le constat initial date du 2026-11-06 ; les états datés ci-dessous distinguent les éléments intégrés des propositions encore ouvertes.

**Contrainte commune :** `src/save.js` fait partie des `protectedGameplayBytes` de l'audit V179, comme `src/content-core-v50.js` (§52.3). Presque tous les points ci-dessous touchent la sauvegarde. Chaque lot qui la modifie demande donc une **levée de protection par le propriétaire** et un maillon d'audit, comme V183 pour le renommage. Les migrations restent additives : une ancienne sauvegarde sans le nouveau champ reçoit une valeur par défaut et ne perd rien.

### 55.1 Traduction français / anglais

| État courant | Suite à réaliser |
| --- | --- |
| `src/i18n-v185.js` possède les dictionnaires FR/EN et le réglage par appareil `atf-language-v185`, hors sauvegarde ; la langue du document suit le choix | Poursuivre l'écriture bilingue des nouveaux textes et la validation des parcours |
| `src/i18n-auto-v185.js` traduit les textes DOM, certains attributs et le texte Canvas à partir de `src/i18n-en-catalog-v185.js`, chargé à la demande en anglais | Compléter les textes inconnus à partir de relevés vérifiables ; contrôler le contexte, la mise en page et le vocabulaire |

**État relu le 2026-11-09 sur `ec2378df98a2d9af4394536a39ed943199ddcb8a` :** la **PR #44** est intégrée. Au-delà du titre et de Système, les traductions explicites couvrent notamment le créateur, les objectifs, les répliques de début de partie et les invites du hub ; le catalogue automatique contient 6 038 textes et 437 modèles. Les 13 tests V185 existent dans ce commit. Sa CI release réussit avec 4 074 tests passés et un ignoré ; ses 15 jobs Excel réussissent. Ces résultats ne certifient ni l'intégralité des traductions ni la fidélité artistique 1:1.

**Lot V186 (2026-11-09) :** correction de la restauration d'un texte dynamique au retour en français : un ancien original ne doit pas écraser une mise à jour, un texte vidé ou un attribut supprimé. Outil versionné de validation du catalogue, de rapport sur un relevé de textes observés et de fusion de traductions relues vers une proposition séparée. Quatre libellés de profils observés dans Système sont complétés en anglais ; le catalogue atteint 6 042 textes exacts et 437 modèles. Méthode, commandes et preuves : [entretien FR/EN V186](../development/I18N_MAINTENANCE_V186.md). Ce lot ne modifie pas les statuts historiques des classeurs Excel.

**Restent ouverts :** extraction et revue contextualisée des textes manquants, panneaux dont les lettres sont intégrées aux images, métadonnées documentaires Alien_base, parcours complets des missions et de la première heure, vérification mobile/lecteur d'écran et relecture par un anglophone. Un texte inconnu reste en français ; il n'est pas déclaré traduit sur la seule présence du mécanisme automatique.

**Ordre de travail :**

1. Maintenir le système et le réglage de langue intégrés, avec les tests de parité des clés et de changements de langue.
2. Relever et revoir les textes **écran par écran**, en commençant par la tranche verticale (§53.1). Le rapport V186 porte sur le relevé fourni, pas sur tous les textes possibles du jeu. Un texte non extrait reste en français ; il ne doit jamais afficher une clé brute au joueur.
3. Écrire tout nouveau texte directement dans les deux dictionnaires (décision §45.1). Les répliques des origines (§2.4) sont déjà rédigées en FR et EN.
4. Mettre `lang` du document à jour selon la langue choisie.

**Distribution :** les nouveaux modules sont livrés au joueur ; vérifier qu'ils passent `verify-public-release-v86.mjs` et `check:built` comme les autres modules d'exécution.

### 55.2 Coopération locale et en ligne

| Constat | Source |
| --- | --- |
| Une coop locale à deux existe : réglage `settings.coop`, `engine.setCoop()`, apparence et équipement propres à J2 (`coopAppearanceV126`), J2 prend la place d'un allié existant | `src/app.js`, `src/game-v52-runtime.js` |
| Plusieurs chapitres la forcent à `false` | `apc-convoy-runtime-v121.js` (`setCoop`), `black-cocoon-runtime-v121.js`, `c12-horde-runtime-v121.js`, `archive-relay-runtime-v122.js`, `legacy-operations-v131.js`, `mecha-missions-v131.js` |
| L'escouade compte Echo-9 et jusqu'à 4 alliés | `configureMissionSquad`, `MAX_SQUAD_SIZE = 4` |
| Supabase sert à l'authentification et à la synchronisation des sauvegardes, pas au jeu en temps réel | `cloud-auth-v119.js`, `cloud-sync-v119.js` |

**Proposition, en trois étapes :**

1. **Coop locale jusqu'à 5** : généraliser J2 en J2 à J5, chacun remplaçant un allié. Réglage du nombre de joueurs, une manette par joueur.
2. **En ligne, hôte qui fait autorité** : la partie de l'hôte simule tout ; les invités envoient leurs commandes et reçoivent l'état. Les canaux Realtime de Supabase servent de salon (présence) et de relais de messages (diffusion), avec le compte existant.
3. **Mesure avant engagement** : latence aller-retour, débit de messages et quotas du plan Supabase, comportement à la coupure. Si le relais Realtime ne suffit pas pour un jeu d'action, garder Supabase pour le salon et la mise en relation, et passer les échanges de jeu en pair à pair (WebRTC). Cette alternative n'est pas évaluée ici.

**Règles déjà décidées :** mort d'un invité (§45.2) ; l'invité garde objets et expérience, versés par la même transaction de fin de mission que l'hôte, jamais par un message réseau seul ; seule l'histoire de l'hôte avance. Les chapitres qui désactivent la coop restent en solo tant qu'ils ne sont pas adaptés un par un.

### 55.3 Sauvegarde en mission selon le registre

`AGENTS.md` distingue quatre états : campagne, reprise de mission, espace de travail Forge, checkpoints de playtest. La sauvegarde en mission passe par la **reprise de mission** (`src/game-production-resume.js`) et les checkpoints existants ; elle ne touche ni la Forge ni les checkpoints de playtest.

| Registre (§0.3) | Checkpoints | Terminal physique | Libre hors combat |
| --- | --- | --- | --- |
| Horreur | Oui | Oui | Non |
| Tension | Oui | Oui | Oui |
| Action | Oui | — | Oui |
| Calme | — | — | Oui |

- **Terminal** : objet du décor avec interaction depuis le sol praticable (règle des portes, §40.3), animation de quelques secondes pendant laquelle le joueur est exposé.
- **Hors combat** : aucun ennemi en alerte et aucune menace dans un rayon à définir ; sinon le bouton est refusé avec un message en jeu.
- Une donnée de reprise invalide renvoie au dernier checkpoint valide, jamais ailleurs.

### 55.4 Difficulté à la carte

`DIFFICULTIES` (`src/game-runtime.js`) définit `story`, `standard` et `nightmare` avec `enemyHealth`, `enemyDamage`, `enemySpeed`, `spawnMultiplier` et `rewardMultiplier`. L'opération stocke `difficulty` comme un identifiant (`src/save.js`).

**Proposition :** un quatrième identifiant `custom` qui lit des réglages séparés dans la sauvegarde : santé, dégâts et vitesse des ennemis, nombre d'apparitions, **munitions trouvées** et **fréquence des alertes** (ces deux derniers sont nouveaux). Le multiplicateur de récompense est calculé à partir des autres réglages, pas choisi librement. Une valeur hors bornes est ramenée à `standard`.

### 55.5 Mort de l'équipage : rendre la mort définitive optionnelle

**Constat :** la mort définitive **existe déjà**. Un membre dont la santé tombe à 0 passe en `deceased` et entre au mémorial (`save.memorial`) ; sinon il passe en `injured` avec des blessures datées (`src/save.js`).

**Proposition :** un réglage `crewPermadeath`, choisi à la création de la partie (décision §45.1). Désactivé, un membre à 0 passe en `injured` avec une blessure grave et une convalescence, au lieu de `deceased`. Le réglage peut seulement passer de « activé » à « désactivé » en cours de partie. Les parties existantes gardent le comportement actuel (activé), pour ne pas ressusciter des morts déjà inscrits au mémorial.

### 55.6 Origine d'Echo-9

Champ du profil joueur (`origin-01` à `origin-20`), choisi au créateur de personnage ; une valeur absente ou inconnue devient `origin-20` (§2.4). Les 19 capacités sont des modificateurs bornés, appliqués au déploiement comme l'équipement des membres (`attachCrewDeploymentV85` sert de modèle). Chaque capacité est réglée avec une même scène avant/après (`AGENTS.md`).

### 55.7 Registre, musique et directeur de tension

Le registre devient un champ de la fiche de mission. Il est lu par :

- le directeur de tension (§53.3) pour doser les apparitions ;
- l'audio : silence et alerte en Horreur, alerte plus tôt en Action ; emplacements à ajouter à `AUDIO_SLOTS_V77` (alerte, boss, fins, retour au calme, §45.1) ;
- la règle de sauvegarde (§55.3).

### 55.8 Continuer après la fin, nouvelle partie +

- **Continuer** : après l'épilogue, la même sauvegarde ouvre la carte galactique et les campagnes annexes (§13.5).
- **Nouvelle partie +** : crée un **nouveau** profil à partir d'une copie. La sauvegarde d'origine n'est jamais modifiée. Ce qui passe d'une partie à l'autre (origine, apparence, une partie de l'arsenal, archives MIRE débloquées) est à décider ; les choix d'histoire, la colonie et le dossier repartent de zéro.

### 55.9 Ordre conseillé

| Lot | Contenu | Pourquoi d'abord |
| --- | --- | --- |
| 1 | Traduction (§55.1), étapes 1 et 2 sur la tranche verticale | Tout nouveau texte doit naître dans les deux langues |
| 2 | Registre et sauvegarde (§55.3, §55.7) | Fixe le rythme de la tranche verticale |
| 3 | Mort optionnelle et origine (§55.5, §55.6) | Choix de création de partie |
| 4 | Difficulté à la carte (§55.4) | Réglages pour les tests de jeu |
| 5 | Coop locale à 5, puis mesures en ligne (§55.2) | Le plus lourd ; dépend des autres |
| 6 | Continuer et nouvelle partie + (§55.8) | Après la fin de la campagne principale |

Les lots 2 à 6 modifient la sauvegarde : chacun demande la levée de protection décrite en tête de section.

---

## 56. Priorités P0 et P1 — validées le 2026-11-12

**Décision du propriétaire (2026-11-12) :** la bible ne classait pas ses tâches par priorité. Le classement ci-dessous est validé. Il reprend l'ordre des §54 et §55.9 : la tranche verticale passe d'abord, puis les choix de création de partie et les options.

### 56.1 Cadre du lot V188

- **Levée de protection accordée** pour `src/save.js` et les autres `protectedGameplayBytes` touchés par ces priorités (§52.3, §55). Chaque octet modifié reçoit un reçu exact dans `scripts/audit-tantalus-priorities-v188.mjs`, qui prolonge la chaîne V183 → V187 sans réécrire les reçus existants.
- Les migrations restent **additives**. Une sauvegarde sans le nouveau champ reçoit une valeur par défaut et ne perd rien. Les identifiants existants sont conservés.
- Les valeurs chiffrées ci-dessous sont **[PROPOSÉ]** : elles ont été choisies prudentes et réglables, et elles restent à confirmer par les tests de jeu (§53.11). Une valeur peut être réglée sans nouvelle décision. Changer une règle demande une décision.
- **Outils de développement :** Spec Kit et Claude Code Game Studios ont été adoptés aux révisions de `.ai-tools/sources.json`. Leurs fichiers sont listés avec leur empreinte dans `.ai-tools/adopted-v188.json`. Ils restent source uniquement et sont refusés dans un build.

### 56.2 P0 — tranche verticale de la première heure

| # | Tâche | Source | Statut |
| --- | --- | --- | --- |
| P0-1 | Enchaînement prologue → Port-Méridien → briefing → Acte II (QZ-18) → retour, suivi par un état de campagne `storyCampaign` | §53.1, §11 | Fait (V188) : QZ-18 en tête et présélectionné au Commandement, compte rendu suivi ; test joueurs à faire |
| P0-2 | Environ 40 bruitages prioritaires synthétisés hors ligne, et provenance audio mise à jour | §53.2 | Fait (V188) : 40 sons originaux branchés ; provenance dans `LICENSE_NOTICE.md` |
| P0-3 | Emplacements musicaux alerte, boss, fins et retour au calme, avec leurs points d'accroche | §53.2, §55.7 | Fait (V188) : emplacements et accroches, `ending` compris ; morceaux Flow attendus du propriétaire |
| P0-4 | Écran d'objectif toujours accessible, en mission comme au hub | §53.9 | Fait (V188) : pause et touche M, FR/EN |
| P0-5 | Réglage du tir (recul, impact, réaction, son), mesuré avant et après sur une même scène | §53.3 | Fait (V188), mesuré avant/après ; ressenti à confirmer en test de jeu |
| P0-6 | Directeur de tension piloté par le registre | §53.3, §55.7 | Fait (V188) |
| P0-7 | Fausses alertes du détecteur de mouvement | §53.3, §14.5, §7.2 | Fait (V188) |
| P0-8 | Registre de mission (champ de la fiche) et sauvegarde en mission selon le registre : terminaux et sauvegarde libre hors combat | §0.3, §55.3, §55.7 | Fait (V188) : terminal placeholder dessiné au checkpoint sécurisé ; art définitif à produire |

### 56.3 P1 — après la tranche

| # | Tâche | Source | Statut |
| --- | --- | --- | --- |
| P1-1 | Comportements propres à chaque caste : plafond, contournement, fuite de la lumière, embuscade | §53.3 | Fait (V188) : drone (recul, plafond), rôdeur, embusqué |
| P1-2 | Mort définitive de l'équipage optionnelle, choisie à la création de la partie | §55.5 | Fait (V188) |
| P1-3 | Origines d'Echo-9 : choix au créateur et capacités bornées | §2.4, §55.6 | Fait (V188) : 19 capacités raccordées, dont 03, 11 et 16 selon les propositions du §56.6 ; fil caviardé lié à Asphodèle |
| P1-4 | Difficulté à la carte (`custom`) | §55.4 | Fait (V188) |
| P1-5 | Accessibilité : mode daltonien, taille du texte, sous-titres des sons importants, remappage des commandes | §53.8 | Fait (V188) ; palette Canvas dédiée pour les signaux d'état (§56.10) |
| P1-6 | Répliques réactives : mission ratée, colon mort, retour blessé | §53.6 | Fait (V188) : notification au retour et reprise au mess pendant 3 jours |

Les tâches suivantes ne font partie ni du P0 ni du P1 : coop étendue (§55.2), nouvelle partie + (§55.8), présentation publique (§53.10) et production d'images (§53.4, faite par le propriétaire).

### 56.4 Valeurs proposées — [PROPOSÉ]

**Sauvegarde libre « hors combat » (§55.3).** Le bouton est accepté seulement si les trois conditions suivantes sont réunies :

- aucun ennemi n'est en état d'alerte ou de poursuite ;
- aucun ennemi vivant ne se trouve à moins de **640 px** du joueur, soit environ un écran de large ;
- le joueur n'a reçu aucun dégât depuis **8 s**.

Sinon, le refus s'affiche en jeu : « Impossible de sauvegarder : menace à proximité. » Le terminal physique demande **3 s** d'interaction exposée. Il est refusé pour la même menace proche, mais il reste accepté si le joueur a reçu un dégât récent.

**Directeur de tension (§53.3).** L'intensité va de 0 à 100. Elle monte avec les dégâts reçus (+1 par point de vie perdu), les ennemis visibles à moins de 640 px (+4 par ennemi et par seconde, plafonnés à +12 par seconde) et le manque de munitions (+5 sous 20 % du chargeur et de la réserve). Hors contact, elle baisse de 6 par seconde.

Le directeur passe par trois phases :

1. **Montée** : les apparitions suivent le registre.
2. **Pic** : il s'enclenche quand l'intensité atteint 85 ou plus. Aucune nouvelle apparition.
3. **Relâche** : elle commence quand l'intensité redescend sous 30. Aucune apparition pendant une durée garantie de **30 s en Horreur, 20 s en Tension et 10 s en Action**. Le registre Calme n'a pas d'apparitions.

| Registre | Multiplicateur d'apparition en montée |
| --- | --- |
| Horreur | 0,5 |
| Tension | 0,8 |
| Action | 1,2 |

**Fausses alertes du détecteur (§53.3).** Elles se produisent en Horreur et en Tension seulement, toutes les **45 à 90 s** tirées au hasard, à condition qu'aucun contact réel n'ait eu lieu depuis 15 s. L'écho dure **1,2 s**. Il est placé à 300-600 px, dans la direction d'une source plausible : ventilation, porte ou machine. En se rapprochant, le joueur voit la cause sous forme d'un sous-titre : « Écho : ventilation ».

**Capacités des origines (§2.4).** Toutes les capacités restent modestes : de **10 à 15 %** quand elles sont chiffrées, une seule fois par mission quand elles sont ponctuelles. `origin-20` n'a pas de capacité.

| Origine | Valeur proposée |
| --- | --- |
| 01 | −15 % de dispersion en alerte |
| 02 | Panique des civils escortés −25 % |
| 03 | Première pièce lue : un indice de recoupement (§56.6) |
| 04 | Chargeur P-5000 : vitesse +10 % |
| 05 | Réparation des systèmes atmosphériques +20 % |
| 06 | Abris et sas sûrs signalés sur la carte |
| 07 | Vitesse en conduit +15 % |
| 08 | Soin d'un équipier +20 % |
| 09 | Fenêtre d'extraction +10 s |
| 10 | Une porte de la compagnie par mission ouverte sans piratage |
| 11 | +10 % de dégâts avec une arme UPP (§56.6) |
| 12 | Matériaux par caisse +10 % |
| 13 | Échos du détecteur : faux échos identifiés, rayon −30 % |
| 14 | Casiers ouverts sans outil |
| 15 | Réparation du M577 et des tourelles +20 % |
| 16 | +1 échantillon biologique par mission réussie (§56.6) |
| 17 | Ordres d'escouade exécutés 15 % plus vite |
| 18 | Dégâts subis par le véhicule escorté −10 % |
| 19 | Dégâts en couloir étroit +10 % |

**Bruitages prioritaires (§53.2), 40 sons synthétisés.** Ils sont générés hors ligne par `scripts/generate-audio-v132.mjs`, sans échantillon externe.

| Famille | Sons |
| --- | --- |
| Détecteur (4) | impulsion, contact proche, contact lointain, écho faux |
| Pas (5) | métal, grille, béton, eau, résine |
| Portes et sas (6) | porte qui s'ouvre, porte qui se ferme, porte verrouillée, sas qui se pressurise, sas qui se dépressurise, porte forcée |
| Ascenseurs (2) | départ, arrivée |
| Alarmes (3) | alerte générale, quarantaine, compte à rebours |
| Ambiance (4) | pluie extérieure, pluie sur tôle, ventilation, bourdonnement de relais |
| Cris par caste (8) | drone, guerrier, rôdeur, cracheur, Crusher, reine, facehugger, chestburster |
| Armes principales (8) | rafale du M41A, grenade du M41A, pistolet, fusil à pompe, smartgun, lance-flammes, rechargement, cliquetis à vide |

**Zone sûre à l'insertion (décision du propriétaire, 2026-11-14).** Un marine immobile à l'insertion mourait en 5 à 10 s sur `pair-001-mire`, `pair-001-frontier`, `special-cargo-brutal` et `special-alpha-bravo-doctrine` : les patrouilles éveillées partaient à 380-420 px. Valeurs retenues :

- les patrouilles éveillées partent à au moins **900 px** du point d'insertion (environ 17,6 m à 51 px/m) ; le nœud de départ est conservé au-delà de 900 + **100 px** de marge pour l'écart de patrouille. Les vagues différées restent sur leur nœud ;
- pendant les **4 s** de mission qui suivent la prise de contrôle, aucun ennemi n'attaque ni ne réduit la distance. Le directeur de horde ne prévient jamais avant 45 s : aucune vague ne tombe dans cet intervalle ;
- portée : missions génériques et missions de mode. Les chapitres d'histoire (QZ-17, QZ-18, convoi APC, C-12, Cocon noir), les essais de la Forge et les missions reprises gardent leurs rencontres et positions écrites ;
- **QZ-17 : délai de grâce seul, sans déplacement (décision du propriétaire, 2026-11-15).** Les patrouilles de `special-narrative-qz17` gardent leurs positions écrites (pas de placement à 900 px), mais les 4 s de grâce s'appliquent : aucun ennemi n'attaque ni ne réduit la distance, et un tir lancé pendant ces 4 s est retenu. Mesure d'un marine immobile, moteur de production en Node, niveaux 0/1/2 : premier dégât à 1,02 / 3,62 / 2,88 s avant, 5,43 / 7,48 / 6,75 s après. QZ-18, convoi APC, C-12 et Cocon noir restent entièrement exclus (ni placement ni grâce).

Code : `src/insertion-safe-zone-v188.js` (gardes `insertionSafeZoneAppliesV188` pour le placement et `insertionGraceAppliesV188` pour la grâce) et `compileMissionLevelActors` (`src/game-v52-level-runtime.js`). Tests : `scripts/verify-bugfix-insertion-v188.mjs`, `scripts/verify-bugfix-decisions-v188.mjs`.

**Escouade du « Faux fils » (décision du propriétaire, 2026-11-15).** §15.7 (ligne 3.2) fait jouer Jeri, synthétique en infiltration chimique. Le chapitre est désormais **solo** : aucun marine IA n'est déployé, la sélection d'escouade est gelée à un opérateur comme pour les autres opérations solo, le plan opérationnel affiche « Infiltration solo » et le journal de mission annonce « JERI EN INFILTRATION SOLO · aucun marine IA déployé ». Aucun objectif de la ruche ne supposait d'allié. Les autres chapitres de ruche (A.T.A.X.-Q, Éloïse) gardent l'escouade sélectionnée. Équilibrage de SAINT sans appui : à confirmer en test de jeu.

**Un checkpoint par phase dans Cargo brutal (décision du propriétaire, 2026-11-15).** La phase d'énergie part du checkpoint d'insertion ; le chargement (`cargo-loader`, « chargeur P-5000 »), l'escorte (`cargo-escort`) et la matriarche (`cargo-matriarch`) posent chacun un checkpoint à leur début. Il retient la position, la coque et l'hydraulique du P-5000 ; une reprise le replace à cet endroit, intact, avec au moins **45 %** de coque [PROPOSÉ], le marine à pied à portée pour remonter. Même décision pour l'extérieur planétaire : la plateforme de la balise, juste avant la passerelle d'extraction, pose le checkpoint `extraction-walkway` (« passerelle d'extraction ») ; une chute dans le gouffre sous la passerelle n'y renvoie plus à l'insertion. Code : `src/cargo-brutal-runtime-v67.js`, `updateExtractionWalkwayCheckpointV188` (`src/game-v52-level-runtime.js`).

**Phases du P-5000 adoucies (décision du propriétaire, 2026-11-15) — [PROPOSÉ].** Pendant les phases où le marine travaille avec le chargeur (dégager le couloir, escorter, récupérer et installer le noyau), seule la pression ennemie baisse : les attaques ennemies (hors boss) reviennent **1,6 fois** plus lentement et chaque vague du convoi compte **une créature de moins** (au moins une). Le P-5000, partagé avec d'autres chapitres, n'est pas modifié ; la matriarche et ses vagues non plus. Mesure, moteur de production en Node, même entrée scriptée (énergie rétablie, marine assis dans le chargeur, aucune autre commande) : couloir cargo, chargeur détruit à 12,6 / 6,4 s avant et 18,9 / 9,3 s après (niveaux 0 / 1 ; intact sur 120 s au niveau 2 dans les deux cas) ; escorte, coque restante à la perte du convoi 70/340 à 15,8 s avant, 89/340 à 18,2 s après. Code : `CARGO_LOADER_PRESSURE_V188` (`src/cargo-brutal-runtime-v67.js`).

**Recherche payée = recherche annoncée (décision du propriétaire, 2026-11-15).** `pair-030-mire` versait +15 R&D pour une récompense annoncée de +8. Les +7 venaient de la conséquence de campagne (`src/campaign-consequences.js`) : +3 pour l'objectif « cartographier les conduits » et +4 pour toute mission MIRE, ajoutés après la récompense sans être annoncés. Ce n'était pas un double paiement mais une seconde source, présente sur toutes les missions de paire (FRONTIER +3 à +7, MIRE +7 à +11). Décision confirmée par le propriétaire le même jour : le bonus est **gardé et annoncé**. Le plan d'opération affiche une ligne « BONUS R&D · +N R&D si succès (objectif +3, MIRE +4, archive MIRE +2) », et le débriefing montre ce qui est réellement versé. La conséquence garde aussi ses effets sur le monde, le niveau de recherche du hub et la pénalité d'échec.

**Répliques réactives (§53.6).** Les déclencheurs sont une mission ratée, un colon mort et un retour blessé. Il y a une réplique par déclencheur et par profil (humain et synthétique), en français et en anglais. La même réplique ne se répète pas pendant 3 jours de jeu.

**Lacunes de gameplay V188 (2026-11-15) — [PROPOSÉ].** Valeurs inventées par le projet, aucune ne provient d'une source franchise.

- **Cales en profondeur, escouade** (`SQUAD_DEPTH_LANES_V188`, `src/mission-depth-v188.js`) : les marines IA prennent un couloir à **−14, +14, −26, +26** unités du chef selon leur rang, rejoignent le couloir de l'ennemi qu'ils engagent et tirent avec les règles du joueur (bande de tir 22, recentrage de 30 %, bande d'attaque 24, conteneurs et caisses murales dans leur couloir).
- **Cales en profondeur, ennemis** (`ENEMY_DEPTH_SPREAD_V188`) : les ennemis qui poursuivent un marine sont classés par distance et décalés de **0, +10, −10, +16, −16** unités autour de son couloir (tous dans la bande d'attaque). **Un seul** engage au corps à corps à la fois ; les autres attendent à **150 px** dans leur couloir de flanc, avec une hystérésis de 40 px. Les castes à distance, les reines et castes trop grandes, les rôdeurs (`ambusher`) et coureurs (`runner`) gardent leur propre rythme. Mesure scriptée (cale cargo, Echo-9 immobile qui tire, 3 ennemis de mêlée) : Echo-9 mourait en 3,2 à 4,0 s sur 4 graines, sans gagner ; après, il tient 5,6 et 6,9 s sur deux graines et gagne les deux autres (4,7 et 4,8 s, 3 ennemis tués).
- **Projectiles ennemis en cale** : un crachat voyage dans le couloir où il a été craché ; les objets de la cale (conteneurs, caisses murales) l'arrêtent dans ce couloir, et il n'atteint un marine, un équipier ou une pose qu'à moins de 24 unités.
- **Embarquement défendu** (`DEFENDED_BOARDING_V188`, `src/mission-dropship-handover-v188.js`) : pendant l'embarquement final, les ennemis continuent d'avancer et d'attaquer ; chaque traçante de la tourelle de nez ou du marine de la soute inflige **14** dégâts jusqu'à **900 px** ; les marines sont blessés mais ne descendent pas sous **1 PV** (l'extraction est déjà acquise et ses récompenses fixées) ; les marines embarqués sont hors d'atteinte.
- **Alpha/Bravo** (`src/alpha-bravo-coop-runtime-v69.js`) : un marine qui tombe hors du niveau revient sur son dernier sol sûr. Un marine perdu (tué, non à terre) est remplacé par le joueur à la tâche de son binôme, comme un marine prend la place d'un camarade tombé (cohérent avec *Aliens*, 1986, où les survivants reprennent les rôles des disparus). Si même ce remplacement ne suffit pas, la mission échoue proprement : « binôme Alpha/Bravo perdu, tâche impossible » (`paire-alpha-bravo-perdue`).

**Comportements documentés par la franchise (2026-11-15).** Le jeu en suit l'esprit ; ce n'est pas une reproduction 1:1, et chaque adaptation est marquée.

| Comportement | Source | Ce que montre la source | Dans le jeu |
| --- | --- | --- | --- |
| Sang acide | *Alien* (1979), le sang du facehugger perce deux ponts ; *Aliens* (1986), « acid for blood », l'acide qui ronge l'armure d'un marine | Le sang des xénomorphes est un acide qui ronge le métal | [PROPOSÉ] Un xénomorphe tué hors de l'opération Lethe laisse une flaque de **6 s**, **5** dégâts par contact (règle des sols d'acide existante), au plus **6** à la fois, à sa profondeur en cale (`src/franchise-fidelity-v188.js`). Lethe garde ses flaques persistantes. |
| Guidage du smartgun M56 | *Aliens* (1986), Vasquez et Drake : bras articulé, viseur de casque | Le système oriente la rafale sur la cible désignée | [PROPOSÉ] La rafale du joueur s'infléchit vers l'ennemi visible le plus proche de l'axe, dans un cône de **25°** et à **700 px**. Le tireur choisit toujours sa direction ; pas de cible derrière lui ni à travers un mur. |
| Fusil à impulsions M41A | *Aliens* (1986), compteur à deux chiffres, chargeur de 99 coups | Chargeur 99 coups, compteur de munitions | Déjà conforme : chargeur de 99 (`content-core-v50.js`). Cadence de jeu 7,7 coups/s, réglage du projet. La cadence « 900 coups/min » souvent citée vient de documents dérivés (*Colonial Marines Technical Manual*, 1995), non vérifiés ici : **à définir** par le propriétaire avant tout changement, qui doublerait les dégâts de l'arme de départ. |
| Détecteur de mouvement M314 | *Aliens* (1986), Hudson annonce les distances en mètres, impulsion sonore qui s'accélère | Portée de l'ordre de la vingtaine de mètres, cadence liée à la distance | Déjà proche : 900 px ≈ 17,6 m, impulsion toutes les 0,2 à 1,2 s selon la distance (`src/motion-tracker-v160.js`). Portée exacte : **à définir**. |
| Meute, conduits et plafonds | *Alien* (1979), conduits ; *Aliens* (1986), « they're coming out of the walls », attaque par le faux plafond | Les xénomorphes contournent par les conduits et les plafonds | Déjà présent : entrées arrière par conduit (`enemy-tactics-v130.js`), drones au plafond et coureurs qui contournent (`caste-behaviors-v188.js`). Ajout : flanc en profondeur dans les cales (ci-dessus). |

Les numéros de scène et les dialogues exacts ne sont pas cités ; les films restent les sources de référence, les documents dérivés sont signalés comme tels.

**Échelle des créatures (décision du propriétaire, 2026-11-16) — [PROPOSÉ].** Les tailles s'alignent sur les tailles documentées de la franchise, à l'échelle du projet : **1 m ≈ 51 px**, le marine mesure **92 px (1,8 m)**. Un guerrier (≈ 2,3 m) est dessiné à **118 px**, la reine (≈ 4,8 m) à **245 px**. Les autres castes gardent la proportion au guerrier déjà déclarée par `ENEMY_DISPLAY_STATURES_V110` (facteur 118 / 156) ; une créature sans stature déclarée garde sa hauteur actuelle multipliée par ce même facteur. Les humains et synthétiques ne changent pas en mission (contrat visuel humain V133) ; au catalogue ils suivent la référence du marine (126 → 92). Ce sont des adaptations : aucune ne prétend à une fidélité 1:1.

Code : `src/creature-scale-v188.js` (`CREATURE_SCALE_V188`, `ENEMY_DISPLAY_STATURES_V188`, `withCreatureScaleV188`), composé dans `src/game-production-runtime.js` sous la couche de ressenti du combat (les comportements de caste, l'habillage QZ-17 et les cales voient les nouveaux corps) ; catalogue : `src/catalog-scale-v72.js`. Les images ne sont pas modifiées : la mission les met à l'échelle au dessin, le catalogue par son unité de monde. Test : `scripts/verify-creature-scale-v188.mjs`.

- **Dessin en mission** : une échelle mesurée par visuel, autour du point des pieds et du centre ; la pose de repos atteint la taille visée, une pose d'alerte, d'attaque ou de blessure ne la dépasse jamais. Un profil mesuré pendant le chargement d'un atlas est remesuré jusqu'à deux mesures concordantes.
- **Boîte de collision** : hauteur = hauteur opaque dessinée ; largeur = moitié centrale de la largeur opaque dessinée (queue, crête et membres tendus exclus, comme l'ancienne boîte du guerrier), 90 % pour un œuf, au moins 0,3 × la hauteur pour une silhouette fine (sans dépasser l'ancienne largeur). Les pieds et le centre horizontal sont conservés ; la boîte de cellule de sprite (V52) est remplacée par cette boîte. Deux règles existantes gardent leur verdict : « plus de 120 px de large = grande caste » des cales en profondeur, et « grand acteur ≥ 300 × 200 » du placement V72 (la reine garde 300 px de large). Exception mesurée : les deux reines juvéniles, sans stature déclarée, passent à ≈ 151–153 px et ne sont plus des « grands acteurs » ; elles restent inaptes aux cales (règle par identifiant).
- **Compensation de visée [PROPOSÉ]** : avec l'aide à la visée active, un tir qui aurait touché l'ancienne silhouette (mêmes pieds, même centre) mais passe à côté de la nouvelle est infléchi vers le haut du corps (30 % de la hauteur). Les dégâts ne changent pas ; aide désactivée, rien ne change.
- **Sauvegardes** : identifiants et format inchangés. Une reprise écrite avant V188 (coin supérieur de l'ancien corps) est reposée sur son sol.

| Profil (variantes du même nom) | Caste | Avant : dessin mission px (variantes) | Avant : boîte l×h | Après : dessin px [PROPOSÉ] (variantes) | Après : boîte l×h | Fidélité : apparence documentée / adaptation du projet / à définir |
| --- | --- | --- | --- | --- | --- | --- |
| `enemy-001-ovomorph` Ovomorph | egg | 55 (55–96) | 39×56 | 42 (42–72) | 27×42 | Documentée : œuf coriace à lobes, *Alien* (1979), *Aliens* (1986). Adaptation : 0,82 m (56 × 118/156). |
| `enemy-002-facehugger` Facehugger | parasite | 15 (15–20) | 79×28 | 15 (15) | 45×15 | Documentée : parasite à huit pattes et longue queue, *Alien* (1979). Adaptation : 0,3 m de haut au repos. Boîte corrigée : 28 px de haut pour un dessin de 15. |
| `enemy-003-chestburster` Chestburster | juvenile | 17 (17–23) | 35×20 | 17 (17) | 42×17 | Documentée : larve sortant de la poitrine de Kane, *Alien* (1979). Adaptation : 0,33 m. Boîte corrigée : 20 px pour un dessin de 17. |
| `enemy-004-drone-big-chap` Drone / Big Chap | stalker | 144 (88–144) | 54×146 | 118 (67–118) | 62×118 | Documentée : silhouette du « Big Chap », *Alien* (1979). Adaptation : 2,3 m, comme le guerrier. |
| `enemy-005-warrior` Warrior | assault | 135 (55–135) | 62×136 | 118 (41–118) | 56×118 | Documentée : guerrier à dôme lisse ou strié, *Aliens* (1986). Adaptation : **2,3 m = 118 px** (décision du propriétaire). Les variantes juvéniles (41 px) n'ont pas de stature déclarée. |
| `enemy-006-runner` Runner | runner | 80 (32–82) | 78×82 | 62 (24–62) | 55×62 | Documentée : quadrupède né d'un animal, *Alien³* (1992). Adaptation : 1,2 m au garrot. |
| `enemy-007-praetorian` Praetorian | guardian | 94 (94) | 52×74 | 159 (71–159) | 101×159 | Documentée : garde royale à grande crête, jeux *Aliens versus Predator*. Adaptation : 3,1 m ; elle était dessinée plus petite que le guerrier en mission. |
| `enemy-008-queen` Queen | royal | 202 (202–340) | 336×268 | **245** (153–245) | 300×245 | Documentée : reine à couronne et sac ovigère, *Aliens* (1986). Adaptation : **4,8 m = 245 px** (décision du propriétaire), sans sac ovigère. Variantes juvéniles à 153 px. |
| `enemy-009-crusher` Crusher | siege | 124 (68–152) | 116×100 | 115 (51–115) | 103×115 | Documentée : caste à bouclier frontal, jeux *Aliens: Colonial Marines* (2013) et *Aliens: Fireteam Elite* (2021). Adaptation : 2,25 m. |
| `enemy-010-spitter` Spitter | ranged | 138 (59–138) | 60×132 | 109 (45–109) | 53×109 | Documentée : cracheur d'acide, *Aliens: Colonial Marines* (2013). Adaptation : 2,1 m. |
| `enemy-011-lurker` Lurker | ambush | 32 (32–92) | 52×74 | 70 (24–70) | 116×70 | Documentée : chasseur bas, *Aliens: Colonial Marines* (2013). Adaptation : 1,4 m, silhouette longue (boîte large de 116 px). |
| `enemy-012-carrier` Carrier | carrier | 88 (88) | 52×74 | 133 (66–133) | 108×133 | Documentée : porteur de facehuggers, *Aliens versus Predator: Extinction* (2003). Adaptation : 2,6 m. |
| `enemy-013-ravager` Ravager | assault | 99 (99–158) | 52×74 | 147 (75–147) | 92×147 | Documentée : grande caste à faux, *Aliens versus Predator: Extinction* (2003). Adaptation : 2,9 m. |
| `enemy-014-boiler` Boiler | explosive | 70 (70–110) | 52×74 | 100 (53–100) | 70×100 | Documentée : caste gonflée d'acide, *Aliens: Colonial Marines* (2013). Adaptation : 2 m. |
| `enemy-015-prowler` Prowler | ambush | 116 (43–116) | 96×88 | 67 (32–67) | 38×67 | Documentée : rôdeur, *Aliens: Fireteam Elite* (2021). Adaptation : 1,3 m. |
| `enemy-016-burster` Burster | explosive | 124 (40–124) | 88×88 | 67 (30–67) | 46×67 | Documentée : caste explosive, *Aliens: Fireteam Elite* (2021). Adaptation : 1,3 m. |
| `enemy-017-monica-line` Monica Line | stalker | 88 (88–126) | 52×74 | 118 (66–118) | 78×118 | À définir : lignée du projet, taille du guerrier par défaut. |
| `enemy-018-specimen-six-line` Specimen Six Line | adaptive | 64 (64–122) | 52×74 | 118 (49–118) | 83×118 | À définir : lignée du projet, taille du guerrier par défaut. |
| `enemy-019-red-xenomorph` Red Xenomorph | rival-hive | 77 (77–104) | 52×74 | 118 (59–118) | 101×118 | À définir : ruche rivale rouge, référence à préciser ; taille du guerrier. |
| `enemy-020-k-series-yellow-xenomorph` K-Series Yellow | rival-hive | 143 (77–156) | 62×136 | 118 (59–118) | 56×118 | À définir : lignée du projet ; était dessinée à 156 px (≈ 3 m), ramenée au guerrier. |
| `enemy-021-neuro-xeno-drone` Neuro-Xeno Drone | controlled | 46 (46) | 52×74 | 34 (34) | 46×34 | Adaptation du projet, sans stature déclarée : × 118/156. |
| `enemy-022-xenoborg` Xenoborg | cybernetic | 100 (100) | 52×74 | 126 (76–126) | 53×126 | Documentée : xénomorphe cybernétique, *Aliens versus Predator* (1999). Adaptation : 2,5 m. |
| `enemy-023-atarax-ripper` ATARAX Ripper | armored | 60 (60–112) | 52×74 | 46 (46–85) | 37×46 | Adaptation du projet, sans stature déclarée. |
| `enemy-024-ripper-queen` Ripper Queen | royal | 199 (199–340) | 336×268 | **245** (75–245) | 300×245 | Adaptation du projet : classe des reines, 4,8 m. Variante juvénile à 75 px. |
| `enemy-025`…`enemy-034` concepts ACM et Crucible | concept-acm / concept-crucible | 29–101 (29–142) | 52×74 ou 82×112 | 22–76 (22–107) | 32–52 × 22–76 | Adaptation du projet (concepts originaux), sans stature déclarée : × 118/156. À définir : statures propres. |
| `enemy-035`…`enemy-040` pathogènes et ingénieurs (Trilobite, Deacon, Neomorph, Protomorph, Abomination, Mimic) | apex / stalker / assault / brute / adaptive | 36–95 (36–136) | 42×88 | 27–72 (27–103) | 21–45 × 27–72 | Documentée : Trilobite et Deacon, *Prometheus* (2012) ; Neomorph et Protomorph, *Alien: Covenant* (2017). Adaptation : hauteur actuelle × 118/156. À définir : statures propres (le Neomorph à 53 px reste bas). |
| `enemy-041`…`enemy-048` humains et synthétiques | security / assault / … | 96–112 | 42×88 | inchangé | inchangé | Hors périmètre en mission (contrat V133) ; catalogue × 92/126. |
| `enemy-049`…`enemy-052` faune (sanglier hôte, Korari, Ceto, vermine) | host / predator / aquatic / swarm | 21–75 (19–384) | 42×88 à 156×100 | 16–57 (14–290) | 44–121 × 16–57 | Adaptation du projet, sans stature déclarée. À définir : certaines variantes (Korari 218 px, Ceto 290 px) restent hors d'échelle. |
| `enemy-569-newborn`, `enemy-570-offspring` | apex | 160 / 165 | 58×118 / 52×124 | 121 / 125 | 36×121 / 38×125 | Documentée : le Newborn, *Alien, la résurrection* (1997). Adaptation : hauteur actuelle × 118/156. |
| `enemy-571-predalien` Predalien | royal | 142 | 96×126 | 107 | 32×107 | Documentée : *Aliens vs. Predator: Requiem* (2007), jeu *Aliens versus Predator 2* (2001). Adaptation : hauteur actuelle × 118/156 ; la fiche de caste du catalogue (188 → 142) est plus haute. À définir : une stature unique. |

Les castes du catalogue sans profil de mission suivent la même règle (`ENEMY_DISPLAY_STATURES_V188`, mêmes clés que V110) : Grid 118, Predalien 142, Abomination 159, Royal Guard 174, Pathogen Queen 245, reine titan 245, etc. La reine juvénile d'*Alien³* (28 px) n'est pas une reine.

Mesures (Node, `scripts/verify-creature-scale-v188.mjs`, scène scriptée : tir horizontal debout, accroupi et à 12 hauteurs de saut de 0 à 140 px, 14 tirs par distance, cible immobile) :

| Taux de touche | Aide désactivée, avant → après | Aide standard (0,62), avant → après (avec compensation) |
| --- | --- | --- |
| Guerrier à 200 px | 64 % → 50 % | 64 % → 64 % |
| Guerrier à 400 px | 64 % → 50 % | 71 % → 64 % |
| Guerrier à 600 px | 64 % → 50 % | 93 % → 93 % |
| Reine à 200 / 400 / 600 px | 100 % → 100 % | 100 % → 100 % |

Debout ou accroupi, chaque tir touche avant comme après ; les tirs perdus partent d'un saut, au-dessus de la tête plus basse du guerrier. Sans la compensation, l'aide standard donnait 50 % à 200 px.

Dépendances vérifiées : cloisons de mission de 132 px (guerrier, drone, runner, spitter passent, la reine non) ; conduits de 84 × 64 px (facehugger, chestburster et runner y tiennent, un guerrier debout non) ; entrées arrière de 116 px (mêmes entrées admises qu'avant ; le guerrier de 118 px dépasse leur cadre de 2 px, dans la tolérance de 4 px) ; règle des grandes castes des cales et placement des grands acteurs (verdict inchangé sauf les deux reines juvéniles) ; portée de mêlée (constantes inchangées, mesurée depuis le bord gauche : décalage ≤ (ancienne largeur − nouvelle) / 2, 3 px pour le guerrier, 18 px pour la reine) ; flaque d'acide (`max(48, 0,8 × largeur)` : 50 → 48 px pour le guerrier, 269 → 240 px pour la reine) ; détecteur de mouvement (point des pieds au centre : inchangé) ; arènes de boss (une reine plus petite tient dans les mêmes placements) ; silhouettes des cinématiques (`story-cinematics-v188.js` : seule l'ombre au plafond de la caméra de casque, vue subjective sans référence d'échelle, inchangée ; `insertion-cinematic-v188.js` : aucune créature).

Reste à définir : statures propres des créatures sans stature déclarée (concepts, pathogènes, faune, juvéniles) ; variantes faune hors d'échelle ; quatre profils sans hauteur dans la comparaison du catalogue (Red Xenomorph, Xenoborg, Deacon Line, Combat Synthetic : 0, déjà le cas avant V188) ; validation à l'œil par le propriétaire ; test de la tranche par des joueurs.

### 56.5 Suivi du lot V188

Réalisation, mesures, vérifications et limites : [rapport V188](../development/PRIORITIES_P0_P1_V188.md). Les statuts « Fait » ci-dessus désignent un raccordement au jeu vérifié par des tests Node sur le moteur réel et des contrôles Chromium. Ils ne remplacent pas le test de la tranche par 3 à 5 joueurs (§53.11), qui reste à faire.

### 56.6 Origines 03, 11 et 16 — [PROPOSÉ], implémenté le 2026-11-12

Le propriétaire a demandé une solution pour chaque question. Les trois propositions sont raccordées au jeu ; elles restent révisables.

| # | Origine | Problème | Solution proposée et implémentée |
| --- | --- | --- | --- |
| 1 | `origin-03` *Procès-verbal* | La capacité ne peut pas inventer des faits d'enquête | La **première pièce lue** dans la mission affiche un indice de recoupement. Chaque indice relie seulement des faits déjà écrits dans d'autres pièces du même dossier : heures 18:39 à 18:54, accès local du badge, télémétrie sans défaut, série QZ17. Il y a un indice par pièce de QZ-18 et des pièces de terrain, en FR et EN. |
| 2 | `origin-16` *Échantillons* | Le jeu n'a aucun système de prélèvement | La capacité est réinterprétée en **+1 échantillon biologique** (ressource `pathogen`) après chaque mission réussie. La règle actuelle reste respectée : un dossier documentaire comme QZ-18 n'en donne pas. Un vrai système de prélèvement pourra la remplacer plus tard. |
| 3 | `origin-11` *Matériel de l'Union* | Aucune pénalité n'existe pour les armes UPP | Je n'ajoute **pas de pénalité** aux 19 autres origines, car cela changerait l'équilibrage de tout le jeu. La capacité devient **+10 % de dégâts** avec une arme principale de fabrication UPP (Type 88, AK-4047…). |

**Reste à faire pour les origines :** le fil du dossier caviardé (`origin-20`, §2.4.3). Ses quatre fragments sont placés dans des lieux qui n'existent pas encore dans le jeu : la quête de DAVID-8R, CASSIUS en S2, la salle des relais d'Asphodèle et l'épilogue. **Proposition :** l'intégrer avec le second hub Asphodèle (§42). Le placer ailleurs déplacerait des scènes de la bible.

### 56.7 Refonte du prologue (V188, 2026-11-13)

Les ajouts **[PROPOSÉ]** du §4, CIN-20 et la réponse de Halloran (§5.2) sont désormais jouables. Ils reposent sur un lecteur de cinématiques Canvas 2D conforme au §10 : plans scriptés, cadres de dialogue avec les portraits relus de l'équipage, passables avec Échap, plan suivant avec Espace ou un clic. Les cinématiques sont revisibles dans Système → Cinématiques et ne donnent aucune récompense.

| Moment | Séquence | Déclencheur |
| --- | --- | --- |
| Nouvelle partie | CIN-00 *Ouverture* (8 plans, 65 s) | Avant le créateur de personnage, à chaque nouvelle partie |
| P-1 | CIN-01 *Le casier vide* (réplique de DAVID-8R, puis le casier scellé) | Confirmation du réveil |
| P-2 | `cin-p2` *La liaison prioritaire* (paquet de messages, puis Mara Vega) | Liaison rétablie à la console de l'exercice |
| Avant P-3 | CIN-02 *Le briefing* (Vega, Vega, Harlow, Velez) | Premier embarquement depuis la salle de briefing |
| P-3 | `cin-p3-wren` puis `cin-p3-ferro` (Lucia Ferro, Noor Okafor à la radio) | Arrivée au quai, puis fin du triage |
| Retour de QZ-18 | CIN-20 *Treize minutes*, puis Halloran ; ensuite `cin-20-rook` *La signature* | Premier compte rendu de QZ-18 lu |
| Fin du quai des vivants | `cin-doyenne` *La doyenne* : Asha présente Adèle Sarrazin, puis les quais, l'infirmerie, le processeur et le mur nord, et enfin la réplique d'Adèle sur la dette | Rapport final du quai, avant les Opérations |
| Acte III, départ du convoi | Manifeste du M577 (0 à 3 conteneurs, 6 places moins 2 par conteneur) | Lancement de `special-apc-convoy` sans manifeste signé |
| Acte III, C-12 | Coups dans le conteneur et « Notez l'heure. » | 13 s de défense, s'il y a au moins un conteneur |
| Retour de C-12 | CIN-31 *Le sas refermé*, d'après le manifeste ; colons ajoutés une fois | Première table tactique après C-12 |
| Interlude | CIN-40, puis une crise xénomorphe forcée (pont 2, quarantaine) ; une fois résolue, le choix détruire ou capturer, puis CIN-41 | Après CIN-31 |
| Acte IV, réveil | CIN-50 *Les dernières images* | Début du cocon noir |
| Retour de l'Acte IV | CIN-51 *Contrôle biologique* (NÉGATIF, Noor) | Première table tactique après le cocon noir |
| Acte I, prise de contrôle | CIN-10 *Les quais déserts* (peinture existante du dropship, pluie), puis Rook | Fin de l'insertion de QZ-17 |
| Acte I, route de maintenance | CIN-11 *Ouvert de l'intérieur* (berceau givré, fixations arrachées), puis Inez à la radio | Choix « Suivre la trace par la maintenance » |
| Retour de QZ-17 | `cin-qz17-retour` : les trois conclusions d'Inez | Première ouverture de la table tactique après QZ-17 |

Après QZ-18, la table tactique recommande l'Acte I (★) tant qu'il n'est pas terminé, conformément à la chronologie du §3.

**Textes écrits pour combler la bible — [PROPOSÉ] :**

- La réplique de Mara Vega qui coupe l'exercice : « Velez, on coupe l'exercice. Echo-9, rendez l'arme au pas de tir et montez en salle de briefing. » La règle de l'exercice V89 (retour au pas de tir) reste inchangée.
- Le nombre de messages retardés : 37 sur six jours, le dernier datant de 4 h.
- Les noms du personnel du quai nord dans CIN-20 : E. Okonjo, P. Lindqvist, S. Arenas, D. Haddad, K. Brandt. Ce sont aussi les noms à la craie de `story-quai-nord`.
- Les répliques de l'Interlude : Velez à la radio (CIN-40) ; le journal 02:14-02:31, BISHOP-9 et Inez (CIN-41).
- La réplique d'Asha qui présente Adèle : « Echo-9, voici Adèle Sarrazin. C'est elle qui tient le port ensemble. » La visite libre de la doyenne est adaptée en visite guidée, faute de hub Port-Méridien.
- La réplique de Rook sur la signature d'Asphodèle (tissage du §5.2) : « Le profil « priorité cargaison » n'a pas été activé au relais. Il a été autorisé à distance. La signature vient de la station Asphodèle. »
- Toutes les versions anglaises des répliques du prologue.

**Toujours à faire :**

- L'art définitif des plans (§29.1). Les décors actuels sont des placeholders en primitives Canvas.
- ~~L'interaction physique avec le casier `ECHO-8` dans la baie cryo~~ : **fait (V188)**. Le casier scellé est dessiné en primitives dans la baie cryo ; E affiche les faits établis jusque-là. Ces trois notes sont **[PROPOSÉ]** : sceau et abordage, puis quarantaine (après CIN-02), puis signature d'Asphodèle (après « La signature »). Le reste du fil `ship-cryo` (effets de Kessler, étiquettes de l'épilogue) dépend de la station.
- Une voix et un geste de pointage sur la carte (CIN-02).

### 56.8 Reconstruction de Port-Méridien (V188, 2026-11-13)

La table du §6.3 est jouable dans la vue Commandement. Les sept chantiers, leurs trois niveaux, leurs critères et leurs référents reprennent le tableau du §6.3. La sauvegarde ajoute `colonyV188` (niveaux investis et validés par chantier) ; les anciennes sauvegardes reçoivent une table vide.

| Règle du §6.3 | Mise en œuvre V188 | Statut |
| --- | --- | --- |
| Ouverture après C2 | Ouverture après QZ-18 (Acte II), C2 n'étant pas jouable | [PROPOSÉ] |
| Ressources et temps stratégique ; rien pendant une mission | Coût payé en ressources existantes, horloge avancée ; refus si une opération est en cours | [EXISTANT] V188 |
| Validation par une mission locale | Validation du plus ancien niveau en attente après une opération réussie sur Cocyte (`world-05-lethe`), en attendant les missions C1–C5 | [PROPOSÉ] |
| Échec : perte d'un niveau de fonctionnement | Opération ratée sur Cocyte : le chantier le plus avancé perd un niveau validé ; l'investissement reste | [EXISTANT] V188 |
| Population et chantiers actifs | 1 chantier en attente + 1 par tranche de deux personnes ramenées (3 civils du quai, colons du manifeste M577) | [PROPOSÉ] |
| Stabilité | +3 de stabilité de Cocyte par niveau validé | [PROPOSÉ] |
| Paliers | Survie, Rétablie (3 chantiers niveau 1), Autonome (5 chantiers niveau 2) ; Libre attend la fin « Le relais parle » | [PARTIEL] |
| Ressources régulières (Autonome) | +150 crédits et +10 alliage à chaque opération réussie sur Cocyte | [PROPOSÉ] |

**Coûts [PROPOSÉ] :** niveau 1 : 400 crédits, 20 alliage, 6 h ; niveau 2 : 900 crédits, 45 alliage, 5 recherche, 12 h ; niveau 3 : 1 600 crédits, 80 alliage, 12 recherche, 24 h.

**Toujours à faire :** les missions locales C1–C5 et les annexes, le recrutement de Nadia Bensaïd (palier Rétablie), la console physique dans la salle commune ou les quartiers, l'épilogue du palier Libre.

### 56.9 Interlude : Jun Park et routine d'alerte (V188, 2026-11-13)

- **Routine `alert`** : la crise forcée de l'Interlude met les seize PNJ en routine `alert` (`resolveNpcRoutineV62`). Correction : une crise marquée résolue ne maintient plus l'équipage en alerte.
- **Sauvetage** : Jun Park est dans le nœud de conduit `hub-life-support`. L'atteindre pendant l'alerte le ramène. Le choix détruire ou capturer attend les deux conditions ; l'objectif du hub indique celle qui manque. Les deux conditions sont sauvegardées pendant l'alerte.
- **Réplique [PROPOSÉ]** : « J'ai cru qu'elle était dans le conduit avec moi. » (EN : “I thought it was in the duct with me.”) Jun rampe ensuite vers l'infirmerie.
- **Adaptation [PROPOSÉ]** : Jun n'est pas dessiné dans le conduit ; le message et le journal stratégique marquent le sauvetage.

### 56.10 Mode daltonien : palette dédiée (V188, 2026-11-13)

- **Correction** : la première version appliquait au canvas et aux panneaux des matrices de *simulation* du daltonisme. Elles montraient au joueur ce qu'il voit déjà, sans rendre de contraste. Ce filtre global est retiré.
- **Palette** : `src/colorblind-palette-v188.js`. Les signaux d'état dessinés sur le canvas passent par une palette Okabe–Ito : portes verrouillée, ouverte et fermée des missions, du hub, des cloisons, du Bioforge et du relais, ainsi que le guide de déplacement bloqué ou libre. Ces couleurs diffèrent aussi en luminosité. Mode désactivé : couleurs d'origine, octet pour octet.
- **Mesure** : sous les trois simulations, l'écart minimal entre états passe d'environ 0,12–0,29 à au moins 0,4 (test `verify-accessibility-v188`).
- **Reste à faire** : les signaux d'interface HTML (panneaux) et les autres codes couleur du canvas, à recenser.

### 56.11 Prologue cinématographique (V188, 2026-11-13)

**Cinématiques (toutes, `story-cinematics-v188.js`)** :

- **Cadre** : format 2,39:1 entre deux bandes noires. Les légendes s'affichent dans les bandes, hors du mouvement de caméra.
- **Caméra** : chaque plan a sa caméra, soit un mouvement lent par défaut, soit un `camera` explicite. Le mode « mouvement réduit » fige la caméra.
- **Raccords** : les répliques d'une même conversation s'enchaînent sans fondu ; le noir n'intervient qu'aux changements de scène.
- **Sous-titres** : bas d'écran avec petit portrait, nom et réplique tapée. Une voix radio s'affiche en ambre, avec de la neige sur le portrait.
- **Image** : grain et vignettage.
- **Décors** en primitives, toujours des placeholders :
  - baie cryo : capsules horizontales à verrière givrée, la n° 3 ouverte, celle d'Echo-9 ;
  - pas de tir : couloirs, silhouettes de cible, lampes au sodium ;
  - salle holographique : projection qui scintille, équipage en contre-jour ;
  - quai : grues, conteneurs, projecteurs dans la pluie, reflets ;
  - triage : rideaux, scialytique ;
  - quartiers : lampe de bureau ;
  - soute du dropship : lumière rouge, harnais, hublots sous la pluie, secousses.
- **Nouvelle séquence** : CIN-03 *Descente sur Port-Méridien*, présentée au §4. Ses répliques sont **[PROPOSÉ]**.
- **Passe de cohérence des décors (2026-11-14)** : chaque décor a une échelle unique (personnes de 1,2 à 1,95 m), les quantités suivent le jeu et le canon, et le test `verify-cinematic-coherence-v188` les vérifie.
  - **Baie cryo (CIN-01 et salle du jeu)** : le plan et la salle montrent la même disposition : le casier ECHO-8, la porte des capsules de sauvetage, DAVID-8R, la capsule 03 ouverte contre le mur et les capsules 01, 02 et 04 au premier plan. La salle ajoute un poste de cryostase en tête de la capsule 03 **[PROPOSÉ]**.
  - **Casier** : un seul casier ECHO-8 scellé, aux proportions du jeu.
  - **Briefing (CIN-02)** : Harlow, Vega, Velez et Echo-9 autour d'une table de 3,1 m **[PROPOSÉ]**.
  - **Quai** : conteneurs de 10 pieds, Wren et trois habitants à l'arrivée, Asha et Adèle Sarrazin pour la visite.
  - **Triage** : le blessé allongé, Lucia Ferro à côté.
  - **CIN-11** : berceau QZ17 de 2,4 × 1,0 m **[PROPOSÉ]**, couvercle forcé vers l'extérieur, trois sangles arrachées, Echo-9 à la torche pour l'échelle.
  - **CIN-10** : Rook parle par radio, conformément au tableau de l'équipage.
  - **CIN-31** : les comptes du manifeste ne sont plus cachés par la bande du bas.

**Mise en scène en jeu (`ingame-staging-v188.js`)** :

- Des moments courts se jouent par-dessus le niveau vivant, sans changer d'écran : bandes cinémascope, étalonnage de l'image, sous-titres, puis retour du contrôle.
- Le monde continue de tourner ; seules les entrées du joueur sont retenues. Entrée passe à la suite, Échap passe la scène.
- L'habillage du niveau (boutons, bandeau d'objectif) s'efface pendant la scène.
- Étalonnages : hypersommeil (noir, flou froid, puis net), pluie (rideau animé) et alerte (pulsation ambre).
- Chaque moment se joue une fois par campagne : la sauvegarde ajoute `storyCampaignV188.beatsSeen`. Aucune récompense.
- Moments : réveil (P-1), interruption de la qualification (P-2), arrivée sur le quai et constat (P-3). Les textes sont au §4, **[PROPOSÉ]**.
- **Mouvement réduit** : pas d'animation de bandes, de pluie ni de transition de flou.

**Toujours à faire** : voix, plans de caméra déplacée dans le niveau (le hub suit le joueur), art définitif.

### 56.12 Salles hybrides 2D / 2,5D (V188, 2026-11-13)

Décision du propriétaire : certaines salles passent en **profondeur** (2,5D, déplacement au sol vers la caméra), les autres restent **de profil** (2D, hauteur, échelles, coursives, conduits). Cadrage Spec Kit : `specs/001-salles-hybrides-2d-25d/` (spec, plan, recherche, tâches).

- **Prototype** : le hangar du dropship, sans combat. Le rail actuel, le long du mur (portes, échelles, pupitres), est la limite du fond. W/S avancent vers la caméra ou reculent vers le mur, jusqu'à 80 unités.
- **Le UD-4L** quitte le mur : on le contourne par une allée étroite derrière lui, le long du mur, ou par l'avant. On peut passer sous la queue et sous le nez. Deux piles de caisses et un chariot (placeholders en primitives) créent les passages.
- **Lecture de la profondeur** : sprites jamais mis à l'échelle (décision du propriétaire). Décalage vertical, ombre au sol, sol plus sombre près du mur, repères au sol. Le dropship et les caisses masquent qui passe derrière eux ; le joueur masqué garde un contour en pointillé.
- **Interactions** : celles du mur (portes, annexes, pupitre d'amarrage, échelles) se font depuis le mur. L'embarquement se fait devant le UD-4L. Un PNJ répond dans sa bande de profondeur.
- **Échelles** : E s'accroche au pied d'une échelle, puis W/S montent. Les coursives restent en 2D.
- **Équipage** : Maksim Orlov tient son poste devant le nez du UD-4L. Les PNJ marchent dans l'allée avant le long du vaisseau et sur le rail ailleurs.
- **Portes** : annonce à l'approche (« SALLE EN PROFONDEUR · W/S : AVANCER / RECULER »). La cloison du réacteur ne se franchit que près du mur.
- **Sauvegarde** : `hub.depthV188` (profondeur dans la salle, champ additif) ; une ancienne sauvegarde revient au mur.
- **Tir futur** (non branché tant qu'il n'y a pas de combat en profondeur) : tir horizontal qui touche une cible dans une bande de ±22 ; le tireur se recale de 30 % vers elle.
- **Quai de Port-Méridien (P-3)** — deuxième salle en profondeur :
  - les postes de mission (lot de secours, triage, relais du sas, constat) restent contre le mur ;
  - la caisse de la rampe reste franchissable d'un saut près du mur, et se contourne par l'avant ;
  - des conteneurs, des fûts et une palette (placeholders en primitives) occupent le sol ;
  - le sas fermé barre tout le quai, du mur jusqu'à l'avant ;
  - pendant l'escorte, les trois habitants suivent Echo-9 en profondeur, en file, un pas derrière ; ils contournent un objet plutôt que d'y entrer ;
  - une pluie fine tombe sur le quai, comme dans CIN-03 ; la sauvegarde du quai garde la profondeur (`portMeridienV90.z`, additif).
  - **Passe de cohérence (2026-11-14)**, valeurs **[PROPOSÉ]** :
    - **Arrivée** : l'arrière du UD-4L est dessiné, rampe baissée sous deux projecteurs.
    - **Personnages** : Tomas Wren (gilet haute visibilité, tablette), Lucia Ferro (brassard à croix) et le blessé du quai nord, allongé sur la civière, la poitrine bandée. Les trois habitants attendent à côté du triage.
    - **Lot de secours** : il porte la croix rouge (médical) ou l'éclair (énergie), selon le choix.
    - **Sas** : la porte fait 2,6 m dans une cloison qui monte jusqu'au collisionneur, avec un gyrophare (ambre fermé, vert ouvert).
    - **Tailles** : conteneur ISO de 10 pieds, fûts de 0,9 m, palette de 1,2 m.
    - **Allées** : 20 de profondeur au minimum ; la palette ne barre plus l'escorte.
    - **Escorte** : les habitants s'arrêtent devant le terminal du constat sans le masquer ; les anciennes sauvegardes sont ramenées à ces places, jamais refusées.
    - **Panneaux** : chacun a sa version FR et EN (RAMPE · FRET / RAMP · FREIGHT, TRIAGE · HABITANTS / TRIAGE · RESIDENTS, RELAIS DU SAS / AIRLOCK RELAY, SECTEUR NORMAL ? / NORMAL SECTOR?).
- **Ordre entre personnages** : un PNJ placé devant Echo-9 le masque, puisque le joueur est alors dessiné avant l'équipage.
- **Pièces du prologue à bord (passe de cohérence 2026-11-14, `src/hub-prologue-rooms-v188.js`)**, valeurs **[PROPOSÉ]** :
  - **Baie cryo** :
    - la capsule de la salle devient la **capsule 03**, vidée, verrière levée ;
    - les capsules 01, 02 et 04 sont au premier plan ;
    - un poste de cryostase se trouve en tête de la capsule 03 : ambre pendant le réveil, vert ensuite ;
    - DAVID-8R se tient à portée de voix ;
    - la porte des capsules de sauvetage s'appelle désormais ainsi, pour ne pas être confondue avec les capsules d'hypersommeil ;
    - l'invite du bas nomme l'étape que sert E.
  - **Briefing** :
    - une projection de Cocyte et d'Asphodèle, avec le voyant QZ rouge, flotte au-dessus de la table ;
    - Velez donne ses consignes à la table, et non plus dans l'embrasure des archives ;
    - Vega, Harlow et Velez attendent à la table tant que CIN-02 n'a pas été jouée.
  - **Pas de tir** : il était déjà cohérent (9 cibles de 1,88 m, de 5,9 à 16,1 m) ; il n'a pas été modifié.
  - **Hangar** :
    - caisses de 1,2 m, sur une seule rangée ;
    - chariot près du nez du UD-4L ;
    - plus rien devant le sas ;
    - au sol : ancrages des patins, vanne de carburant avec son tuyau, zone « EMBARQUEMENT UD-4L ».
- **Cales de QZ-17 (Acte I), avec combat** — spec `specs/002-cales-qz17-profondeur-combat/` :
  - le pont bas des soutes dépressurisées, entre les deux sas, est la première section de mission en profondeur ;
  - trois rangées de conteneurs scellés marqués QZ17 (placeholders en primitives, cohérents avec CIN-31) laissent une allée le long du mur et deux allées vers la caméra ;
  - la couverture de caisses existante se franchit près du mur et se contourne par l'avant ;
  - **tir** : une salve horizontale touche un xénomorphe à ±22 de profondeur, Echo-9 se recale de 30 % vers lui, et un conteneur sur la ligne arrête la salve ; l'aide à la visée et le corps à corps suivent la même bande ;
  - **ennemis** : les rôdeurs de la dépressurisation rejoignent la profondeur d'Echo-9 en contournant les conteneurs ; une attaque, ou un projectile, ne porte qu'à ±24 ;
  - **détecteur** : il compte la profondeur dans la distance ;
  - **preuves, ravitaillement et sas** : accessibles depuis l'allée du mur ;
  - la reprise de mission garde la profondeur d'Echo-9, du marine coop et des xénomorphes.
  - Dans la cale, W/S ne servent plus à viser vers le haut ou le bas : le tir y est horizontal, décision (3).
  - **Passe de cohérence (2026-11-14)**, `src/qz17-level-dressing-v188.js`, valeurs **[PROPOSÉ]** :
    - **Conteneurs** : ils passent à la taille ISO 10 pieds (150 × 132 px, à 51 px par mètre). La soute n'en contient plus qu'**un**, QZ17-01, à l'avant. QZ17-02 et QZ17-03 sont empilés contre le mur du pont de service.
    - **La cargaison fantôme** : l'emplacement **QZ17-04** est vide, avec ses saisines coupées sous une grue dont l'élingue tranchée pend encore. Trois conteneurs scellés, comme la commande de l'Acte III, et un quatrième manquant.
    - **Sol** : rails d'arrimage et une palette basse comme couverture ; la couverture de caisses du rail est retirée. L'allée du mur fait 36 de profondeur, et deux obstacles sont toujours séparés d'au moins 1 m.
    - **Preuves et ravitaillement** : le courriel de logistique et les munitions sont déplacés hors de l'embrasure du mur arrière.
    - **Vide** : la bande de vide s'arrête au sas de la soute.
    - **Rôdeurs** : ils dorment derrière QZ17-01, dans l'emplacement vide et dans la bouche du conduit. Les castes inadaptées (Reine, Crusher, trop larges) sont reportées au pont de service.
    - **Berceau de CIN-11** : il est désormais physique, dans une alcôve de maintenance près de la sortie du conduit. Berceau QZ17-04 givré, couvercle forcé de l'intérieur, sangles arrachées. L'alcôve est scellée si l'on n'a pas pris la route de maintenance.
    - **« Quatre accès »** : un tableau dans le tube d'amarrage liste les quatre accès réels : sas principal, échelle de service, ascenseur de coque, conduit de maintenance.
    - **Limites** : l'ascenseur de service « B » (preuve du fragment de sceau) n'est pas placé ; le nombre de rôdeurs peut dépasser trois.
- **Limites** : Frontier Forge n'édite pas les salles en profondeur. Prochaines candidates : d'autres soutes ou cales de mission, après évaluation de QZ-17.


### 56.13 Manques de contenu (V188, 2026-11-15)

Audit bible contre code : [`AUDIT_CONTENU_V188.md`](../development/AUDIT_CONTENU_V188.md) (66 lignes au commit `250d81a` : 14 faites, 18 partielles, 32 manquantes, 2 bloquées par l'art). Comblés en partie dans ce lot, sans être terminés : front station Asphodèle S1-S4 et choix CASSIUS (§7.5), quatre quêtes de l'équipage (§8.4), temps de voyage (§13.6). Feature : `specs/005-front-asphodele-quetes/`. Tests : `scripts/verify-content-gaps-v188.mjs` ; contrôle Chromium sur fixture importée (déclaré dans la spec). À la fin de cette phase, aucun de ces éléments n'avait son art final. La continuation du 16 novembre 2026 ajoute les six illustrations de scène de §7.8 ; les décors, acteurs et animations jouables restent à produire.

Suite (spec 007, `specs/007-hub-asphodele/`) : hub Asphodèle atteignable (8 modules sur 12 de §42.2), 7 missions annexes, 6 contrats dont *Relais en dérive*, prédicat de *Transmettre*, CIN-70 à CIN-72, plaque de Kessler au casier d'Echo-8 (§7.6, §42.4). Tests : `scripts/verify-asphodele-hub-v188.mjs` ; QA Chromium au clavier `scripts/qa-asphodele-hub-v188.mjs` (fixtures déclarées). Rien n'est déclaré terminé.
### 56.14 Acte V, fins et épilogue (V188, 2026-11-15)

Manque n° 3 de l'audit comblé en partie : conseil de guerre, choix final, missions finales, face-à-face, trois fins, épilogue au Tantalus, générique et partie libre (§5.11). Feature : `specs/006-acte-v-fins/`. Tests : `scripts/verify-act5-endings-v188.mjs` (dans `test:priorities:v188`) ; contrôle Chromium de la fin « Les vivants, sans preuve » sur fixture importée (FR et EN), avec deux injections déclarées (checkpoint, fin de mission). Statut : **Partiel** — la course APC dédiée, la Reine dédiée et l'art restent à faire ; rien n'est déclaré terminé.

### 56.15 Matriarche de Soute et coque MANTA-6 (V188, 2026-11-17)

La continuation d'art produit quatre planches dédiées de la Matriarche de Soute : attente, marche, griffes/queue, rugissement/réaction, chacune de quatre poses. Le combat Cargo conserve les mêmes clips, événements, gabarit physique, phases, checkpoints et reprises. Les impacts visuels sont raccordés aux marqueurs natifs : griffes en frame 9, queue en frame 11. Seul l'acteur de cette rencontre prend la nouvelle identité ; les Reines du reste du jeu et le repli restent inchangés. Le statut local de Cargo redevient effectif dans le registre courant, avec `canonExact:false`.

Le chapitre existant Abysse Noir reçoit une coque MANTA-6 originale, bleu pétrole usé, en profil latéral. Elle remplace le rectangle provisoire sans changer la boîte 180 × 86, l'accès, la visée ou le tir. C'est une coque statique : les poses HADAL, la nage dédiée, le bestiaire aquatique, les animations de trappe/propulsion/dégâts et l'arc Nacre-7 proposé ne sont pas produits par cette livraison. La dette combinée `dedicated-hadal-manta-art` reste donc ouverte.

Les cinq PNG sont reliés à leurs prompts, empreintes et consommateurs dans [`CARGO_ABYSS_ART_PROVENANCE_20261117.json`](../development/CARGO_ABYSS_ART_PROVENANCE_20261117.json). La [planche de contrôle](../development/CARGO_ABYSS_ART_OVERVIEW_20261117.png) et le [rapport de revue](../development/CARGO_ABYSS_ART_QA_20261117.md) documentent les 16 poses et leurs limites. Il s'agit de designs originaux du projet à partir de ses références ; aucun modèle individuel de Matriarche ou de MANTA n'était fixé plus précisément dans la bible, et aucune certification canonique globale n'est ajoutée.

### 56.16 Scaphandre HADAL modulaire et posture immergée (V188, 2026-11-17)

Le chapitre local Abysse Noir reçoit trois PNG dédiés au scaphandre : trois torses, huit pièces de bras et gants, un bassin, six pièces de jambes et bottes, et un casque fermé avec joint cervical. Les 19 pièces disponibles se composent sur le rig humain existant ; une pose courante en emploie 15. Les matières reprennent l'équipement pressurisé du projet : tissu anthracite, plaques olive usées, raccords en laiton terne et visière opaque. Les pixels des trois sources sont conservés. Il s'agit d'un design original de Tantalus, sans modèle canonique individuel de HADAL fixé dans la bible.

Le raccord s'applique au véritable joueur admissible dans Abysse Noir, hors MANTA, sans modifier sa sélection persistante. Les trois sources basculent ensemble ; si l'une manque, les pièces natives sont conservées ensemble. La posture commune relie thorax, cou, bassin, bras et arme à la sonde d'oxygène existante, avec semelles et solveurs natifs. Le casque reste attaché au col ; il n'est pas déplacé seul. Cette posture vaut aussi pendant le repli. Le point de tir des anciennes poses aériennes peut donc changer, mais le projectile accepté, les mains et l'arme dessinée partagent le même point, indépendamment du chargement des images. Le gabarit physique de 42 × 92, les modes, les vitesses, la pression et les règles d'oxygène restent inchangés.

L'ancienne bande cyan de visière et le cadre provisoire sont omis seulement si le kit a effectivement été dessiné pendant la passe courante ; un reçu ancien ne suffit pas. Les autres acteurs, les tenues incompatibles, le neuro et les transits à contacts imposés gardent leurs exclusions ou contraintes natives. Les sources sont gérées par le cache d'apparence existant, sans ajouter de boucle d'animation ni de costume sauvegardé.

Un défaut de service révélé pendant cette intégration est corrigé : le déplacement Legacy court-circuitait l'avance des manipulations admises. Un appel à leur propriétaire natif permet maintenant au soin de se terminer en 2,2 secondes actives, avec un seul kit et 48 points de santé plafonnés. Pause, impacts, annulation et restauration conservent leurs règles. Aucune nouvelle règle d'annulation par intention clavier n'est ajoutée à Legacy.

Les poses de support, suspension, montée, descente, visée, tir, recharge et service utilisent les animations natives. Aucun nouveau cycle de battement de nage, animation de trappe/propulsion du MANTA, bestiaire aquatique ou chapitre de l'arc Nacre-7 n'est livré par ce raccord. La dette combinée `dedicated-hadal-manta-art` reste ouverte, le registre reste à 19 chapitres partiels et deux effectifs, et `canonExact` reste faux. Les preuves et leurs limites sont dans [`HADAL_ART_QA_20261117.md`](../development/HADAL_ART_QA_20261117.md), la [planche intégrée](../development/HADAL_ART_OVERVIEW_20261117.png) et la [provenance](../development/HADAL_ART_PROVENANCE_20261117.json).


### 56.17 Reine ailée de Broodstorm (V188, 2026-11-17)

Le chapitre local Broodstorm reçoit trois planches de quatre poses pour sa Reine ailée : battements de poursuite, vol retenu/réaction et perte de tenue en suspension. Les douze images reprennent la référence 36 du corpus Tantalus (`ref-36-queen-xeno-winged-2.png`) : crête noire métallique, corps biomécanique sombre, membranes orangées et queue articulée. La référence 37, dont l'angle et l'identité diffèrent, n'est pas mélangée à cette série. Les trois PNG conservent leurs pixels de génération. Ce corpus porte sur le design original du projet ; la génération ne certifie pas une identité de franchise « 1:1 ».

Le raccord est réservé au véritable acteur `legacy-queen-0` de Broodstorm, y compris après le passage natif de la phase de combat à l'extraction. Les images se chargent ensemble à l'entrée du chapitre. Une source absente, incomplète ou étrangère conserve le dessin natif entier. Les autres Reines, la Matriarche Cargo, les acteurs détachés et les autres missions restent exclus. Les battements et réactions ne modifient ni la boîte physique de 336 × 268,28125, ni la vitesse, les contacts, les dégâts, les ressources, les portes ou les sauvegardes.

Les hanches sont recalées à partir de repères anatomiques documentés. Une échelle uniforme par famille compense la différence de taille des dessins source ; les ailes ne déterminent jamais la taille du corps. La variation volontaire de posture pendant la mort reste visible. Les ailes et la queue prolongent les seules bornes de visibilité. La barre de santé conserve ses valeurs et son style ; son nouveau plafond fixe dégage les membranes sans suivre chaque battement.

Le contrôleur existant conserve les clips et leurs cadences : poursuite à 10 images par seconde, repos/réaction à 4 et mort à 7, avec la dernière pose maintenue jusqu'à la disparition native du corps. La réaction ordinaire de 0,24 seconde montre généralement la première pose du clip de repos ; disposer de quatre images ne signifie pas que chaque impact les joue toutes. Aucun nouvel événement d'attaque n'est associé aux images. Aucun atterrissage, chute physique ou nouveau comportement de boss n'est introduit.

La dette locale `dedicated-flying-queen-art` est close. Broodstorm reste partiel : `complete-modular-dropship-corpus` demeure ouvert. L'aire d'Echo Basin, la rencontre 2.4, la cinématique CQ-03, l'atterrissage et les actes ultérieurs restent distincts de ce chapitre existant. Le registre conserve 21 opérations jouables, 19 partielles et deux effectives ; aucune autre dette ni valeur `canonExact` n'est promue. Les snapshots historiques restent inchangés.

Les [mesures et la provenance](../development/BROODSTORM_QUEEN_ART_PROVENANCE_20261117.json), la [planche du rendu intégré](../development/BROODSTORM_QUEEN_ART_OVERVIEW_20261117.png) et le [rapport de vérification](../development/BROODSTORM_QUEEN_ART_QA_20261117.md) distinguent les dessins générés, les observations natives, les fixtures et les limites de validation.

### 56.18 Reine-Mère adulte rouge (V188, 2026-11-17)

Le chapitre existant « Le chant de la Reine-Mère » reçoit trois PNG dédiés : quatre corps de repos/anticipation, quatre corps d'émission/réaction/effondrement et quatre bras séparés. Une pose assemble un corps et ses quatre bras ; les douze pièces dessinées ne sont donc pas douze frames d'animation. Les deux grands bras et les deux petits gardent leurs propres attaches. Les membres lointains passent derrière le corps, les proches devant, puis l'ensemble est inversé pour l'autre direction.

L'identité vient du dossier `yhw:XEN-032` du corpus du projet et des photographies officielles de la Red Queen Mother de *Genocide* présentée par NECA : rouge cramoisi, crête allongée, cou côtelé, quatre bras, appendices ivoire et queue segmentée. Les vues en perspective d'une figurine ne définissent pas toutes les poses d'un adulte vivant en profil latéral. Le résultat est une adaptation documentée de cette référence ; `visual1to1:false` et `canonExact:false` restent inchangés. L'œuf Reine-Mère historique n'est pas utilisé comme anatomie adulte, et cette identité n'est pas assimilée à une Empress.

Le raccord concerne uniquement l'objet boss courant de cette opération. Les Chœurs, les gardes et les deux autres écosystèmes qui réemploient son identifiant conservent leur présentation. Les trois sources se chargent à l'entrée ou après une reprise réussie et sont admises ensemble ; une source manquante, incorrecte ou étrangère conserve le corps vectoriel entier. Le rendu ne charge pas les images et ne fait avancer aucune horloge.

Le moteur garde son corps physique de 170 × 210, ses 600 points de santé, sa protection par les trois Chœurs, ses quatre phases et ses vraies salves. La pose d'émission suit l'ajout effectif d'un projectile de l'acteur ; une transition de phase seule ne la déclenche pas. Son marqueur privé expire dans la mise à jour native, même sans dessin. Il n'est pas sauvegardé et ne se rejoue pas après un tour d'horloge ou une reprise réussie. L'origine physique du tir reste celle du combat existant ; elle n'est pas déplacée vers la bouche dessinée.

Une même échelle anatomique lie les huit corps aux quatre membres. Les appuis des poses repliées sont recalés au sol sans redimensionner l'acteur. Le nom, la barre de santé et l'avertissement jaune d'anticipation restent dans le passage natif, au-dessus de la composition. La mort lit la durée native de 1,2 seconde et conserve l'alpha 0,3. Seules les bornes de visibilité tiennent compte de la crête, de la queue et des bras ; les collisions restent inchangées.

La dette locale `dedicated-queen-mother-animation` est close par ce raccord. Le chapitre reste partiel : `complete-royal-cast` demeure ouvert, comme les lieux, cinématiques et rencontres proposés pour l'arc étendu de TR-0. Le registre conserve 21 opérations jouables, 19 partielles et deux effectives, avec ses snapshots historiques intacts. Les [sources et prompts](../development/QUEEN_MOTHER_ART_PROVENANCE_20261117.json), la [planche intégrée](../development/QUEEN_MOTHER_ART_OVERVIEW_20261117.png) et la [QA](../development/QUEEN_MOTHER_ART_QA_20261117.md) documentent les itérations rejetées, la composition, les contrôles exécutés et leurs limites.

### 56.19 Gardes du chapitre Reine-Mère (V188, 2026-11-17)

Les six gardes initiaux et les douze renforts possibles du chapitre existant reçoivent une présentation animée issue de l'atlas normalisé `xenomorph-praetorian-action-sheet.png`, déjà présent dans le projet. Le PNG de 1024 × 1024 et ses seize cellules de 256 × 256 sont réemployés intacts. Cette adaptation visuelle du rôle `guard` ne transforme pas les acteurs en une nouvelle caste : leurs descripteurs restent sans caste, sans profil de catalogue importé et sans changement de statut canonique. Les trois Chœurs restent vectoriels. Le registre garde `complete-royal-cast` ouvert et ses 21 opérations jouables, 19 partielles et deux effectives ; aucune dette supplémentaire n'est déclarée close.

Une échelle commune de 70/161 conserve les proportions entre les seize poses. Chaque cellule est dessinée entière, dans les deux directions, avec son ancrage horizontal anatomique et la ligne d'appui source à Y = 240. Le bassin n'est pas immobilisé verticalement : les flexions et l'effondrement restent visibles. Cette calibration manuelle ne mesure pas une taille canonique ; elle ajuste la présentation au corps physique natif de 58 × 70. La santé de 105, la vitesse de 72 et les règles de contact restent celles du garde existant.

Les cellules 0–3 servent au repos, 4–7 au déplacement, 8 à l'anticipation, 9 au contact accepté, 10–11 à sa récupération et 12–15 à la mort. Le déplacement est observé après le retour de toutes les couches natives du moteur, y compris celles qui retiennent l'acteur pendant la grâce d'insertion. Le cycle de marche dépend de la distance effectivement parcourue, à raison de 7,2 pixels par cellule. La vitesse déclarée, l'alerte ou une tentative de déplacement bloquée ne suffisent pas à l'avancer. L'événement de frappe du catalogue praetorian n'est pas importé : l'image de contact suit uniquement le retour positif de la vraie fonction de dommage native. Son marqueur privé dure 0,3 seconde et expire pendant la mise à jour, même hors champ.

Le chargement appartient à l'entrée et à la reprise réussie du chapitre. Une source absente, incomplète ou étrangère conserve le corps vectoriel entier. La disponibilité de cet atlas est indépendante de celle des trois sources de l'adulte. Les anciens objets après reprise, les Chœurs, le boss adulte et les deux autres écosystèmes sont exclus de ce raccord. Les données sauvegardées ne reçoivent ni distance d'animation ni marqueur de contact. Le nom, la barre de santé et l'ellipse jaune d'anticipation restent dessinés par leur propriétaire natif ; les sept pointes de la Reine-Mère ne sont pas appliquées aux gardes.

La mort lit les 1,2 seconde natives et conserve l'alpha 0,3. La dernière cellule est maintenue jusqu'à la disparition du corps. L'atlas ne possède pas de ligne de blessure distincte : les effets natifs restent responsables de ce retour visuel. Le mouvement réduit fixe les cycles ordinaires de repos et de marche sans supprimer l'anticipation, le contact ou la mort. Les bornes visuelles couvrent les cellules complètes et leurs miroirs, sans agrandir les collisions ni la portée d'attaque. Les [références et la provenance](../development/QUEEN_MOTHER_GUARD_ART_PROVENANCE_20261117.json), la [planche du rendu intégré](../development/QUEEN_MOTHER_GUARD_ART_OVERVIEW_20261117.png) et le [rapport de vérification](../development/QUEEN_MOTHER_GUARD_ART_QA_20261117.md) distinguent la calibration statique, les poses de contrôle et les événements réellement exécutés par le moteur.

### 56.20 Chœurs du chapitre Reine-Mère (V188, 2026-11-17)

Les trois cibles nommées CHŒUR 1, CHŒUR 2 et CHŒUR 3 du chapitre existant reçoivent une même présentation originale Tantalus. Une base basse à deux appuis fusionnés soutient une arche costale ouverte, étranglée en son milieu, avec une membrane bordeaux/mauve. Cette forme distingue les cibles de l'œuf, du garde et de la crête de l'adulte. Les références locales ont guidé les matières et le contraste ; elles n'établissent pas une anatomie de Chœur. Aucun nom de caste, lien à Genocide ou identité du Chœur d'Éloïse n'est attribué à cette création.

La planche intacte `assets/queen-mother/v188/choirs-original.png` fournit quatre cellules complètes de 627 × 627 dans un PNG RGBA de 1254 × 1254, soit 920 091 octets. Les quatre fonctions sont présence A, présence B, contraction au coup reçu et neutralisé. Elles emploient une échelle unique de 90/525 et les appuis de la base centrale mesurés par pose. La vue est presque frontale ; le miroir inverse l'asymétrie des lames. Il ne transforme pas cette vue en profil latéral documenté.

Le corps physique demeure 66 × 90, avec 110 points de santé, sans locomotion ni attaque propres au Chœur. Le recul générique produit par les dégâts natifs reste possible et inchangé. Le cycle discret A/B lit l'horloge existante à une cellule par seconde ; le mouvement réduit conserve A. La réaction lit le vrai `hurtClock`, sans marqueur privé, et la mort est prioritaire. La présence B est environ deux pixels plus basse, la réaction mesure 72 pixels et le neutralisé 37,2 pixels à l'échelle commune. Aucun agrandissement par pose ne masque ces proportions. Les franges rougeâtres et la quasi-opacité du corps source, majoritairement à alpha 253, restent conservées.

Les trois objets courants sont admis par leur identité, leur ID, leur rôle et leur indice natifs. L'admission n'est pas limitée à la phase « choirs » : le dernier cadavre reste illustré après le passage à « mother-1 », jusqu'à l'expiration native. Un ancien objet après reprise, une copie détachée, un garde, l'adulte ou une cible homonyme des deux autres écosystèmes ne reçoit pas cette présentation. Le chargement du Chœur reste indépendant de celui de l'adulte et des gardes ; une source indisponible conserve le dessin vectoriel entier.

Les effets de neutralisation restent ceux du chapitre : un seul indice est coché, la pression perd 16 avec plancher à zéro et le jalon existant est produit une fois. Le boss reste protégé tant qu'une cible subsiste ; la composante de pression liée à sa phase demeure après leur disparition. Les trois cibles ne deviennent ni des nurseries, ni des artères, ni des balises. La sauvegarde conserve les états déjà prévus ; une blessure passée n'est pas rejouée à la reprise et un cadavre conserve seulement son temps restant.

Le nom et la barre restent dans leur passage natif. Un éventuel avertissement résiduel conserve l'ellipse target inclinée à +0,18 radian, sans pointes royales ; cet état de compatibilité n'ajoute aucune attaque. Le corps neutralisé garde l'alpha natif 0,3 et la durée de 1,2 seconde, avec sa faible hauteur et les occultations possibles du monde. Les bornes de visibilité sont conservatrices et ne modifient ni collision, ni portée, ni ordre des acteurs.

L'adulte, les gardes et les trois cibles locales disposent ainsi d'un habillage illustré. Cela ne définit pas les « trois castes reliées » de l'arc proposé, ne produit ni les ondes, ni la vibration collective CQ-05, ni les lieux ou rencontres étendus de TR-0. `complete-royal-cast` demeure ouverte, avec 21 opérations jouables, 19 partielles et deux effectives ; aucune déclaration canonique n'est promue. Les [sources et choix de création](../development/QUEEN_MOTHER_CHOIR_ART_PROVENANCE_20261117.json), la [planche intégrée](../development/QUEEN_MOTHER_CHOIR_ART_OVERVIEW_20261117.png) et la [QA](../development/QUEEN_MOTHER_CHOIR_ART_QA_20261117.md) distinguent les prototypes de placement, les événements natifs, les rendus observés et leurs limites.

---

## Annexe de production — DLC Alien: Covenant V0.14

Le suivi détaillé du DLC est regroupé dans la [bible Covenant V0.14](../covenant/BIBLE_COVENANT_V014.md) et son [inventaire structuré](../covenant/BIBLE_COVENANT_V014.json) : personnages et variantes, lieux, armes, accessoires, véhicules, vaisseaux, terrains et planète. Chaque entrée distingue la source retrouvée, la présence dans le moteur, l’image disponible, son admission et les manques encore ouverts. Ces adaptations du film gardent leur provenance propre, distincte des campagnes originales décrites ci-dessus.

La consolidation parallèle de PR68 reste consultable dans son [index des DLC épinglé](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/16686e8681cc0370db3fa3df2967704ef1862155/docs/narrative/DLC_INDEX_20261126.md) et sa [fiche Covenant historique](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/16686e8681cc0370db3fa3df2967704ef1862155/docs/narrative/dlc/alien-covenant.md). Ses comptes datés conservent leur version ; l’annexe V0.14 les rapproche des sources effectivement récupérées et du suivi courant, sans modifier cette branche. La production d’une image et les résultats techniques ne certifient pas la fidélité 1:1.

