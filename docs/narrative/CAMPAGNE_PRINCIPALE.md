# Aliens: Tantalus Frontier — Bible des campagnes

> **Document de conception narrative, source uniquement.** Il n'est pas copié dans le build public.
> **Intrigue, lieux et personnages originaux du projet** (`provenance: tantalus-project-original`, `canonExact: false`). Aucune scène, aucun lieu et aucun personnage d'un film ou d'un jeu existant n'est repris. Les noms hérités d'un jeu existant dans le catalogue sont remplacés par des noms originaux (§1.5) ; les identifiants techniques restent inchangés pour préserver les sauvegardes.
> L'intrigue respecte les règles de l'univers *Alien* (§1.3). Les noms de la franchise restent la propriété de leurs ayants droit (`LICENSE_NOTICE.md`).

## Sommaire

- **Partie I — Campagne principale (Cocyte)** : §0 lecture · §1 cadre et prémisse · §2 personnages · §3 chronologie · §4 prologue · §5 enquête · §6 colonie Port-Méridien · §7 station Asphodèle · §8 quêtes du Tantalus · §9 opérations secondaires · §10 cinématiques · §11 raccordement · §12 points ouverts
- **Partie II — Campagnes annexes** : §13 voyager dans le Reach · §14 La Saison des Reines · §15 Directive zéro · §16 Les Bâtisseurs · §17 Fièvre noire · §18 Le banc d'essai · §19 le fil QZ17 · §20 synthèse de production
- **Partie III — Missions uniques sur les mondes du catalogue** : §21 principes et chronologie · §22 opérations Héritage et préquelles · §23 mondes sous licence · §24 mondes du projet · §25 sites frontaliers · §26 archives MIRE · §27 intégration
- **Partie IV — Besoins de production** : §28 méthode et socle présent · §29 campagne principale · §30-34 campagnes annexes · §35 archives MIRE · §36 missions par planète · §37 récapitulatif

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

**Echo-9 (« la Relève Echo-9 »)** — Marine colonial sorti d'hypersommeil pour remplacer l'équipe Echo-8, disparue sur la station Asphodèle. Apparence définie au créateur de personnage. Parle peu, décrit ses actions, garde toujours un trajet de retour en vue. Il ne sait de la mission que ce que le briefing lui dit : il découvre le reste en même temps que le joueur.

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
| **I. Voss** | QZ-18 | Contremaître dont le badge a signé la priorité de fret à 18:43 (`archive-relay-state-v122.js`). Disparu. |
| **Directrice Halloran** | Weyland-Yutani | Responsable régionale du réseau QZ. Ne s'adresse au Tantalus que par messages différés. Cite toujours une clause. |
| **CASSIUS** | Station Asphodèle | Système de gestion Seegson de la station. Applique la quarantaine à la lettre depuis des semaines, sans personne pour la corriger. Ni malveillant ni conscient : obéissant. |
| **Grue** | Crucible Salvage Compact | Capitaine récupératrice installée sur l'anneau extérieur d'Asphodèle. |

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

### CIN-00 · Ouverture — [PROPOSÉ]

60 à 75 s, passable.

| Plan | Image | Son / texte |
| --- | --- | --- |
| 1 | Noir. Une ligne de télémétrie verte. | Bip de relais régulier. |
| 2 | Relais QZ-18 sous la pluie de Cocyte. | `LETHE · RELAIS QZ-18 · 18:41` |
| 3 | Pupitre : un brouillon de détresse s'écrit, puis passe en `EN ATTENTE`. | Le bip ralentit. |
| 4 | Un badge sur le pupitre, nom illisible. Une main hors champ le prend. | Aucune voix. |
| 5 | Le message part : `18:54`. | `TREIZE MINUTES` |
| 6 | Orbite. La station Asphodèle, feux éteints. Un seul voyant rouge : `QZ · QUARANTAINE`. | Silence. |
| 7 | L'USS *Tantalus* entre en orbite, lumières de veille. | Thème principal (compositions originales, `assets/audio/`). |
| 8 | `ALIENS: TANTALUS FRONTIER` | — |

### P-1 · Intro — Réveil en cryostase — [EXISTANT]

Le poste de cryostase attend la confirmation ; DAVID-8R accueille la Relève Echo-9. Création du personnage. Tamsin Velez rappelle la règle : avant une sortie, on identifie l'objectif et la voie de retour.

**Ajout [PROPOSÉ]** — DAVID-8R, pendant le réveil : « Vous remplacez l'équipe Echo-8. Elle a abordé la station Asphodèle il y a trente et une heures. Le contact a été perdu à la sixième. Je n'ai pas d'autre information. » **CIN-01 « Le casier vide »** (20 s) : le casier `ECHO-8`, vidé et scellé.

*Ancrage Alien : réveil d'hypersommeil, relève d'une équipe perdue, synthétique de bord.*

### P-2 · Intro — Qualification au pas de tir — [EXISTANT]

`hub-opening-exercise-v89.js` : échelle, pas de tir, cibles, rétablissement de la liaison prioritaire.

**[PROPOSÉ]** La liaison prioritaire, rétablie à la fin de l'exercice, laisse passer un paquet de messages de Port-Méridien vieux de plusieurs jours, d'un coup. Le dernier date de quatre heures. Mara Vega coupe l'exercice.

*Ancrage Alien : communications retardées, colonie isolée.*

### CIN-02 · Le briefing — [PROPOSÉ]

Salle de briefing. Mara Vega projette Cocyte et la station.

> **Mara Vega** — L'Administration nous a réquisitionnés : code de quarantaine rouge, émis par Asphodèle, plus de contact avec la station depuis trois semaines. Nos ordres : rétablir le contact, évaluer, appliquer la quarantaine, évacuer si nécessaire.
>
> **Mara Vega** — La compagnie a ajouté une consigne : préserver le matériel sous scellés en transit. Elle est arrivée avec quatre jours de retard. Par leur propre réseau.
>
> **Inez Harlow** — Personne ne déclenche une quarantaine rouge pour une panne de relais.
>
> **Tamsin Velez** — Echo-8 est monté voir. On n'a plus de nouvelles. Port-Méridien appelle encore. On commence par ceux qui répondent.

*Ancrage Alien : réquisition des Marines, consigne de la compagnie, quarantaine.*

### P-3 · Intro — Le quai des vivants (Port-Méridien) — [EXISTANT]

`port-meridien-v90.js` (reçu existant `port-meridien:quai-des-vivants:v90`) : porter un lot au triage, assister un blessé, réalimenter le sas, rassembler trois habitants et les guider vers le sas éclairé.

**[PROPOSÉ]** C'est aussi l'intro du front colonie (§6). Premier choix « vivants ou matériel » : lot médical ou batterie de sas. Tomas Wren, en passant : « Les conteneurs scellés partent avant nous depuis trois semaines. » Lucia Ferro montre un blessé dont la poitrine est bandée : « Il est tombé malade après une nuit au quai nord. Il ne se souvient pas de la nuit. » Le joueur ne voit rien de plus. Noor Okafor, à la radio : « Ramenez-le en quarantaine. Pas au triage. »

*Ancrage Alien : premier signe du cycle biologique (hôte qui ne se souvient pas), évacuation de colons.*

---

## 5. Enquête — campagne principale

### 5.1 Acte I — « La cargaison fantôme » (QZ-17)

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

