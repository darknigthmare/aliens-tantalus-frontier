# Aliens: Tantalus Frontier — Bible de campagne

> **Document de conception narrative, source uniquement.** Il n'est pas copié dans le build public.
> **Intrigue originale du projet** (`provenance: tantalus-project-original`, `canonExact: false`). Les scènes proposées ici ne reconstituent aucun film ni aucun jeu existant. Elles réutilisent des noms et lieux déjà référencés dans le catalogue, dont Lethe ; leur provenance reste distincte de celle de l'intrigue (§1.4).
> L'intrigue respecte les règles de l'univers *Alien* (§1.3). Les noms de la franchise restent la propriété de leurs ayants droit (`LICENSE_NOTICE.md`).

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

1. **La colonie.** Port-Méridien est une colonie portuaire de Lethe, fondée sous charte de l'Administration coloniale et financée par un contrat de développement Weyland-Yutani. La charte comporte une clause classique : si la colonie est déclarée *non viable*, ses installations reviennent au financeur.
2. **Le réseau QZ.** Les communications de Lethe passent par le réseau de relais QZ, exploité par Weyland-Yutani. Ses relais au sol (QZ-17, QZ-18…) sont pilotés depuis la **station Asphodèle**, en orbite. Le réseau sert aussi de **réseau de quarantaine sanitaire** : il peut retenir des messages et bloquer des départs.
3. **La perte de contact.** Pendant des semaines, les appels de Port-Méridien arrivent en retard. Puis la station Asphodèle émet un **code de quarantaine rouge** sur tout Lethe et cesse de répondre.
4. **La réquisition.** Un code de quarantaine interdit l'approche aux navires civils : seule une unité militaire peut l'appliquer, enquêter ou le lever. L'Administration coloniale réquisitionne l'unité des Marines coloniaux la plus proche, l'**USS Tantalus**, en patrouille dans le secteur.
5. **L'ordre de mission** officiel : *rétablir le contact, évaluer la situation sanitaire, faire appliquer la quarantaine, évacuer les civils si nécessaire.*
6. **Les consignes de la compagnie** arrivent avec plusieurs jours de retard, par le réseau QZ lui-même : *préserver le « matériel sous scellés » en transit sur Lethe.* BISHOP-9, synthétique de la compagnie embarqué comme officier scientifique, reçoit en parallèle une directive qu'il n'a pas à commenter tant qu'on ne l'interroge pas.
7. **La relève.** À l'arrivée, le Tantalus envoie une équipe de reconnaissance, **Echo-8**, aborder la station Asphodèle. Le contact est perdu après six heures. MU/TH/UR sort alors une relève d'hypersommeil : **Echo-9**, le joueur.

Ce montage justifie, sans artifice, tout ce que le jeu contient déjà : la salle de briefing, les relais QZ à remettre en service, l'enquête sur les messages retardés, les évacuations, le contrôle biologique au retour et la méfiance envers BISHOP-9.

### 1.2 Pitch

**2204.** Sur Lethe, les messages de détresse arrivent en retard. Pas à cause des pannes : à cause des priorités. Quand un relais doit choisir entre une cargaison et des vivants, quelqu'un a déjà choisi.

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
| **Lethe** | Monde repris du catalogue (`world-05-lethe`, provenance `licensed-continuity`, secteur `Cerberus`). Les relais QZ, galeries et C-12 portent les missions originales du projet. L'intrigue de cette bible est indépendante de toute autre œuvre utilisant ce nom. | **[EXISTANT]** dans les missions |
| **Port-Méridien** | Colonie portuaire, « quai des vivants » : triage, sas, civils (`port-meridien-v90.js`). La colonie à sauver et reconstruire. | **[EXISTANT]** (intro) / **[PROPOSÉ]** (reconstruction) |
| **Relais QZ-17 et QZ-18** | Postes au sol du réseau QZ : quais, fret, archives locales. | **[PARTIEL]** / **[EXISTANT]** |
| **Corridor du convoi et ascenseur C-12** | Axe terrestre vers le complexe industriel, galerie à trois voies. | **[EXISTANT]** |
| **Le dépôt** | Installation souterraine absente des registres officiels, destination des conteneurs QZ17. | **[PROPOSÉ]** |
| **Station Asphodèle** | Station de contrôle du réseau QZ, en orbite. Silencieuse. La station perdue, futur hub. | **[PROPOSÉ]** |