1. **CIN-10 « Les quais déserts »** (30 s) : dropship d'Orlov, approche sous la pluie. Rook : « Quatre accès. Aucun ne répond. Le détecteur est calme. Trop calme. »
2. Exploration verticale, peu de combats, beaucoup de signes : un conteneur réfrigéré marqué « échantillons géologiques », du givre à l'intérieur alors que le froid est coupé, des traces d'acide dans un conduit.
3. **Choix existant** : *suivre la trace par la maintenance* ou *sécuriser la preuve en quarantaine*.
   - Maintenance → l'alcôve : un berceau de transport réfrigéré, ouvert de l'intérieur. Contact avec un parasite (facehugger, déjà au catalogue).
   - Quarantaine → le fragment de sceau revient intact ; Inez peut l'analyser (annexe *Le sceau*).
4. **CIN-11 « Ouvert de l'intérieur »** (25 s) : sur la paroi du berceau, des fixations faites pour retenir quelque chose de vivant. Inez : « Ne concluez pas. Rapportez. »

**Retour** avec Inez : *qu'est-ce qui a bougé* (une charge vivante, réfrigérée, non déclarée), *qui ment* (le PDA et le courriel ne peuvent pas être vrais ensemble ; la boîte noire soutient le PDA), *que transportait-on* (**non établi** sans prélèvement).

*Ancrage Alien : cargaison biologique déguisée en fret, parasite, la compagnie qui ment par procédure.*

**Conséquence :** `story-qz17-route` = `maintenance` | `quarantine`.

### 5.2 Acte II — « Le dernier relais » (QZ-18)

**Statut :** **[EXISTANT]** — `campaign-story-v160.js`, `archive-relay-state-v122.js`.

Contenu existant : briefing « Le message arrivé trop tard » ; protocoles *Audit technique* (+2 recherche) ou *Prévention à bord* (+2 moral), versés seulement avec le dossier complet et un retour validé ; six pièces ; conclusion juste : *détresse retardée par la priorité de fret*. Brouillon saisi à 18:41, mis en attente à 18:42, libéré à 18:54 ; badge de I. Voss laissé à 18:39, utilisé à 18:43 sans image exploitable.

**Tissage [PROPOSÉ] :**

- Le message retenu (« Secours immédiat, personnel coincé au quai nord ») venait du quai nord de QZ-18, où partaient les navettes vers Port-Méridien. Les treize minutes ont laissé une navette partir avec un conteneur QZ17 et sans les blessés.
- Quatrième question optionnelle au retour, si l'Acte I est terminé : *« Quel fret avait la priorité ? »* — la série de scellés QZ17.
- Le profil « priorité cargaison » ne s'active pas au relais : il est **autorisé à distance par la station Asphodèle**. Rook identifie la signature. Cela débloque l'intro du front station.
- **CIN-20 « Treize minutes »** (40 s) : Asha Mbaye lit le message libéré à 18:54. Les noms du personnel du quai nord défilent. Pas de musique.
- Mara Vega transmet le dossier par le seul canal disponible, le réseau QZ. Réponse différée de la Directrice Halloran : « Priorité cargaison maintenue, conformément à la clause d'acheminement. Toute ouverture de scellé engage la responsabilité de l'unité. »

*Ancrage Alien : la compagnie contrôle les communications ; la vie humaine passe après le contrat.*

### 5.3 Acte III — « Corridor de feu » (M577 → C-12)

**Mission A · Ramener le blindé — [EXISTANT]** (`campaign-convoy-story-v161.js`, chapitre `special-apc-convoy`) : ordre de convoyage, manifeste du M577, trois voies, barrages, tourelle, Crushers et Reine en barrage final (`apc-convoy-state-v121.js`), bilan au retour.

**Mission B · Une sortie plutôt qu'une victoire (C-12) — [EXISTANT]** (`campaign-lethe-story-v163.js`) : relais, quatre secondes d'avertissement, quarante-cinq secondes de rétablissement, sas à droite.

**Tissage [PROPOSÉ] :**

- **Le manifeste du M577 est le choix moral de l'acte.** La consigne de la compagnie exige de ramener trois conteneurs scellés du complexe ; Asha demande des places pour les ouvriers retranchés à C-12. Chaque conteneur retire deux places.
- Pendant les 45 secondes de C-12, si un conteneur est à bord, il **frappe de l'intérieur** (son seul). Inez : « Notez l'heure. »
- **CIN-31 « Le sas refermé »** : les rescapés descendent à Port-Méridien, ou les conteneurs partent sous scellés vers le Tantalus, sur ordre. Écran de quarantaine du Tantalus : `CONTRÔLE BIOLOGIQUE · 1 ANOMALIE`.

*Ancrage Alien : APC, horde, Reine, choix entre fret et vivants.*

**Conséquence :** `story-m577-manifest` = colons (0-6) et conteneurs (0-3). Les colons ramenés rejoignent la population de Port-Méridien.

### 5.4 Interlude — « Quarantaine » (à bord du Tantalus) — [PROPOSÉ]

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

- **CIN-50 « Les dernières images »** (35 s) : caméra casque dégradée. Echo-9 suit la destination absente du bon de QZ-17 jusqu'au **dépôt**. Silhouette au plafond. Coupure. La capture n'est pas jouée : elle reste « sans témoin exploitable », comme dans le code.
- Dans la galerie basse : des **berceaux réfrigérés de la série QZ17**, vides, et des cocons humains (le libellé « COCON HUMAIN » existe déjà dans `hive-missions-v131.js`) portant des badges de Port-Méridien et de QZ-18. **Révélation :** le dépôt n'expédiait pas des organismes, il les **élevait**. Les conteneurs amenaient des œufs ; les disparus de la colonie servaient d'hôtes. La priorité de fret gardait ces départs et ces disparitions hors des registres.
- Un enregistreur fixé aux berceaux porte la signature de la station Asphodèle : les ordres de livraison venaient de là (lien avec S2-S3).
- **CIN-51 « Contrôle biologique »** : scanner, Noor Okafor attend. `NÉGATIF`. « Bon retour. Cette fois, je l'écris. »

*Ancrage Alien : cocons, hôtes humains, ruche nourrie par la compagnie, contrôle biologique.*

### 5.6 Acte V — « Non viable »

**Statut :** **[PARTIEL]** comme base — le registre `special-operations-v131.js` rattache `last-course-tantalus` au chapitre `special-apc-convoy`, déjà utilisé à l'Acte III. Un Acte V distinct, sa course et la poursuite de Reine restent **[PROPOSÉ]**.

**Situation [PROPOSÉ] :** Halloran déclare Port-Méridien **non viable** au titre de la charte, avec effet à l'arrivée d'une équipe de récupération de la compagnie. L'équipe (commandos Weyland-Yutani, déjà au catalogue) vient « sécuriser les actifs » du dépôt et de la colonie. Pendant ce temps, la ruche du dépôt, privée de livraisons, sort vers la surface et coupe la route du complexe au port.

1. **Conseil de guerre** au Tantalus : chaque membre dont la confiance est *solide* propose un avantage (tourelles de Sanaa, blindage de Cal, fenêtre d'Orlov, route de Leila).
2. **Décision de Mara Vega**, selon les preuves réunies : laisser la compagnie récupérer le dépôt (l'ordre reste ambigu, la consigne de préservation est écrite), ou bloquer l'équipe de récupération et protéger la colonie.
3. **CIN-60 « Dernier départ »** : le M577 quitte le complexe sous la pluie avec les derniers ouvriers.
4. Nouvelle course APC **[PROPOSÉ]**, à construire à partir du chapitre existant.
5. Point médian **[PROPOSÉ]** : un pont cède ; lâcher la remorque de fret ou celle des colons en retard.
6. Poursuite de Reine **[PROPOSÉ]** : la Reine du dépôt, nourrie par les livraisons QZ17.
7. Arrivée aux murs de Port-Méridien : la course débouche sur C5 (§6.2).
8. Si Vega a bloqué la compagnie : face-à-face au quai avec l'équipe de récupération. Le joueur ne gagne pas en tirant : il gagne si le dossier est assez solide pour que les commandos reçoivent l'ordre de se retirer (ou si l'ICC est saisie via Asphodèle, §7).

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

**[À DÉCIDER]** Identité du signataire du badge. Option A : jamais établie (on accuse un système, pas une personne). Option B : établie avec 6 pièces sur 7, le texte rappelant ce qui reste non prouvé. Recommandation : B.

**Fins [PROPOSÉ] :**

| Fin | Condition | Résultat |
| --- | --- | --- |
| **« Le relais parle »** | Vega protège la colonie + dossier ≥ 5 pièces + Asphodèle reprise | Le dossier part vers l'ICC et les Marshals coloniaux depuis Asphodèle. La clause de non-viabilité tombe si la colonie a atteint le palier *Autonome*. Port-Méridien garde sa charte. |
| **« Le fret d'abord »** | Vega laisse la compagnie récupérer le dépôt | La colonie passe sous administration de la compagnie. Inez démissionne. Le dossier est classé « incident technique ». |
| **« Les vivants, sans preuve »** | Vega protège la colonie + dossier < 5 pièces | La colonie tient cette nuit-là, mais la clause s'applique. Vega est relevée à l'arrivée. |

### 5.8 Épilogue — « Ce que le retour devra raconter » — [PROPOSÉ]

Jouable, sans combat. Visite du Tantalus, de Port-Méridien et, si elle est reprise, d'Asphodèle. Chaque personnage a une réplique finale selon la fin. Le Tantalus se prépare à repartir : la baie cryo rouvre ses caissons. Sur le casier de l'Echo-8 : `RETOUR CONFIRMÉ` ou `POSTE LIBÉRÉ` (§7.4).

---

## 6. Front colonie — Port-Méridien : sauver, puis reconstruire

### 6.1 Concept

Port-Méridien est le seul port civil de Cocyte encore habité. Sa charte peut être retirée s'il est déclaré non viable. Le joueur doit d'abord **le sauver** (tenir, soigner, contenir l'infestation, évacuer), puis **le reconstruire** jusqu'à ce qu'il remplisse seul les critères de viabilité : air, eau, énergie, communications, défense, population.

C'est ce qui relie la reconstruction à l'intrigue : **chaque chantier terminé retire un argument à la compagnie.**

**Raccordement [PROPOSÉ] :** la colonie utilise les valeurs stratégiques déjà présentes par monde (`stability`, `infestation`, `quarantine`) et les ressources existantes (`credits`, `alloy`, `medical`, `research`, `fuel`). Les conséquences d'opération (`campaign-consequences.js`) modifient déjà stabilité et infestation ; la reconstruction ajoute des chantiers qui consomment ces ressources.

### 6.2 Missions

**Intro**

| ID | Titre | Statut | Résumé | Ancrage Alien |
| --- | --- | --- | --- | --- |
| `colony-intro-quai` (ID proposé) | **Le quai des vivants** | Séquence **[EXISTANT]** / raccordement **[PROPOSÉ]** | Triage, blessé, sas, trois civils (`port-meridien-v90.js`). Rencontre de Tomas Wren et Lucia Ferro. | Évacuation de colons, premier hôte. |
| `colony-intro-doyenne` | **La doyenne** | **[PROPOSÉ]** | Asha présente Echo-9 à Adèle Sarrazin. Visite du port : quais, infirmerie, processeur atmosphérique, mur nord. Adèle montre la dette de la colonie envers la compagnie : « S'ils nous déclarent non viables, ils reprennent tout, nous compris. » | Colonie endettée envers la compagnie. |

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

### 6.3 Reconstruction — [PROPOSÉ]

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

---

## 8. Quêtes du Tantalus — [PROPOSÉ]

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
| `ship-bioforge` | **Ce qu'on garde en vie** | Bioforge | Débat Inez / BISHOP-9 sur la conservation des spécimens ; ouvre l'accès narratif à la Bioforge (**[PARTIEL]** comme système). |

### 8.3 Recrutement

| Recrue | Titre | Front | Résumé |
| --- | --- | --- | --- |
| **Mara Voss « RIVET »** | **Le même nom** | Station | Ancienne du chantier orbital ; elle répare la station. Elle porte le nom du contremaître I. Voss. **[À DÉCIDER]** lien familial ou homonymie. |
| **Nadia Bensaïd « SUTURE »** | **Pas de blessé sans extraction** | Colonie | Venue d'une colonie isolée ; rejoint l'équipage quand Port-Méridien atteint *Rétablie*. |
| **Jonas Reed « BASTION »** | **Sécurité embarquée** | Enquête | Ancien agent de sécurité de cargos ; il a convoyé des scellés QZ17 sans savoir ce qu'ils contenaient. Témoignage au dossier. |
| **Jun Seo « BALISE »** | **Itinéraires terrestres** | Colonie | Connaît les routes de convoi ; le recruter avant l'Acte III facilite le corridor. |

---

## 9. Opérations secondaires

Classement d'après le registre courant `special-operations-v131.js`, utilisé par `app.js`. Il complète le registre historique `special-operations-v67.js`, dont les anciens statuts `missing` ne décrivent pas les chapitres V131 aujourd'hui raccordés. Les placements narratifs restent proposés.

### 9.1 Liées à Cocyte

| Opération | Statut | Place | Accroche [PROPOSÉ] | Ancrage Alien |
| --- | --- | --- | --- | --- |
| **Cargo Brutal** | Chapitre **[EXISTANT]** / promesse **[PARTIEL]** | Avant Acte I | Un cargo civil en route vers Port-Méridien transporte un conteneur QZ17 mal scellé. L'art dédié de la Matriarche manque encore. | Cargo infesté. |
| **Systèmes de survie Alien** | **[EXISTANT]** effective | Entre Actes I et II | Évasion d'un poste médical en quarantaine près du port ; mécaniques réutilisées dans l'interlude et S3. | Auto-destruction, soudure, acide. |
| **Doctrine Alpha / Bravo** | **[PARTIEL]** | Avant C1 ou C5 | Défense de colonie à cinq routes, quatre membres minimum : tenir Port-Méridien. | Escouade de Marines. |

Opération Abysse Noir et Broodstorm sont désormais placés dans la campagne annexe 1 (§14).

### 9.2 Opérations intégrées aux campagnes annexes

Les chapitres Mire Archive 001, Protocole Z-110, Jeri, Éloïse, A.T.A.X.-Q, Le chant de la Reine-Mère, Talos contre le Titan, LV-XENO, Pangaea, Opération Abysse Noir et Broodstorm sont tous **[PARTIEL]** et `playable: true` dans `special-operations-v131.js`, raccordés par `content.js`, avec des limites d'art dédié ou de campagne étendue. Ils ne sont plus classés comme « archives MIRE » : chacun prend place dans une campagne annexe de la Partie II (tableau §13.4). Leur `worldId` actuel (`world-05-lethe`) ne change pas tant que le déplacement proposé n'est pas réalisé dans les données.

---

## 10. Cinématiques

| ID | Titre | Partie | Durée | Statut |
| --- | --- | --- | --- | --- |
| CIN-00 | Ouverture | Titre | 60-75 s | [PROPOSÉ] |
| CIN-01 | Le casier vide | Prologue | 20 s | [PROPOSÉ] |
| CIN-02 | Le briefing | Prologue | 45 s | [PROPOSÉ] |
| CIN-10 | Les quais déserts | Acte I | 30 s | [PROPOSÉ] |
| CIN-11 | Ouvert de l'intérieur | Acte I | 25 s | [PROPOSÉ] |
| CIN-20 | Treize minutes | Acte II | 40 s | [PROPOSÉ] |
| CIN-31 | Le sas refermé | Acte III | 30 s | [PROPOSÉ] |
| CIN-40 | Jun Park ne répond plus | Interlude | 30 s | [PROPOSÉ] |
| CIN-41 | Ce que BISHOP-9 savait | Interlude | 45 s | [PROPOSÉ] |
| CIN-50 | Les dernières images | Acte IV | 35 s | [PROPOSÉ] |
| CIN-51 | Contrôle biologique | Acte IV | 25 s | [PROPOSÉ] |
| CIN-60 | Dernier départ | Acte V | 30 s | [PROPOSÉ] |
| CIN-61 | Les portes du port | Acte V | 45 s | [PROPOSÉ] |
| CIN-70 | Six heures de silence | Station | 40 s | [PROPOSÉ] |
| CIN-71 | La voix de CASSIUS | Station S2 | 40 s | [PROPOSÉ] |
| CIN-72 | Le dernier enregistrement d'Echo-8 | Station S3 | 30 s | [PROPOSÉ] |
| CIN-80 | Premières lumières | Colonie, palier *Rétablie* | 30 s | [PROPOSÉ] |
| CIN-90 | Fins (×3) | Épilogue | 60 s | [PROPOSÉ] |

**Contraintes :** séquences scriptées dans le moteur Canvas 2D (plans fixes, parallaxe, panoramiques, cadres de dialogue avec portraits `npc-dialogue-portraits-v168.js`), pas de vidéos précalculées. Toutes passables et relisibles ; aucune récompense liée à leur affichage. Musique et sons originaux uniquement.

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
| 1 | Valider les noms originaux du §1.5 (Cocyte, Station Orphée, Enfants de l'Hôte Parfait, Solène Ivarsson, Dario Kessler) avant le renommage dans le code. | §1.5 |
| 2 | Identité du signataire du badge : jamais (A) ou sous condition (B) ? | §5.7 |
| 3 | Mara Voss liée à I. Voss, ou homonymie ? | §8.3 |
| 4 | Valider la répartition des chapitres V131 dans les campagnes annexes (§13.4) et le déplacement de leur `worldId`. | §9.2, §13.4 |
| 5 | Noms proposés (Asphodèle, CASSIUS, Adèle Sarrazin, Tomas Wren, Lucia Ferro, Halloran, Grue) à valider. | §2.3 |
| 6 | ICC et Marshals coloniaux : les ajouter comme institutions du récit, sans faction jouable ? | §1.6 |
| 7 | Valider les nouveaux lieux des campagnes annexes (TR-0, Kéos, Murmure, Tyndare, Pangaea comme monde, Hiéron, *Clémence*, *Bonne-Espérance*, Base Ombelle) et leurs personnages (Navarre, Rask, Oyelaran, Viret, Szabo, Moreau, Asch). | §14-18 |
| 8 | Définir MIRE comme programme de modélisation de la compagnie ? | §18.3 |
| 9 | Ordre et conditions de déblocage des campagnes annexes. | §13.5 |


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
| **Les messages suivent avec retard.** | Un appel reçu date déjà de plusieurs jours : la situation à l'arrivée est pire que le message. |
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

**Chapitres existants :** tous les chapitres V131 cités sont **[PARTIEL]** et `playable: true` dans `special-operations-v131.js`, mais leur `worldId` actuel est `world-05-lethe`. Les déplacer vers le monde de leur campagne est un changement de données **[PROPOSÉ]**. Cette Partie II remplace le classement « archives MIRE » proposé au §9.2.

### 13.5 Déblocage et ordre

| Campagne | Déblocage proposé | Niveau conseillé |
| --- | --- | --- |
| 1 · La Saison des Reines | Fin de la campagne principale | Standard |
| 4 · Fièvre noire | Fin de la campagne principale | Standard |
| 2 · Directive zéro | Après 1 campagne annexe | Élevé |
| 3 · Les Bâtisseurs | Après 2 campagnes annexes, dont la 4 | Élevé |
| 5 · Le banc d'essai | Après 3 campagnes annexes | Maximal ; conclut le fil QZ17 |

---

## 14. Campagne annexe 1 — « La Saison des Reines »

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
| 2.4 | Principale | **La Reine volante** | Traquer la Reine aérienne jusqu'à son aire, au sommet d'une aiguille rocheuse. Combat en hauteur, vent, chutes. | `track an apex specimen` | Reine adaptée à son milieu. | **Broodstorm** (Flying Queen, art dédié encore manquant) | 40 min |
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

1. **Aucune scène d'une œuvre n'est reconstituée telle quelle.** Une mission se déroule à côté, avant ou après : un autre lieu du même monde, une autre équipe, un autre moment.
2. **Aucun personnage principal d'une œuvre n'apparaît ni n'est joué.** Les personnages proposés sont originaux. Une œuvre peut être citée par ses traces (un journal, une épave, une date).
3. **Une préquelle ne change pas l'avenir connu.** Le joueur peut sauver des personnes que l'œuvre ne mentionne pas, comprendre une origine, retarder sans empêcher. Ce qui arrive dans l'œuvre arrive quand même.
4. **Un héritage respecte l'état final de l'œuvre.** Un lieu détruit reste détruit ; on visite ses restes.
5. **Une archive MIRE est une reconstitution.** Elle est présentée comme un modèle de la compagnie, peut contenir des erreurs, et le jeu le dit. Elle ne remplace pas l'œuvre.
6. **Une date non confirmée n'est pas inventée.** Si l'année d'une œuvre n'est pas établie dans nos sources, le mode reste **[À DÉCIDER]**.
7. **Les éléments propres aux Yautja** (AVP) restent à l'état de traces dans ce jeu Aliens (ruines, trophées, armes abandonnées). Leur présence active est **[À DÉCIDER]**.

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
| non précisée | *Aliens vs. Predator: Prey* (roman, bande dessinée) | Ryushi | [À DÉCIDER] | [AvP Central — Prey](https://www.avpcentral.com/aliens-vs-predator-prey) |
| non précisée | *Aliens versus Predator: Extinction* (jeu) | LV-742 | [À DÉCIDER] | [Wikipédia — Extinction](https://en.wikipedia.org/wiki/Aliens_Versus_Predator:_Extinction) |
| non confirmée | *Aliens vs. Predator* (jeu, 2010) | BG-386 (Freya's Prospect) | [À DÉCIDER] | [AvP Central — AvP 2010](https://www.avpcentral.com/aliens-vs-predator-2010) |
| non trouvée | — | Ceto, New Galveston, New Albion, Capua VII, Korari | Monde du catalogue sans événement d'œuvre utilisé | Recherche sans résultat confirmé |

Les dates des films sont celles indiquées dans les films eux-mêmes ; elles n'ont pas été revérifiées en ligne pour ce document.

**Note sur Freya's Prospect :** le catalogue en fait un monde distinct (« colonie minière sous glace »), alors que la source consultée décrit Freya's Prospect comme la principale colonie de BG-386. **[À DÉCIDER]** : fusionner, ou garder un monde distinct sous un nom original.

**Note sur les attributs générés :** les biomes et atmosphères des mondes sont tirés automatiquement (`content-core-v50.js`) et contredisent parfois l'œuvre (Sevastopol indiqué « jungle/ruins », par exemple). Les missions de cette partie suivent l'œuvre ; corriger ces attributs pour les mondes de la franchise est **[À DÉCIDER]**.

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
**Situation en 2204 :** la station est perdue ; la colonie a continué ou s'est éteinte selon ce que le projet décide **[À DÉCIDER]**.

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

**[À DÉCIDER]** Le catalogue présente l'Auriga comme un lieu jouable en 2204 ; ce document le traite comme un chantier en préquelle.

### 22.8 Sulaco — `world-16-sulaco-drift`

**Repères de l'œuvre :** vaisseau des Marines coloniaux associé aux événements de 2179. Son sort après 2179 varie selon les œuvres ; ce document n'en utilise aucune.
**Situation en 2204 :** « épave militaire et baies de largage » d'après le catalogue.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-sulaco-1` | Héritage | **Les baies de largage** | Une épave militaire en orbite d'Acheron, pillée à moitié. Récupérer du matériel des Marines pour l'armurerie du Tantalus. | `board a drifting vessel` | Matériel des Marines. |
| `legacy-sulaco-2` | Héritage | **La quarantaine du bord** | Un module de la soute est scellé depuis des années. L'ouvrir ou le laisser. | `escape the quarantine` | Ce qu'on scelle reste dangereux. |

**[À DÉCIDER]** Identifier l'épave comme le Sulaco lui-même, ou comme un vaisseau de la même classe, pour éviter toute contradiction avec les œuvres.

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
**Situation en 2204 :** des décennies plus tard ; état de l'installation **[À DÉCIDER]**.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `legacy-purdan-1` | Héritage | **L'installation fermée** | Une balise automatique s'est rallumée sur Purdan. Descendre vérifier une installation abandonnée depuis longtemps. Ce qu'on y trouve dépend de la décision du projet sur son sort. | `recover black-box data` | Installation corporative oubliée. |
| `legacy-purdan-2` | Héritage | **Les ruines xénobiologiques** | Explorer des ruines anciennes décrites par le catalogue. | `track an apex specimen` | Ruines anciennes. |

### 22.12 LV-1201 — `world-20-lv-1201`

**Repères de l'œuvre :** colonie de recherche Weyland-Yutani, « Incident » du 25 novembre 2230, Marines arrivés environ six semaines plus tard (AVP2).
**Situation en 2204 :** **préquelle** de 26 ans. Les sources consultées ne donnent pas la date de fondation de la colonie.

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `prequel-lv1201-1` | Préquelle | **Le relevé** | Escorter une équipe de relevé de la compagnie dans une jungle de temples. Elle cherche un site pour une future installation. Les guides locaux du relevé meurent un par un, sans témoin. | `escort a colony convoy` | Préquelle : premiers signes d'un monde dangereux. |
| `prequel-lv1201-2` | Préquelle | **Les temples** | Trouver l'origine des disparitions dans un temple ancien : des traces d'une présence non humaine qui n'est pas l'organisme (trophées, marques). Le rapport du joueur est classé par la compagnie ; l'installation sera construite quand même. | `recover black-box data` | La compagnie ignore les avertissements. |

### 22.13 BG-386 — `world-21-bg-386`

**Repères de l'œuvre :** monde minier, colonie de Freya's Prospect, installation secrète de la compagnie bâtie sur des ruines anciennes (AvP 2010). **Année non confirmée dans nos sources : mode [À DÉCIDER].**

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `bg386-1` | [À DÉCIDER] | **La raffinerie** | Une raffinerie de la colonie a cessé d'émettre. Écrite pour fonctionner dans les deux modes : signes avant-coureurs (préquelle) ou ruines (héritage). | `restore atmospheric processing` | Colonie minière. |
| `bg386-2` | [À DÉCIDER] | **Les pyramides** | Explorer des ruines anciennes sous la jungle, au-dessus desquelles la compagnie a construit. | `recover black-box data` | Ruines anciennes, laboratoire secret. |

### 22.14 Ryushi — `world-23-ryushi`

**Repères de l'œuvre :** monde d'élevage géré par la compagnie Chigusa, colonie de Prosperity Wells, détruite pendant l'incident raconté par *Prey*. **Année non précisée : mode [À DÉCIDER].**

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `ryushi-1` | [À DÉCIDER] | **Les troupeaux** | Un ranch isolé signale des bêtes éventrées. Écrite pour les deux modes. | `defend the colony` | Hôtes animaux, colonie d'éleveurs. |
| `ryushi-2` | [À DÉCIDER] | **La gorge** | Retrouver une épave non humaine dans une gorge du désert. Ce qu'il en reste dépend du mode retenu. | `board a drifting vessel` | Épave ancienne. |

### 22.15 LV-742 — `world-25-lv-742`

**Repères de l'œuvre :** planète décrite comme terrain de chasse d'une ruche locale (*Extinction*). **Année non précisée : mode [À DÉCIDER].** Le catalogue la décrit comme « station de terraformation assiégée ».

| ID | Mode | Titre | Résumé | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- |
| `lv742-1` | [À DÉCIDER] | **Le siège du terraformeur** | Une station de terraformation tient sous un siège permanent. Ravitailler et évacuer une équipe. | `hold the extraction zone` | Terraformation, siège. |
| `lv742-2` | [À DÉCIDER] | **Les pièges** | Des organismes tués par une arme qui n'est pas humaine. Établir qui chasse sur ce monde, sans engager. | `track an apex specimen` | Traces d'un autre chasseur. |

---

## 23. Mondes sous licence sans événement d'œuvre utilisé

Ces mondes sont marqués `licensed-continuity` dans le catalogue, mais la recherche faite pour ce document n'a pas confirmé leur source. Leurs missions n'utilisent **aucun événement d'œuvre** et se fondent seulement sur la description du catalogue.

| Monde | ID | Description du catalogue | Mission unique | Mode | Objectif | Ancrage Alien |
| --- | --- | --- | --- | --- | --- | --- |
| **Ceto** | `world-10-ceto` | océan, archipels et cité minière | **La cité sur pilotis** : une cité minière d'archipel perd ses foreuses sous-marines une à une. Plonger, réparer, comprendre. | Indépendant | `restore atmospheric processing` | Colonie isolée, menace sous l'eau. |
| **Freya's Prospect** | `world-11-freya-s-prospect` | colonie minière sous glace | **Sous la glace** : une colonie enfouie sous un glacier n'a plus de chauffage ; les galeries se referment de givre. Rétablir l'énergie avant le gel total. | Indépendant ([À DÉCIDER], §21.3) | `restore atmospheric processing` | Survie technique. |
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
| `world-43-freya-s-prospect-basin` | Freya — bassin | **Le lac gelé** : récupérer une foreuse tombée sous la glace. | Indépendant | `secure the power loader` |
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

Recommandation : B, cohérente avec le reste de la Partie III.

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
| 10 | Mode des mondes sans année confirmée : BG-386, Ryushi, LV-742. | §21.3 |
| 11 | Freya's Prospect : monde distinct ou colonie de BG-386 ? | §21.3 |
| 12 | Corriger les biomes et atmosphères générés des mondes de la franchise ? | §21.3 |
| 13 | Présence active des Yautja dans les missions AVP, ou traces seulement ? | §21.2 |
| 14 | État de Jackson's Star et de Purdan en 2204. | §22.6, §22.11 |
| 15 | Épave de la §22.8 : le Sulaco lui-même ou un vaisseau de même classe ? | §22.8 |
| 16 | Auriga : chantier en préquelle plutôt que lieu jouable en 2204 ? | §22.7 |
| 17 | Mire Archive 001 : exception assumée (A) ou archive parallèle (B) ? | §26.2 |


---

# PARTIE IV — Besoins de production

## 28. Méthode

### 29.1 Statuts

| Statut | Signification |
| --- | --- |
| **[PRÉSENT]** | Un fichier portant ce nom existe dans `assets/` (chemin indiqué). **Sa présence ne prouve ni son intégration au runtime, ni sa validation** (pivots, pieds, échelle, animation). |
| **[DETTE]** | L'art manquant est déjà déclaré dans le code (limites de `special-operations-v131.js`, `HIVE_ART_DEBT_V131`). |
| **[CODE]** | La mécanique existe dans le code (module cité) ; seul l'habillage peut manquer. |
| **[À CRÉER]** | Rien de correspondant n'a été trouvé dans `assets/` ni dans le code. |

Les fichiers de `assets/user/` sont des **références** fournies par le propriétaire, pas des assets de jeu : ils ne comptent pas comme [PRÉSENT].

### 29.2 Catégories

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

### 29.3 Socle déjà présent (réutilisé partout)

**Équipage du Tantalus — [PRÉSENT]** : planches de déplacement et de mission pour les 16 membres (`assets/openai/sprites/npcs/` : `mara-vega`, `tamsin-velez`, `echo-a`, `david-8r`, `asha-mbaye`, `leila-s-rensen`, `noor-okafor`, `bishop-9`, `inez-harlow`, `sanaa-doyle`, `pablo-reyes`, `cal-mercer`, `maksim-orlov`, `idris-kwan`, `jun-park`, `rook`).

**Ennemis — [PRÉSENT]** (`assets/openai/sprites/enemies/`) : drone (`xenomorph-drone-combat-sheet`, `xenomorph-drone-locomotion-sheet`), guerrier (`xenomorph-warrior-*`), runner, lurker, praetorian, spitter, crusher, boiler, burster, carrier, ravager, prowler, reine (`xenomorph-queen-action-sheet-v56`, `xenomorph-queen-combat-sheet`), facehugger (`facehugger-locomotion-sheet`), chestburster, cycle de l'œuf (`ovomorph-cycle-sheet`), néomorphe (`neomorph-locomotion-sheet`), protomorph, `deacon-line`, `pathogen-mimic`, `abomination-pathogen-brute`, synthétique Seegson (`working-joe-combat-sheet`, `seegson-security`), commando W-Y (`weyland-yutani-commando`), UPP (`upp-vanguard`), cultiste (`cult-host`), ATARAX (`atarax-controller`, `atarax-ripper`), `ripper-queen`, `siege-royal`, récifaux (`ceto-reef-predator`, `reef-spitter`, `reef-stalker`), fonderie (`foundry-crusher`, `foundry-drone`), `korari-stalker`, `caravan-stalker`, `dust-runner`, `tantalus-tunnel-vermin`, `wild-boar-host`, `trilobite-echo`, `pale-crucible-hunter`, `salvage-hive-brute`, `colonial-raider`, `neuro-xeno-drone`.

**Véhicules — [PRÉSENT]** (`assets/openai/equipment/v121-vehicles/` et voisins) : `echo-9-recon-bike`, `ceto-patrol-boat`, `reef-hydrofoil`, `crucible-caravan-crawler`, `combat-power-loader`, `ripper-siege-loader`, `uscm-assault-gunship`, `orbital-lifeboat`, `atmospheric-processor-elevator`, `weyland-yutani-executive-shuttle`, `hyperdyne-synthetic-carrier`, `mining-bore-crawler`, `seegson-maintenance-tram`, `maglev-personnel-car`, `ice-driller`, `colony-cargo-lifter`, `neuro-xeno-transport-rig`, `tantalus-command-skiff`, `ua-571-remote-sentry-carrier`, `upp-combat-aerodyne` ; `p5000-work-loader-native-v120`.

**Armes utiles aux scénarios — [PRÉSENT]** : `m41a-pulse-rifle`, `m56-smartgun`, `m240-incinerator`, `ua-571c-sentry`, `cutting-torch`, `harpoon-gun`, `sonic-harpoon`, `reef-caster`, `cryo-lance`, `pathogen-containment-projector`, `neuro-link-disruptor`, `stun-baton`, `maintenance-jack`, `fire-axe`.

**Props de mission — [PRÉSENT]** (`assets/openai/metroidvania/props/`) : `acid-floor-hazard`, `breakable-panel`, `cargo-cover`, `ceiling-cables`, `drop-platform`, `electrical-arc-hazard`, `floor-segment`, `foreground-pipes`, `locked-bulkhead`, `open-bulkhead`, `maintenance-pipe`, `overhead-catwalk`, `short-ledge`, `supply-crates`, `vent-entrance`, `wall-ladder`, `warning-lamp`, `mission-door-states-v58`, `tantalus-traversal-kit-atlas`.

**Terminaux — [PRÉSENT]** : `colony-medical-archive-terminal-sheet`, `planet-field-archive-beacon-sheet`, `ship-command-archive-terminal-sheet`.

**Objets ramassables — [PRÉSENT]** (`drops/`) : munitions, armure, médikit, récupération, clé de sécurité.

**Dangers et VFX — [PRÉSENT]** (`hazards/`) : obscurité, feu, eau (vaguelettes, ligne d'eau), radiation, jet de vapeur, brèche de vide, givre ; planche `combat-vfx-animation-sheet.png`.

**Décors de zone — [PRÉSENT]** (`zones/`) : soute, commandement, quais, ingénierie, extraction, habitat (vaisseau), colonie multi-routes, extérieur planétaire ; fonds de mission du Tantalus.

**Mécaniques — [CODE]** : nage (`swim`), soudure de portes (`weld`), transport d'objets (`carry`), conduits (`vent`), échelles et escalade, grappin (`grapple`), chargeur (`loader`), pilotage, cryostase, détecteur de mouvement (`motion-tracker-v160.js`), corps à corps, lancer de grenade, réanimation (`revive`), soudure, acide persistant, routage d'énergie, caméras (systèmes de survie).

**Mécaniques absentes du code — [À CRÉER]** : apesanteur ou gravité faible, piratage de terminal (aucune occurrence `hack`), jauge de contamination, test biologique de survivant, infiltration phéromonale hors chapitre Jeri, dialogue à choix d'audience (Gateway).

---

## 29. Campagne principale — besoins par mission

### 30.1 Prologue

| Mission | Décors | Props | Personnages / ennemis | Animations | VFX | Actions | Cinématique |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CIN-00 Ouverture | Relais QZ-18 sous la pluie **[À CRÉER]** ; orbite avec Asphodèle **[À CRÉER]** ; Tantalus en orbite **[À CRÉER]** | Pupitre de relais, badge **[À CRÉER]** | Main hors champ **[À CRÉER]** | Écran qui passe en `EN ATTENTE` **[À CRÉER]** | Pluie **[À CRÉER]** ; voyant rouge | — | 8 plans **[À CRÉER]** |
| P-1 Réveil | Baie cryo **[PRÉSENT]** (hub) | Casier `ECHO-8` scellé **[À CRÉER]** | DAVID-8R **[PRÉSENT]** | Sortie de caisson **[CODE]** (onboarding) | Givre de caisson **[À CRÉER]** | Interagir avec le casier **[À CRÉER]** | CIN-01 (1 plan) **[À CRÉER]** |
| P-2 Pas de tir | Pas de tir **[PRÉSENT]** (`hub/proving-ground`) | — | Velez **[PRÉSENT]** | — | Écran de liaison qui reçoit un paquet de messages **[À CRÉER]** | — | — |
| CIN-02 Briefing | Salle de briefing **[PRÉSENT]** (hub) | Carte holographique de Cocyte et d'Asphodèle **[À CRÉER]** | Vega, Harlow, Velez **[PRÉSENT]** | Geste de pointage sur la carte **[À CRÉER]** | — | — | 4 plans, portraits **[PRÉSENT]** |
| P-3 Quai des vivants | Port-Méridien **[CODE]** (`port-meridien-v90.js`) | Lot médical, batterie de sas | Tomas Wren, Lucia Ferro **[À CRÉER]** ; blessé à poitrine bandée **[À CRÉER]** | Blessé allongé, respiration **[À CRÉER]** | — | Choix lot/batterie **[CODE]** | — |

### 30.2 Actes de l'enquête

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

### 30.3 Front colonie — Port-Méridien

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

### 30.4 Front station — Asphodèle

**Socle de l'arc [À CRÉER] :** décor de station orbitale en trois couches (anneau extérieur, pont de contrôle, laboratoire de transit, ponts inférieurs, serre, salle des relais, mémorial) ; PNJ Grue, récupérateurs Crucible ; interface vocale de CASSIUS ; dropship d'Echo-8 amarré.

| Mission | Props spécifiques | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| Six heures de silence | Enregistrement casque à l'écran **[À CRÉER]** | Rook **[PRÉSENT]** | — | Bruit radio **[À CRÉER]** | — |
| S1 L'arrimage | Barricades de l'équipage, dropship d'Echo-8 **[À CRÉER]** | Récupérateurs **[À CRÉER]** (base possible : `colonial-raider` **[PRÉSENT]**) | — | Ventilateurs qui trompent le détecteur **[À CRÉER]** | Négociation ou combat **[À CRÉER]** |
| S2 La voix de CASSIUS | Noyau de CASSIUS, consoles Seegson **[À CRÉER]** | CASSIUS (voix + interface) **[À CRÉER]** | — | Écrans qui s'allument par secteur **[À CRÉER]** | Choix réécrire/brider/effacer **[À CRÉER]** |
| S3 Les ponts scellés | Berceaux QZ17, œufs **[PRÉSENT]** (`ovomorph-cycle-sheet`) ; plaque de Kessler **[À CRÉER]** | Drones, facehuggers **[PRÉSENT]** | — | Brèche de vide **[PRÉSENT]** | Routage d'énergie **[CODE]** |
| S4 Le hub | Modules du hub (7) **[À CRÉER]** | Occupants : techniciens, récupérateurs, colons **[À CRÉER]** | Routines PNJ **[CODE]** (`npc-dialogue-v62.js`) | Remise en pression **[À CRÉER]** | Nouveau hub jouable **[À CRÉER]** |
| Annexes (7) | Caches d'Echo-8, journaux, serre, balise UPP, caméras de CASSIUS, code administrateur **[À CRÉER]** | BISHOP-9, ECHO-A **[PRÉSENT]** | Plantes hydroponiques (boucle) **[À CRÉER]** | — | — |
| CIN-70 à 72 | Station en rotation, dropship au sas, dernier enregistrement **[À CRÉER]** | Kessler (visage sur enregistrement) **[À CRÉER]** | — | — | — |

### 30.5 Quêtes du Tantalus (16 + 6 + 4)

Elles se jouent surtout au hub, avec des PNJ **[PRÉSENT]**. Besoins **[À CRÉER]** : poses de dialogue assises ou au poste pour chaque membre (au moins une par personnage), objets de quête (composants de DAVID-8R, plaques de colons, fragment de sceau, tourelles sentinelles, enregistreurs de Kappa), écran de sélection des recrues (Voss, Bensaïd, Reed, Seo : planches de déplacement et de mission à créer pour chacun).

---

## 30. Campagne annexe 1 — La Saison des Reines

### 31.1 Arc 1 · Nacre-7

**Socle de l'arc :** décor colonie aquacole sur pilotis (plates-formes, bassins, salle des pompes, phare) **[À CRÉER]** ; décor sous-marin (coque du *Mariner's Debt*, fossé) **[À CRÉER]** ; Dr Navarre, pêcheurs **[À CRÉER]** ; capitaine Rask et escouade W-Y (base `weyland-yutani-commando` **[PRÉSENT]**, Rask lui-même **[À CRÉER]**) ; lignée récifale (`ceto-reef-predator`, `reef-spitter`, `reef-stalker` **[PRÉSENT]**, à vérifier comme lignée) ; VFX eau `flood-ripple-splash-cycle`, `flood-waterline-tiles` **[PRÉSENT]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1 Le quai noyé | Tables servies, pompes **[À CRÉER]** | Navarre **[À CRÉER]** | — | Pluie sur l'eau **[À CRÉER]** | — |
| 1.2 Les bassins | Œufs fixés comme des coraux **[À CRÉER]** ; filets avec cocons **[DETTE]** | Drones récifaux | Bassin qui se vide (niveau d'eau) **[À CRÉER]** | Écoulement **[À CRÉER]** | Pompage **[À CRÉER]** |
| 1.3 Plongée HADAL | Coque immergée, nid **[À CRÉER]** | Lurker récifal | Nage en scaphandre **[DETTE]** (`dedicated-hadal-manta-art`) | Bulles, particules, lampe **[À CRÉER]** | Nage **[CODE]** ; oxygène limité **[À CRÉER]** |
| 1.4 Reine des récifs | Fossé, nid royal **[À CRÉER]** | Reine récifale **[À CRÉER]** | MANTA-6 **[DETTE]** ; Reine nageant **[À CRÉER]** | Torpilles, traînées, projecteurs **[À CRÉER]** | Pilotage sous-marin **[CODE]** (chapitre existant) |
| 1.5 Ce que Rask voulait | Œuf royal en caisson **[À CRÉER]** | Rask, escouade W-Y | — | — | Choix laisser/saisir/détruire **[À CRÉER]** |
| Annexes (3) | Laboratoire inondé, filets, phare **[À CRÉER]** | Pêcheur survivant **[À CRÉER]** | Canots qui approchent **[À CRÉER]** | Faisceau du phare **[À CRÉER]** | Hissage de filet **[À CRÉER]** |
| Cinématiques CQ-01, CQ-02 | Trois coquilles d'œuf, fossé éclairé **[À CRÉER]** | Inez **[PRÉSENT]** | — | — | — |

### 31.2 Arc 2 · Echo Basin

**Socle de l'arc :** canyons rouges, tour relais, ville troglodyte de Gorge-Seize, aiguille rocheuse **[À CRÉER]** (fond `planet-exterior` **[PRÉSENT]** comme base) ; mineurs **[À CRÉER]** ; lignée fouisseuse (base `xenomorph-crusher-action-sheet`, `xenomorph-burster-action-sheet-v56` **[PRÉSENT]**, variante **[À CRÉER]**) ; lignée aérienne et Reine volante **[DETTE]** (`dedicated-flying-queen-art`) ; Cheyenne **[DETTE]** (`complete-modular-dropship-corpus`), `uscm-assault-gunship` **[PRÉSENT]** comme base.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 2.1 Relais Gorge-Seize | Tour relais **[À CRÉER]** | Mineurs **[À CRÉER]** | — | Faux échos sur le détecteur (interface) **[À CRÉER]** | Lecture des faux signaux **[À CRÉER]** |
| 2.2 Le sol qui s'ouvre | Dalles renforcées, galeries qui s'ouvrent **[À CRÉER]** | Fouisseurs **[À CRÉER]** | Sortie de sol **[À CRÉER]** | Fissures, poussière **[À CRÉER]** | Vibrations à surveiller **[À CRÉER]** |
| 2.3 Nids sous les surplombs | Nids de falaise **[À CRÉER]** | Planeurs **[À CRÉER]** | Piqué **[À CRÉER]** | Tir aérien, explosions **[PRÉSENT]** (`combat-vfx-animation-sheet`) | Tir depuis l'appareil **[CODE]** (Broodstorm) |
| 2.4 La Reine volante | Aire au sommet **[À CRÉER]** | Reine volante **[DETTE]** | Vol, atterrissage **[DETTE]** | Vent, chutes de pierres **[À CRÉER]** | Combat en hauteur **[À CRÉER]** |
| 2.5 Carte des lignées | Registre de vol **[À CRÉER]** | Inez **[PRÉSENT]** | — | — | Lecture **[CODE]** |
| Annexes (4) | Puits 7, épave Crucible, capteurs sismiques, route des crêtes **[À CRÉER]** | Contremaître, Rask, Grue **[À CRÉER]** | Remontée de puits (ascenseur) **[À CRÉER]** | — | — |
| CQ-03 | Coucher de soleil sur le canyon **[À CRÉER]** | Reine volante **[DETTE]** | — | — | — |

### 31.3 Arc 3 · TR-0, la Ruche-monde

**Socle de l'arc :** surface vivante, organes, noyau **[DETTE]** (`complete-organ-biomes`, `dedicated-planet-queen-art`) ; Base Ombelle sous la résine **[À CRÉER]** ; Reine-Mère et Chœurs **[DETTE]** (`dedicated-queen-mother-animation`, `complete-royal-cast`) ; praetorian **[PRÉSENT]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 3.1 Atterrissage | Croûte qui respire **[DETTE]** | — | Surface animée **[DETTE]** | Pulsations **[À CRÉER]** | Jauge de bruit **[CODE]** (alerte existante) |
| 3.2 Base Ombelle | Laboratoire W-Y sous résine, registres d'expédition **[À CRÉER]** | — | — | — | Lecture **[CODE]** |
| 3.3 Trois Chœurs | Nurserie, artère royale, balises **[CODE]** (chapitre existant) | Castes reliées **[DETTE]** | — | Ondes du Chœur **[À CRÉER]** | Rupture des Chœurs **[CODE]** |
| 3.4 La Reine-Mère | Salle royale **[CODE]** | Reine-Mère **[DETTE]** | 4 phases **[DETTE]** | — | Boss **[CODE]** |
| 3.5 Le noyau | Organes, noyau, sas **[CODE]** | — | Effondrement **[À CRÉER]** | Effondrement, poussière organique **[À CRÉER]** | Fuite chronométrée **[CODE]** |
| Annexes (2) | Chambre froide **[À CRÉER]** | Chercheur survivant **[À CRÉER]** ; praetorian capturé **[PRÉSENT]** | Créature entravée **[À CRÉER]** | — | Capture d'organisme **[À CRÉER]** |
| CQ-04 à 06 | Vue orbitale de TR-0, décollage **[À CRÉER]** | — | — | — | — |

---

## 31. Campagne annexe 2 — Directive zéro

### 32.1 Arc 1 · Sable Meridian

**Socle de l'arc :** désert, dunes, relais de Sel-Blanc, oasis **[À CRÉER]** ; caravane minière (`crucible-caravan-crawler` **[PRÉSENT]**) ; synthétiques Seegson (`working-joe-combat-sheet`, `seegson-security` **[PRÉSENT]**) ; `caravan-stalker`, `dust-runner` **[PRÉSENT]** ; colons du désert **[À CRÉER]**.

| Mission | Props | Personnages / ennemis | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| 1.1 La caravane 12 | Cabine verrouillée **[À CRÉER]** | 40 synthétiques immobiles (une pose idle dédiée suffit) **[À CRÉER]** | Synthétique au repos, tête qui se tourne **[À CRÉER]** | Vent de sable **[À CRÉER]** | Libération discrète **[À CRÉER]** |
| 1.2 Le refus | — | Synthétiques qui attaquent **[PRÉSENT]** | Saisie, étranglement **[À CRÉER]** | Liquide blanc à l'impact **[À CRÉER]** | Escorte **[CODE]** |
| 1.3 Récupérer une tête | Tête synthétique transportable **[À CRÉER]** | — | Portage d'une tête **[CODE]** (`carry`) | — | Récupération de synthétique **[CODE]** (objectif) |
| 1.4 Sel-Blanc | Antenne de relais **[À CRÉER]** | Colons armés **[À CRÉER]** | — | Arc électrique **[PRÉSENT]** | Destruction de relais **[CODE]** (objectif) |
| Annexes (3) | Ferme de l'oasis, outil d'arrêt **[À CRÉER]** | Grue, famille de l'oasis **[À CRÉER]** | — | — | Commande d'arrêt synthétique **[À CRÉER]** |
| CS-01, CS-02 | Plan large de la caravane, écran `PRIORITÉ 0` **[À CRÉER]** | — | Tête qui se tourne à l'unisson **[À CRÉER]** | — | — |

### 32.2 Interlude · Tantalus

| Mission | Props | Personnages | Animations | VFX | Actions |
| --- | --- | --- | --- | --- | --- |
| I.1 Coupure | Interface d'isolement des relais **[À CRÉER]** | MU/TH/UR **[PRÉSENT]** | — | — | Choix d'isolement **[À CRÉER]** |
| I.2 ECHO-A | Armurerie verrouillée **[PRÉSENT]** (`hub/armory-v169`) | ECHO-A **[PRÉSENT]** | ECHO-A en garde devant une porte **[À CRÉER]** | — | Crise `synthetic` **[CODE]** (`world-crisis-core.js`) ; persuasion **[À CRÉER]** |

### 32.3 Arc 2 · Chantiers de Kéos

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

### 32.4 Arc 3 · Murmure

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

### 37.1 Chaînes Héritage, préquelles et Gateway (§22)

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

### 37.2 Mondes §23, §24 et sites frontaliers §25

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
| Reine volante | [DETTE] |
| Reine-Mère, Chœurs, Ruche-monde | [DETTE] |
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