*Asphodèle* prolonge la logique mythologique de Lethe et Tantalus sans emprunter de lieu existant de la franchise.

**[À DÉCIDER]** Le catalogue reprend des noms et lieux d'un jeu existant : Lethe, sa description et l'entrée « Pioneer Station » (`content-core-v50.js`), ainsi que des ennemis et personnels de référence (`enemy-source-adaptations-v118.js`, `enemy-coverage-v117.js`, `enemy-import-admissions-v106.js`, `premium-personnel-v119.js`, `xeno-trials-ui-v96.js`). Cette bible n'en reprend aucun élément d'intrigue. Décider si ces références sont conservées ou remplacées, et si Lethe reste dans le secteur `Cerberus` ou passe au Tantalus Reach. Aucun identifiant ni secteur du jeu n'est modifié par ce document.

### 1.5 Factions et institutions

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
| 2 | Relais QZ-18 sous la pluie de Lethe. | `LETHE · RELAIS QZ-18 · 18:41` |
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

Salle de briefing. Mara Vega projette Lethe et la station.

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

Port-Méridien est le seul port civil de Lethe encore habité. Sa charte peut être retirée s'il est déclaré non viable. Le joueur doit d'abord **le sauver** (tenir, soigner, contenir l'infestation, évacuer), puis **le reconstruire** jusqu'à ce qu'il remplisse seul les critères de viabilité : air, eau, énergie, communications, défense, population.

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
- La stabilité de Lethe monte avec les chantiers terminés ; l'infestation baisse avec les purges.

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

**Pourquoi un second hub :** le Tantalus reste le hub mobile (équipage, armurerie, déploiements). Asphodèle devient le hub régional : contrôle des relais, ravitaillement de Port-Méridien, liaison indépendante. Qui tient Asphodèle tient les communications de Lethe : c'est l'outil qui permet d'envoyer le dossier sans passer par la compagnie.

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
| `station-a-journaux` | **Les journaux de l'équipage** | Asha Mbaye | Rassembler les journaux personnels de l'équipage d'Asphodèle et les rendre aux familles de Port-Méridien. | Témoignages d'un équipage disparu. |
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
| **Salle des relais** | Libère les messages retenus ; missions générées sur tout Lethe ; envoi du dossier à l'ICC | Contrat *Relais en dérive* ×3 |
| **Mémorial** | Noms de l'équipage d'Asphodèle, d'Echo-8 et des colons morts | *Les journaux de l'équipage* |
| **Quartiers** | Installation de recrues et de colons volontaires | Colonie palier *Autonome* |

**Contraintes de production :** un nouveau hub demande des salles, des portes et des parcours vérifiés (`AGENTS.md` : accès logique, passage physique, points d'arrivée, aller-retour, reprise). La Frontier Forge (`docs/forge/`) est le chemin naturel pour construire ces secteurs.

### 7.4 Ce qui s'est passé sur Asphodèle — [PROPOSÉ]

Révélé par morceaux dans S1-S3 et les annexes :

1. Les conteneurs QZ17 arrivaient par navette, passaient par le laboratoire de transit pour contrôle, puis descendaient au dépôt de Lethe, avec priorité absolue sur le réseau.
2. Un conteneur endommagé s'est ouvert au laboratoire. Le personnel a demandé la quarantaine. CASSIUS l'a appliquée à toute la station, puis à tout Lethe, et l'a maintenue : aucune consigne ne lui permettait de la lever sans accord de la compagnie.
3. La quarantaine bloquait les départs, mais pas la priorité cargaison : les livraisons vers le dépôt ont continué pendant que les appels de Port-Méridien attendaient.
4. Echo-8 a trouvé des survivants retranchés dans les ponts inférieurs, les a barricadés, puis est sorti chercher une issue. Le contact a été perdu à la sixième heure.
5. Les survivants ont tenu quelques jours. Leurs journaux s'arrêtent.

Echo-9 retrouve la plaque d'un membre d'Echo-8 et le dernier enregistrement de l'équipe. Si la plaque est ramenée au Tantalus, elle est déposée dans le casier vide.

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

### 9.1 Liées à Lethe

| Opération | Statut | Place | Accroche [PROPOSÉ] | Ancrage Alien |
| --- | --- | --- | --- | --- |
| **Cargo Brutal** | Chapitre **[EXISTANT]** / promesse **[PARTIEL]** | Avant Acte I | Un cargo civil en route vers Port-Méridien transporte un conteneur QZ17 mal scellé. L'art dédié de la Matriarche manque encore. | Cargo infesté. |
| **Systèmes de survie Alien** | **[EXISTANT]** effective | Entre Actes I et II | Évasion d'un poste médical en quarantaine près du port ; mécaniques réutilisées dans l'interlude et S3. | Auto-destruction, soudure, acide. |
| **Doctrine Alpha / Bravo** | **[PARTIEL]** | Avant C1 ou C5 | Défense de colonie à cinq routes, quatre membres minimum : tenir Port-Méridien. | Escouade de Marines. |
| **Opération Abysse Noir** | Chapitre jouable **[PARTIEL]** | Annexe | Exploration sous-marine (HADAL, MANTA, `legacy-operation-state-v131.js`) : des conteneurs QZ17 tombés dans les réservoirs du port. | Nid aquatique. |
| **Broodstorm** | Chapitre jouable **[PARTIEL]** | Avant Acte V | Vol et escortes (Cheyenne, `legacy-operation-state-v131.js`) : couvrir les navettes entre Asphodèle et le port. La modularité complète reste manquante. | Dropship, appui aérien. |

### 9.2 Archives MIRE (continuité séparée)

Le contenu du projet évoque des « archives MIRE et anomalies temporelles » (monde Palimpste). **[PROPOSÉ]** Les opérations éloignées du ton de Lethe sont des archives MIRE consultées depuis le laboratoire du Tantalus ou celui d'Asphodèle : reconstitutions et dossiers isolés, sans effet sur le dossier ni sur la colonie.

Mire Archive 001, Protocole Z-110, Jeri, Éloïse, A.T.A.X.-Q, Le chant de la Reine-Mère, Talos contre le Titan, LV-XENO et Pangaea sont tous **[PARTIEL]** et `playable: true` dans `special-operations-v131.js`. Leurs chapitres sont raccordés par `content.js`, avec des limites d'art dédié ou de campagne étendue. Leur classement comme archives MIRE reste **[PROPOSÉ]** ; il ne change pas leur mode ni leur monde actuel.

**[À DÉCIDER]** Archives MIRE, ou seconde campagne.

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
| 1 | Garder ou remplacer les noms et lieux d'un jeu existant présents dans le catalogue (Lethe, « Pioneer Station », ennemis et personnels de référence) ? Lethe reste-t-il dans le secteur `Cerberus` ? | §1.4 |
| 2 | Identité du signataire du badge : jamais (A) ou sous condition (B) ? | §5.7 |
| 3 | Mara Voss liée à I. Voss, ou homonymie ? | §8.3 |
| 4 | Opérations hors ton : archives MIRE ou seconde campagne ? | §9.2 |
| 5 | Noms proposés (Asphodèle, CASSIUS, Adèle Sarrazin, Tomas Wren, Lucia Ferro, Halloran, Grue) à valider. | §2.3 |
| 6 | ICC et Marshals coloniaux : les ajouter comme institutions du récit, sans faction jouable ? | §1.5 |
