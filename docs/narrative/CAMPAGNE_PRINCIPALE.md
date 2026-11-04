# Aliens: Tantalus Frontier — Bible de campagne

> **Document de conception narrative, source uniquement.** Il n'est pas copié dans le build public.
> **Intrigue originale du projet** (`provenance: tantalus-project-original`, `canonExact: false`). Les scènes nouvelles proposées ici ne reconstituent pas un film ou un jeu existant. Elles réutilisent toutefois des noms et lieux déjà référencés dans le catalogue, dont Lethe ; leur provenance reste distincte de celle de l'intrigue (voir §1.2).
> Elle respecte en revanche les règles de l'univers *Alien* (voir §1.3). Les noms de la franchise restent la propriété de leurs ayants droit (`LICENSE_NOTICE.md`).

## 0. Comment lire ce document

| Statut | Signification |
| --- | --- |
| **[EXISTANT]** | Élément jouable aujourd'hui ; le module source est cité. Ce statut ne signifie pas que toute la promesse d'une opération est achevée. Le texte du code fait foi. |
| **[PARTIEL]** | Système ou opération avec `implementationStatus: 'partial'` dans le registre courant `src/special-operations-v131.js`, chargé par `src/app.js`. Un chapitre peut être jouable tout en restant partiel, notamment pour son art ou les actes supplémentaires. |
| **[PROPOSÉ]** | Conception à valider, puis à raccorder au contenu, au chargement, au jeu, à l'interface et à la sauvegarde. |
| **[À DÉCIDER]** | Point ouvert à trancher par le propriétaire. |

Les identifiants existants (`special-archive-relay`, `special-c12-horde`, `special-black-cocoon`, `special-narrative-qz17`, `crew-09-inez-harlow`…) sont conservés. Les nouveaux identifiants proposés commencent par `story-`, `colony-`, `station-` ou `ship-` pour éviter toute collision de sauvegarde.

**Types de missions utilisés partout :**

| Type | Rôle | Durée | Rejouable |
| --- | --- | --- | --- |
| **Intro** | Ouvre une partie, présente un lieu, ses personnages et ses règles. | Courte | Non |
| **Principale** | Fait avancer l'histoire de la partie. | Longue | Non |
| **Annexe** | Histoire secondaire écrite, liée à un personnage ou un lieu. | Moyenne | Non |
| **Locale** | Contrat court généré sur un lieu, pour l'entretenir ou le défendre. | Courte | Oui |

Les missions locales s'appuient sur les objectifs déjà définis dans `content-core-v50.js` (`rescue survivors`, `restore atmospheric processing`, `escort a colony convoy`, `defend the colony`, `purge a reactor nest`, `hold the extraction zone`, `navigate the vent network`, `secure the power loader`, `escape the quarantine`, etc.).

---

## 1. Cadre

### 1.1 Pitch

**2204, Tantalus Reach.** Sur cette frontière coloniale, les messages de détresse arrivent en retard. Pas à cause des pannes : à cause des priorités. Quand un relais doit choisir entre une cargaison et des vivants, quelqu'un a déjà choisi.

Le joueur incarne la **Relève Echo-9**, sortie de cryostase à bord de l'USS *Tantalus*, vaisseau des Marines coloniaux. Ordre officiel : rétablir les relais de quarantaine de Lethe et évacuer les civils. Ce que le joueur découvre : une compagnie fait transiter des organismes vivants sous couvert de fret, et la colonie de **Port-Méridien** paie le prix de ce trafic.

La campagne a trois fronts qui avancent ensemble :

1. **L'enquête** (campagne principale) : qui a fait passer le fret avant les vivants, et qu'est-ce que c'était ?
2. **La colonie** : sauver Port-Méridien, puis la reconstruire.
3. **La station perdue** : reprendre la **station Asphodèle**, silencieuse depuis des mois, et en faire un second hub.

### 1.2 Lieux de la campagne et provenance

| Lieu | Nature | Statut |
| --- | --- | --- |
| **USS Tantalus** | Vaisseau des Marines coloniaux, hub mobile : 4 ponts, 16 salles d'équipage, annexes (`npc-dialogue-v62.js`, `hub-v52-runtime.js`). | **[EXISTANT]** |
| **Lethe** | Monde repris du catalogue (`world-05-lethe`, provenance `licensed-continuity`, secteur `Cerberus`). Les relais « QZ », galeries et C-12 portent les missions originales du projet. Son rattachement proposé au Tantalus Reach reste à décider. | **[EXISTANT]** dans les missions / **[À DÉCIDER]** pour le rattachement géographique proposé |
| **Port-Méridien** | Colonie portuaire et « quai des vivants » : triage, sas, civils (`port-meridien-v90.js`). Ici, c'est **la colonie à sauver et reconstruire**. | **[EXISTANT]** (intro) / **[PROPOSÉ]** (reconstruction) |
| **Relais QZ-17 et QZ-18** | Postes du réseau de quarantaine de Lethe ; quais, fret, archives locales. | **[EXISTANT]** / **[PARTIEL]** |
| **Corridor du convoi et ascenseur C-12** | Axe terrestre vers le complexe, galerie à trois voies. | **[EXISTANT]** |
| **Station Asphodèle** | Station de contrôle du réseau QZ, en orbite de Lethe. Silencieuse. **La station perdue, futur hub.** | **[PROPOSÉ]** |

Le nom *Asphodèle* suit la logique mythologique déjà présente (Lethe, Tantalus) sans emprunter de lieu existant de la franchise.

**[À DÉCIDER]** Le catalogue reprend des noms et lieux d'un jeu existant : Lethe, sa description et l'entrée « Pioneer Station » (`content-core-v50.js`), ainsi que des ennemis et personnels de référence (`enemy-source-adaptations-v118.js`, `enemy-coverage-v117.js`, `enemy-import-admissions-v106.js`, `premium-personnel-v119.js`, `xeno-trials-ui-v96.js`). Les missions citées utilisent bien l'identité de Lethe, sans reprendre ici l'intrigue de ce jeu. Décider si ces références sont conservées ou remplacées par des éléments originaux, et résoudre l'écart entre le secteur `Cerberus` du catalogue et le Tantalus Reach proposé dans cette bible. Aucun identifiant ni secteur du jeu n'est modifié par ce document.

### 1.3 Règles de l'univers à respecter

L'histoire est originale, mais elle doit sonner juste dans l'univers *Alien*. Règles de cohérence :

1. **Les communications sont lentes.** Les messages passent par des relais ; un relais muet isole une colonie. Pas d'appel instantané entre systèmes.
2. **Le voyage passe par l'hypersommeil.** Les relèves dorment, les équipages tournent, la cryostase a un coût (DAVID-8R surveille les réveils).
3. **Les compagnies priment souvent sur les vies.** Weyland-Yutani (faction « volatile » du projet) protège ses actifs. Elle ne joue jamais le méchant de dessin animé : elle suit des procédures, des contrats et des clauses.
4. **Les synthétiques obéissent à leurs directives.** BISHOP-9, DAVID-8R et ECHO-A ne trahissent pas « par méchanceté » ; leurs priorités sont écrites par d'autres.
5. **Le cycle biologique est implacable.** Œuf, parasite, gestation, éclosion. Un contrôle biologique au retour n'est jamais une formalité.
6. **Les Marines sont des professionnels fatigués.** Équipement lourd, détecteurs de mouvement, M577, dropships, humour sec.
7. **La technologie est industrielle.** Écrans monochromes, sas, conduits, processeurs atmosphériques, chargeurs. Rien de propre ni de lisse.
8. **Une preuve n'est pas une accusation.** Ton déjà établi par Inez Harlow et MU/TH/UR : on sépare le fait établi, la pièce manquante et la supposition.

### 1.4 Factions

Toutes viennent de `FACTIONS` (`content-core-v50.js`). Leur rôle narratif est **[PROPOSÉ]**.

| Faction | Rôle dans la campagne |
| --- | --- |
| **USCMC** | L'équipage du Tantalus. Ordres de sauvetage, moyens limités. |
| **Weyland-Yutani** | Propriétaire du réseau QZ et commanditaire du fret. Présente par contrats, directives et un représentant (§2.3). |
| **Frontier Colonies** | Les habitants de Port-Méridien. Alliés fragiles, méfiants envers toute compagnie. |
| **Crucible Salvage Compact** | Récupérateurs. Pillent la station Asphodèle ; peuvent devenir partenaires de la reconstruction. |
| **Seegson** | Fournisseur bon marché du matériel de la colonie : pannes fréquentes, pièces disponibles. |
| **Children of the Perfected Host** | Culte qui voit dans les organismes une élévation. Dans cette campagne : quelques colons de Port-Méridien convertis après l'isolement. |
| **UPP** | Absente de la trame principale ; présence possible en mission annexe (épave, balise). |

---

## 2. Personnages

### 2.1 Le joueur

**Echo-9 (« la Relève Echo-9 »)** — opérateur des Marines coloniaux, apparence définie au créateur de personnage. Il parle peu, décrit ses actions et garde toujours un trajet de retour en vue.

**[PROPOSÉ]** Fil personnel : la relève qu'il remplace, l'**Echo-8**, a disparu sur la station Asphodèle. Son casier est vide dans la baie cryo. Le fil se résout dans le front de la station (§7).

### 2.2 L'équipage du Tantalus

Postes et salles : `HUB_NPC_ROSTER` (`src/hub-v52-runtime.js`). Fonctions narratives : **[PROPOSÉ]**.

| Pont | Salle | Personnage | Rôle | Fonction |
| --- | --- | --- | --- | --- |
| 0 | Passerelle | **Mara Vega** | Commandante | Porte l'ordre officiel ; doit choisir entre la compagnie et les colons. |
| 0 | Briefing | **Tamsin Velez** | Sergente | Mentor de terrain du prologue. |
| 0 | Info. de combat | **ECHO-A** | Synthétique tactique | Miroir d'Echo-9 ; s'interroge sur la notion de relève. |
| 0 | Baie cryo | **DAVID-8R** | Synthétique récupéré | Premier visage du jeu ; mémoire endommagée. |
| 1 | Quartiers | **Asha Mbaye** | Liaison coloniale | Voix de Port-Méridien ; pilote la reconstruction. |
| 1 | Mess | **Leila Sørensen** | Éclaireuse | Routes de survie autour de la colonie. |
| 1 | Infirmerie | **Noor Okafor** | Infirmier | Soins, triage, registre des morts. |
| 1 | Laboratoire | **BISHOP-9** | Officier scientifique synthétique | Analyse ; directive de préservation de la compagnie. |
| 2 | Quarantaine | **Inez Harlow** | Xénobiologiste, liaison science | Conscience méthodologique de l'enquête. |
| 2 | Armurerie | **Sanaa Doyle** | Smartgunner | Défense de la colonie et de la station. |
| 2 | Atelier | **Pablo Reyes** | Démolitions | Brèches, déblaiement, reconstruction lourde. |
| 2 | Baie véhicules | **Cal Mercer** | Chef véhicules | Le M577 et les convois de ravitaillement. |
| 3 | Hangar | **Maksim Orlov** | Pilote | Navettes vers la colonie et la station. |
| 3 | Réacteur | **Idris Kwan** | Ingénieur | Énergie du Tantalus, puis de la station. |
| 3 | Support-vie | **Jun Park** | Technicien | Atmosphère, eau, filtres de la colonie. |
| 3 | Capteurs | **Rook** | Marine de reconnaissance | Voix radio de toutes les sorties. |

**MU/TH/UR** — ordinateur de bord. Neutre, exact. Ne valide aucune action non prouvée.

**Recrues disponibles** (`crew-recruitment-v85.js`) : Mara Voss « RIVET » (chantier orbital), Nadia Bensaïd « SUTURE » (colonie isolée), Jonas Reed « BASTION » (réseau de cargos), Jun Seo « BALISE » (convois terrestres). Leurs origines existantes les rattachent naturellement à un front (§8.3).

### 2.3 Nouveaux personnages — [PROPOSÉ]

| Personnage | Lieu | Rôle |
| --- | --- | --- |
| **Adèle Sarrazin** | Port-Méridien | Doyenne élue de la colonie. Pragmatique, épuisée, ne fait confiance à aucun uniforme. |
| **Tomas Wren** | Port-Méridien | Chef de quai. A vu passer les conteneurs scellés ; se tait par peur de perdre son contrat. |
| **Lucia Ferro** | Port-Méridien | Médecin de la colonie, travaille avec Noor Okafor. |
| **I. Voss** | QZ-18 | Contremaître dont le badge a signé la priorité de fret à 18:43 (`archive-relay-state-v122.js`). Disparu. |
| **Directrice Halloran** | Weyland-Yutani | Représentante régionale. Ne ment jamais directement : elle cite les clauses. |
| **CASSIUS** | Station Asphodèle | Intelligence de contrôle du réseau QZ. Applique la quarantaine à la lettre depuis des mois, sans personne pour la corriger. |
| **Grue** | Crucible Salvage Compact | Capitaine récupératrice installée sur l'anneau extérieur d'Asphodèle. |

---

## 3. Chronologie générale

| Ordre | Campagne principale | Front colonie (Port-Méridien) | Front station (Asphodèle) |
| --- | --- | --- | --- |
| 1 | **Prologue** — Relève Echo-9 | **Intro** — Le quai des vivants **[EXISTANT]** | — |
| 2 | **Acte I** — La cargaison fantôme (QZ-17) | Principale C1 — Tenir le port | — |
| 3 | **Acte II** — Le dernier relais (QZ-18) | Principale C2 — Rallumer la colonie | **Intro** — Le silence d'Asphodèle |
| 4 | **Acte III** — Corridor de feu (M577 → C-12) | Principale C3 — Le convoi des rescapés | Principale S1 — L'arrimage |
| 5 | **Interlude** — Quarantaine à bord | Reconstruction : phase 2 | Principale S2 — Réveiller CASSIUS |
| 6 | **Acte IV** — Cocon noir | Principale C4 — Le culte du port | Principale S3 — Les ponts scellés |
| 7 | **Acte V** — La dernière course | Principale C5 — La nuit des murs | Principale S4 — Le hub Asphodèle |
| 8 | **Épilogue** | Colonie reconstruite (état final) | Second hub actif |

Les annexes et missions locales de chaque front se débloquent au fil de cette chronologie.

---

## 4. Prologue — « Relève Echo-9 »

**But :** apprendre les commandes, rencontrer l'équipage et poser la question centrale (le fret contre les vivants) avant le premier tir sur Lethe.

### CIN-00 · Ouverture — [PROPOSÉ]

60 à 75 s, passable.

| Plan | Image | Son / texte |
| --- | --- | --- |
| 1 | Noir. Une ligne de télémétrie verte. | Bip de relais régulier, puis silence. |
| 2 | Relais QZ-18 sous la pluie de Lethe. | `LETHE · RELAIS QZ-18 · 18:41` |
| 3 | Pupitre : un brouillon de détresse s'écrit puis passe en `EN ATTENTE`. | Le bip reprend, plus lent. |
| 4 | Un badge posé sur le pupitre, nom illisible. Une main hors champ le prend. | Aucune voix. |
| 5 | Le message part : `18:54`. | `TREIZE MINUTES` |
| 6 | Espace. L'USS *Tantalus* glisse dans le silence, lumières de veille. | Thème principal (compositions originales, `assets/audio/`). |
| 7 | `ALIENS: TANTALUS FRONTIER` | — |

Les horaires sont ceux du dossier QZ-18 : le joueur les reconnaîtra plus tard comme preuves.

### P-1 · Intro — Réveil en cryostase — [EXISTANT]

Le poste de cryostase attend la confirmation ; DAVID-8R accueille la Relève Echo-9. Création du personnage. Tamsin Velez rappelle la règle : avant une sortie, on identifie l'objectif et la voie de retour.

**CIN-01 « Le casier vide » [PROPOSÉ]** (20 s) : un casier `ECHO-8`, vidé et scellé. DAVID-8R : « Ce poste a été libéré. Je n'ai pas d'autre information. »

### P-2 · Intro — Qualification au pas de tir — [EXISTANT]

`hub-opening-exercise-v89.js` : échelle, pas de tir, cibles, rétablissement de la liaison prioritaire.

**[PROPOSÉ]** La liaison prioritaire relaie un appel de Port-Méridien, reçu avec plusieurs jours de retard. Mara Vega coupe l'exercice : départ immédiat.

### P-3 · Intro — Le quai des vivants (Port-Méridien) — [EXISTANT]

`port-meridien-v90.js` : porter un lot au triage, assister un blessé, réalimenter le sas, rassembler trois habitants et les guider au sas éclairé.

**[PROPOSÉ]** C'est aussi la mission d'intro du front colonie (§6.1). Le joueur porte un lot médical **ou** une batterie de sas : premier choix « vivants ou matériel ». Tomas Wren, en passant : « Les conteneurs scellés passent avant nous depuis trois semaines. »

### CIN-02 · Deux ordres — [PROPOSÉ]

Salle de briefing du Tantalus. Mara Vega projette Lethe : relais muets, colonie isolée, station Asphodèle silencieuse en orbite.

> **Mara Vega** — Ordre de la compagnie : rétablir le réseau QZ, sécuriser le fret en attente. Ordre du Tantalus : ramener les vivants. Si les deux se contredisent, vous m'appelez.
>
> **Inez Harlow** — Et vous ramenez des relevés. Pas des impressions.

---

## 5. Campagne principale — L'enquête

### 5.1 Acte I — « La cargaison fantôme » (QZ-17)

**Statut :** **[PARTIEL]** — `special-narrative-qz17`, `narrative-collectables-v68.js`. Intérieur vertical, 4 routes, 2204.

**Question :** qu'est-ce qui a été déplacé sur QZ-17, et pourquoi le bon officiel ment-il ?

**Preuves existantes :**

| Pièce | Ce qu'elle établit |
| --- | --- |
| PDA de quai — relève 02:00 | Transfert effectué malgré une validation de sécurité incomplète. |
| Courriel logistique — annulation QZ17-04 | Le responsable affirme que le transfert a été annulé avant tout déplacement. |
| Boîte noire FL-09 | Le chariot a bien bougé, avec une masse anormale, vers une destination absente du bon. |
| Sceau QZ17-04 — fragment intérieur | Sceau coupé après le monte-charge, avant l'arrivée annoncée en chambre froide. |

Le code contient aussi une preuve secondaire : *la colonie reçoit un conteneur scellé et une référence QZ17-04 ; le personnel n'identifie pas son transporteur* (`narrative-evidence-v132.js`). **[PROPOSÉ]** Cette colonie est Port-Méridien : premier lien direct entre l'enquête et le front colonie.

**Déroulé [PROPOSÉ] :**

1. **CIN-10 « Les quais déserts »** (30 s) : dropship d'Orlov, approche sous la pluie. Rook : « Quatre accès. Aucun ne répond. »
2. Exploration verticale, peu de combats, beaucoup de signes : résine, conduits ouverts, détecteur de mouvement nerveux.
3. **Choix existant** : *suivre la trace par la maintenance* ou *sécuriser la preuve en quarantaine*.
   - Maintenance → l'alcôve vide : un berceau de transport réfrigéré, ouvert de l'intérieur.
   - Quarantaine → le fragment de sceau revient intact ; Inez peut l'analyser (annexe *Le sceau*, §8.1).
4. **CIN-11 « Ouvert de l'intérieur »** (25 s) : marque d'acide sur la paroi d'un conteneur. Inez : « Ne concluez pas. Rapportez. »

**Retour** : trois questions avec Inez (qu'est-ce qui a bougé, qui ment, que transportait-on). La troisième reste **non établie** sans prélèvement.

**Conséquence :** `story-qz17-route` = `maintenance` | `quarantine`.

### 5.2 Acte II — « Le dernier relais » (QZ-18)

**Statut :** **[EXISTANT]** — `campaign-story-v160.js`, `archive-relay-state-v122.js`.

Contenu existant : briefing « Le message arrivé trop tard », protocoles *Audit technique* (+2 recherche) ou *Prévention à bord* (+2 moral) versés seulement avec le dossier complet et un retour validé ; six pièces ; conclusion juste : *détresse retardée par la priorité de fret*. Brouillon saisi à 18:41, mis en attente à 18:42, libéré à 18:54 ; badge de I. Voss laissé à 18:39, utilisé à 18:43 sans image exploitable.

**Tissage [PROPOSÉ] :**

- Le message retenu était l'appel de Port-Méridien. Les treize minutes ont coûté des vies au port.
- Quatrième question optionnelle au retour (si l'Acte I est terminé) : *« Quel fret avait la priorité ? »* — la même série de scellés QZ17.
- **CIN-20 « Treize minutes »** (40 s) : Asha Mbaye lit le message libéré à 18:54. Les noms des colons qui attendaient défilent. Pas de musique.
- Mara Vega transmet le dossier à la compagnie. Réponse de la Directrice Halloran : « Priorité cargaison maintenue, conformément à la clause d'acheminement. »

### 5.3 Acte III — « Corridor de feu » (M577 → C-12)

**Mission A · Ramener le blindé — [EXISTANT]** (`campaign-convoy-story-v161.js`) : ordre de convoyage, manifeste du M577, trois voies, barrages, tourelle, bilan au retour.

**Mission B · Une sortie plutôt qu'une victoire (C-12) — [EXISTANT]** (`campaign-lethe-story-v163.js`) : relais, quatre secondes d'avertissement, quarante-cinq secondes de rétablissement, sas à droite.

**Tissage [PROPOSÉ] :**

- **Le manifeste du M577 est le choix moral de l'acte.** La compagnie exige trois conteneurs scellés du dépôt ; Asha demande des places pour les rescapés du complexe, attendus à Port-Méridien. Chaque conteneur retire deux places.
- Pendant les 45 secondes de C-12, si un conteneur est à bord, il **frappe de l'intérieur** (son seul). Inez : « Notez l'heure. »
- **CIN-31 « Le sas refermé »** : les rescapés descendent à Port-Méridien, ou les conteneurs partent sous scellés vers le Tantalus, sur ordre. Écran de quarantaine : `CONTRÔLE BIOLOGIQUE · 1 ANOMALIE`.

**Conséquence :** `story-m577-manifest` = colons (0-6) et conteneurs (0-3). Les colons ramenés rejoignent la population de Port-Méridien (§6).

### 5.4 Interlude — « Quarantaine » (à bord du Tantalus) — [PROPOSÉ]

Le projet référence déjà une « Ruche expérimentale du Tantalus » (`hive-missions-v131.js`) et des crises à bord par route de salles (`world-crisis-core.js`, type `xenomorph`). L'interlude leur donne une place.

1. **Déclencheur** : un conteneur ramené s'est ouvert en quarantaine. Sans conteneur : un parasite a voyagé dans le train d'atterrissage du dropship.
2. **CIN-40 « Jun Park ne répond plus »** : alerte au support-vie ; les PNJ passent en routine `alert` (`NPC_ROUTINE_PHASES_V62`).
3. Traque sur les ponts 2 et 3 avec les systèmes de survie **[EXISTANT]** (soudure, routage d'énergie, caméras, acide persistant).
4. Sauver Jun Park dans les conduits.
5. **Choix** : détruire la créature, ou la capturer pour BISHOP-9 et Inez.
6. **CIN-41 « Ce que BISHOP-9 savait »** : les journaux montrent que BISHOP-9 avait une directive de préservation des spécimens. Il ne l'a pas cachée ; personne ne l'a interrogé. Sa confiance baisse d'un niveau (`NPC_TRUST_LEVELS_V62`).

**Conséquence :** `story-quarantine-outcome` = `destroyed` | `captured`.

### 5.5 Acte IV — « Cocon noir »

**Statut :** **[EXISTANT]** pour le chapitre jouable `special-black-cocoon` (`black-cocoon-state-v121.js`, `campaign-lethe-story-v163.js`) ; promesse globale **[PARTIEL]** dans `special-operations-v131.js`. L'opérateur reprend conscience dans la résine, sans témoin de sa capture ; sac, relais, sortie industrielle ou circuit de refroidissement, transport Kappa, 90 secondes, contrôle biologique à bord.

**Tissage [PROPOSÉ] :**

- **CIN-50 « Les dernières images »** (35 s) : caméra casque dégradée. Echo-9 suit la destination absente du bon de QZ-17 jusqu'à un dépôt souterrain. Silhouette au plafond. Coupure. La capture n'est pas jouée : elle reste « sans témoin exploitable », comme dans le code.
- Dans la galerie basse : des **berceaux réfrigérés de la série QZ17**, vides. **Révélation :** la cargaison fantôme allait *vers* la ruche. Quelqu'un nourrissait et étudiait la colonie d'organismes de Lethe, et la priorité de fret gardait ce trafic hors des registres d'évacuation.
- Un enregistreur de CASSIUS, la station Asphodèle, est fixé aux berceaux : les ordres de livraison venaient de la station (lien avec §7).
- **CIN-51 « Contrôle biologique »** : scanner, Noor Okafor attend. `NÉGATIF`. « Bon retour. Cette fois, je l'écris. »

### 5.6 Acte V — « La dernière course de Tantalus »

**Statut :** **[PARTIEL]** — le registre `special-operations-v131.js` rattache déjà `last-course-tantalus` au chapitre jouable `special-apc-convoy`, utilisé à l'Acte III (§5.3). Ce chapitre comporte des hordes, deux Crushers et une Reine en barrage final (`apc-convoy-state-v121.js`). Un Acte V distinct, la poursuite de Reine et son score restent **[PROPOSÉ]** ; ce ne sont pas un second chapitre ni une poursuite déjà raccordés.

**Situation [PROPOSÉ] :** la ruche du dépôt s'étend vers la surface. Halloran annonce la clôture du réseau QZ et la « suspension des engagements envers Port-Méridien ». Le dernier convoi doit ramener les colons isolés du complexe vers le port avant que la ruche coupe la route.

1. **Conseil de guerre** : chaque membre d'équipage dont la confiance est *solide* propose un avantage (tourelle de Sanaa, blindage de Cal, fenêtre d'Orlov, route de Leila).
2. **Choix de Mara Vega** selon les preuves réunies : obéir à la compagnie (récupérer le dépôt) ou protéger la colonie.
3. **CIN-60 « Dernier départ »** : le M577 quitte le complexe sous la pluie.
4. Nouvelle course APC **[PROPOSÉ]**, à construire à partir du chapitre partiel existant.
5. Point médian **[PROPOSÉ]** : un pont cède ; lâcher la remorque de fret ou celle des colons en retard.
6. Poursuite de Reine **[PROPOSÉ]** : la Reine du dépôt, nourrie par les livraisons QZ17.
7. Arrivée aux murs de Port-Méridien : la course se termine dans la mission C5 du front colonie (§6.2), si elle est débloquée.

**CIN-61 « Les portes du port »** : Rook fait l'appel des colons arrivés. Le nombre affiché est la somme réelle des sauvetages de toute la campagne.

### 5.7 Dossier, identité et fins

**Dossier `story-dossier` :**

| Pièce | Source |
| --- | --- |
| Contradiction PDA / courriel | Acte I |
| Fragment de sceau QZ17-04 ou berceau ouvert | Acte I (selon la piste) |
| Priorité de fret à 18:43 | Acte II |
| Directive de préservation de BISHOP-9 | Interlude |
| Berceaux QZ17 dans la ruche | Acte IV |
| Ordres de livraison de CASSIUS | Acte IV + front station S2 |
| Témoignage de Tomas Wren | Front colonie, annexe *Ce que le quai a vu* |

**[À DÉCIDER]** Identité du signataire du badge. Option A : jamais établie (on accuse un système, pas une personne). Option B : établie avec 6 pièces sur 7, le texte rappelant ce qui reste non prouvé. Recommandation : B.

**Fins [PROPOSÉ] :**

| Fin | Condition | Résultat |
| --- | --- | --- |
| **« Le relais parle »** | Vega protège la colonie + dossier ≥ 5 pièces + station Asphodèle reprise | Le dossier part sur tout le réseau QZ depuis Asphodèle. La compagnie perd le contrôle du récit. Port-Méridien devient une colonie libre. |
| **« Le fret d'abord »** | Vega obéit | Le dépôt est récupéré, la colonie passe sous administration de la compagnie. Inez démissionne. Le dossier est classé « retard technique ». |
| **« Les vivants, sans preuve »** | Vega protège la colonie + dossier < 5 pièces | La colonie tient, mais Vega est relevée de son commandement. Asphodèle reste aux mains de qui la contrôle. |

### 5.8 Épilogue — « Ce que le retour devra raconter » — [PROPOSÉ]

Jouable, sans combat. Visite du Tantalus, de Port-Méridien et, si elle est reprise, de la station Asphodèle. Chaque personnage a une réplique finale selon la fin. Sur le casier de l'Echo-8 : `RETOUR CONFIRMÉ` ou `POSTE LIBÉRÉ` (§7.4).

---

## 6. Front colonie — Port-Méridien : sauver, puis reconstruire

### 6.1 Concept

Port-Méridien est le seul port civil de Lethe encore habité. Son « quai des vivants » trie les rescapés. Les relais QZ retardés l'ont isolé ; la compagnie le considère comme un coût. Le joueur doit d'abord **le sauver** (tenir, soigner, évacuer), puis **le reconstruire** (énergie, air, eau, défense, communications).

**Raccordement aux systèmes existants [PROPOSÉ] :** la colonie utilise les valeurs stratégiques déjà présentes pour chaque monde — `stability`, `infestation`, `quarantine` — et les ressources existantes (`credits`, `alloy`, `medical`, `research`, `fuel`). Les conséquences d'opération (`campaign-consequences.js`) modifient déjà stabilité et infestation ; la reconstruction ajoute des **chantiers** qui consomment ces ressources.

### 6.2 Missions

**Intro**

| ID | Titre | Statut | Résumé |
| --- | --- | --- | --- |
| `colony-intro-quai` (ID proposé) | **Le quai des vivants** | Séquence **[EXISTANT]** / raccordement colonie **[PROPOSÉ]** | Triage, blessé, sas, trois civils (`port-meridien-v90.js`, reçu existant `port-meridien:quai-des-vivants:v90`). Le nouvel ID et la rencontre de Tomas Wren et Lucia Ferro restent **[PROPOSÉ]**. |
| `colony-intro-doyenne` | **La doyenne** | **[PROPOSÉ]** | Asha Mbaye présente Echo-9 à Adèle Sarrazin dans la salle commune. Visite guidée du port : quais, infirmerie, processeur, mur nord. Elle refuse toute aide « de la compagnie » ; Asha doit prouver que le Tantalus n'en fait pas partie. |

**Principales**

| ID | Titre | Placement | Résumé | Objectif de base |
| --- | --- | --- | --- | --- |
| `colony-c1` | **Tenir le port** | Après Acte I | Une vague sort des conduits du quai. Défendre l'infirmerie de Lucia Ferro pendant l'évacuation des blessés vers le Tantalus. | `defend the colony` |
| `colony-c2` | **Rallumer la colonie** | Après Acte II | Le processeur atmosphérique du port tombe. Descendre dans ses niveaux techniques avec Jun Park et le relancer. Débloque la reconstruction. | `restore atmospheric processing` |
| `colony-c3` | **Le convoi des rescapés** | Pendant Acte III | Les colons ramenés par le M577 arrivent ; les accueillir, les enregistrer, contrôler leur état biologique. Un des arrivants est contaminé : le repérer sans provoquer de panique. | `rescue survivors` |
| `colony-c4` | **Le culte du port** | Après Acte IV | Des colons convertis aux Children of the Perfected Host ouvrent les sas la nuit. Enquêter (méthode de l'Acte II), puis choisir : arrestation, exil ou médiation par Adèle. | `navigate the vent network` |
| `colony-c5` | **La nuit des murs** | Fin de l'Acte V | Les rescapés du dernier convoi franchissent les portes ; la ruche du dépôt suit. Tenir les murs reconstruits jusqu'à l'aube. L'état de la colonie détermine la difficulté. | `hold the extraction zone` |

**Annexes**

| ID | Titre | Donneur | Résumé |
| --- | --- | --- | --- |
| `colony-a-quai` | **Ce que le quai a vu** | Tomas Wren | Protéger Wren pendant qu'il récupère ses carnets de quai. Il témoigne alors sur les conteneurs QZ17 (pièce du dossier). |
| `colony-a-ferro` | **Les lits vides** | Lucia Ferro | Retrouver une équipe médicale partie vers un hameau voisin et jamais revenue. |
| `colony-a-ecole` | **La classe du mercredi** | Adèle Sarrazin | Escorter les enfants du port vers l'abri du processeur pendant une alerte. Mission sans arme lourde. |
| `colony-a-seegson` | **Pièces Seegson** | Jun Park | Récupérer du matériel Seegson dans un entrepôt abandonné ; il est bon marché, en panne, mais réparable. |
| `colony-a-balise` | **La balise du hameau** | Rook | Rétablir une balise de colonie isolée (« Balise de colonie » existe dans le catalogue) pour retrouver les foyers éloignés. |
| `colony-a-crucible` | **Le prix de Grue** | Grue | Les récupérateurs proposent des alliages en échange d'un accès au quai. Négocier, ou refuser et chercher ailleurs. |
| `colony-a-converti` | **Mon frère est parti** | Un colon | Retrouver un jeune converti avant qu'il ne descende dans les galeries. Peut changer l'issue de C4. |

**Locales (rejouables)**

| Contrat | Objectif existant | Effet |
| --- | --- | --- |
| Purge du réservoir | `purge a reactor nest` | Infestation −, eau + |
| Escorte des moissonneurs | `escort a colony convoy` | Nourriture + |
| Ronde des murs | `defend the colony` | Sécurité + |
| Filtres du processeur | `restore atmospheric processing` | Air + |
| Récupération en périphérie | `recover black-box data` | Alliage, crédits |
| Recherche de disparus | `rescue survivors` | Population +, moral + |
| Chargeur bloqué | `secure the power loader` | Vitesse des chantiers + |

### 6.3 Reconstruction — [PROPOSÉ]

Après C2, Asha ouvre la **table de reconstruction** (salle commune de Port-Méridien, ou console des quartiers du Tantalus). Chaque chantier a trois niveaux.

| Chantier | Niveau 1 | Niveau 2 | Niveau 3 | Personnage référent |
| --- | --- | --- | --- | --- |
| **Processeur atmosphérique** | Air respirable au port | Serres pressurisées | Exportation d'air vers les hameaux | Jun Park |
| **Infirmerie** | Triage stable | Bloc opératoire | Contrôle biologique complet | Lucia Ferro, Noor Okafor |
| **Murs et sas** | Sas soudés | Mur nord | Tourelles automatiques | Sanaa Doyle, Pablo Reyes |
| **Énergie** | Générateurs de secours | Réseau du port | Réseau partagé avec Asphodèle | Idris Kwan |
| **Communications** | Balise locale | Relais indépendant du réseau QZ | Diffusion sur tout Lethe | Rook, Asha Mbaye |
| **Quais** | Une plate-forme d'atterrissage | Dépôt de ravitaillement | Port ouvert aux convois civils | Cal Mercer, Maksim Orlov |
| **Habitat** | Dortoirs | Quartiers familiaux | Accueil de nouveaux colons | Adèle Sarrazin |

**Règles :**

- Un chantier consomme des ressources existantes et un temps stratégique ; il ne progresse jamais pendant une mission en cours.
- Un niveau n'est validé qu'après une mission locale réussie sur le lieu (ex. Ronde des murs pour Murs et sas niveau 2).
- Une mission ratée peut endommager un chantier : il perd un niveau de fonctionnement, pas ses ressources.
- La population (colons ramenés au fil de la campagne) limite le nombre de chantiers actifs en même temps.
- La stabilité de Lethe monte avec les chantiers terminés ; l'infestation baisse avec les purges.

**Paliers de la colonie :**

| Palier | Condition | Effet |
| --- | --- | --- |
| **Survie** | Début | Missions locales défensives seulement. |
| **Rétablie** | 3 chantiers niveau 1 | Annexes de la colonie débloquées ; recrutement de Nadia Bensaïd. |
| **Autonome** | 5 chantiers niveau 2 | Bonus au conseil de guerre de l'Acte V ; Port-Méridien fournit des ressources régulières. |
| **Libre** | 7 chantiers niveau 3 + fin « Le relais parle » | Épilogue spécial : premier convoi civil sans escorte. |

---

## 7. Front station — Asphodèle : la station perdue, futur hub

### 7.1 Concept

La **station Asphodèle** est la station de contrôle du réseau de relais QZ, en orbite de Lethe. Elle ne répond plus depuis des mois. Son intelligence de contrôle, **CASSIUS**, applique toujours la quarantaine à la lettre : elle retarde les messages, autorise les priorités de fret et verrouille ses propres ponts.

Le joueur doit **atteindre** la station, la **remettre en service**, découvrir ce qui s'y est passé (dont le sort de l'Echo-8), puis en faire un **second hub** : fixe, en orbite, relié à la colonie.

**Pourquoi un second hub :** le Tantalus reste le hub mobile (équipage, armurerie, déploiements). Asphodèle devient le hub régional : réseau de relais, commerce, ravitaillement de Port-Méridien. Les deux restent utiles.

### 7.2 Missions

**Intro**

| ID | Titre | Placement | Résumé |
| --- | --- | --- | --- |
| `station-intro-silence` | **Le silence d'Asphodèle** | Après Acte II | Rook analyse les horaires QZ-18 : le signal de mise en attente venait de la station. Orlov rapproche le Tantalus. **CIN-70** : la station tourne lentement, feux de position éteints, un seul hublot allumé. Une navette Crucible est amarrée à l'anneau extérieur. |

**Principales**

| ID | Titre | Résumé | Objectif de base |
| --- | --- | --- | --- |
| `station-s1` | **L'arrimage** | Abordage en apesanteur partielle par le sas de l'anneau extérieur. Négocier ou combattre les récupérateurs de Grue, puis atteindre le pont de contrôle. Le joueur découvre des barricades de l'équipage disparu. | `board a drifting vessel` |
| `station-s2` | **Réveiller CASSIUS** | Rétablir l'énergie (avec Idris Kwan à la radio), puis dialoguer avec CASSIUS. Elle ne ment pas, elle cite ses directives. Le joueur obtient les ordres de livraison QZ17 (pièce du dossier) et doit choisir : réécrire ses priorités, la brider, ou l'effacer. | `restore atmospheric processing` |
| `station-s3` | **Les ponts scellés** | CASSIUS a scellé les ponts inférieurs. Derrière : le laboratoire de la station, des berceaux QZ17, et la plaque de l'Echo-8. Combat en espace confiné, routage de l'énergie, sas. | `escape the quarantine` |
| `station-s4` | **Le hub Asphodèle** | Dernière purge, remise en pression, arrivée des premiers occupants (équipe technique du Tantalus, récupérateurs alliés si négociés, colons volontaires). La station devient un hub jouable. | `hold the extraction zone` |

**CASSIUS — trois issues de S2 :**

| Choix | Effet |
| --- | --- |
| **Réécrire ses priorités** (« les vivants d'abord ») | CASSIUS reste un allié du hub ; meilleur réseau de relais ; risque si la compagnie reprend le contrôle. |
| **La brider** | Fonctions réduites, aucun risque ; certaines annexes indisponibles. |
| **L'effacer** | Station manuelle ; les ponts inférieurs se rouvrent à la force, plus dangereux ; perte de ses archives. |

**Annexes**

| ID | Titre | Donneur | Résumé |
| --- | --- | --- | --- |
| `station-a-echo8` | **La dernière ronde d'Echo-8** | ECHO-A | Suivre les marques laissées par l'Echo-8 sur la station : ses barricades, ses caches, son dernier message. Clôt le fil du casier vide. |
| `station-a-grue` | **Le pacte de l'anneau** | Grue | Les récupérateurs veulent garder l'anneau extérieur. Accepter (commerce, pièces) ou les expulser. |
| `station-a-journaux` | **Les journaux de l'équipage** | Asha Mbaye | Rassembler les journaux personnels de l'équipage disparu d'Asphodèle et les rendre aux familles de Port-Méridien. |
| `station-a-hydro` | **La serre** | Jun Park | Remettre en route la serre hydroponique abandonnée ; elle nourrira la colonie. |
| `station-a-sonde` | **Écho lointain** | Rook | Une balise UPP dérive près de la station. La récupérer sans incident diplomatique. |
| `station-a-cassius` | **Ce que CASSIUS a vu** | Inez Harlow | Si CASSIUS est conservée : lui faire rejouer ses enregistrements de la nuit où l'équipage a disparu. |

**Locales (rejouables)**

| Contrat | Objectif existant | Effet |
| --- | --- | --- |
| Inspection des conduits | `navigate the vent network` | Sécurité de la station + |
| Relais en dérive | `recover black-box data` | Couverture du réseau + |
| Épave à proximité | `board a drifting vessel` | Alliage, carburant |
| Remise en pression d'un module | `restore atmospheric processing` | Ouvre une salle du hub |
| Purge d'un nid | `purge a reactor nest` | Infestation de la station − |

### 7.3 Le hub Asphodèle — [PROPOSÉ]

Après S4, la station devient un hub. Ses modules s'ouvrent avec les missions locales et annexes.

| Module | Fonction en jeu | Débloqué par |
| --- | --- | --- |
| **Pont de contrôle** | Carte du réseau QZ, choix des relais à ouvrir, état de Port-Méridien | S4 |
| **Quais d'arrimage** | Navettes vers la colonie et le Tantalus ; commerce Crucible | S1 + *Le pacte de l'anneau* |
| **Laboratoire** | Recherche avancée (avec Inez), archives | S3 |
| **Serre** | Nourriture pour la colonie | *La serre* |
| **Salle des relais** | Relance des messages retenus ; missions générées sur tout Lethe | Contrat *Relais en dérive* ×3 |
| **Mémorial** | Noms de l'équipage disparu et des colons morts | *Les journaux de l'équipage* |
| **Quartiers** | Installation de recrues et de colons volontaires | Colonie palier *Autonome* |

**Contraintes de production :** un nouveau hub demande des salles, des portes et des parcours vérifiés (`AGENTS.md`, section niveaux : accès logique, passage physique, points d'arrivée, aller-retour, reprise). La Frontier Forge (`docs/forge/`) est le chemin naturel pour construire ces secteurs.

### 7.4 Ce qui s'est passé sur Asphodèle — [PROPOSÉ]

Révélé par morceaux dans S1-S3 et les annexes :

1. La station recevait les conteneurs QZ17 et les redirigeait vers le dépôt de Lethe, sur ordre de la compagnie.
2. Un conteneur s'est ouvert au laboratoire. L'équipage a déclenché la quarantaine. CASSIUS l'a appliquée, puis l'a maintenue, sans jamais recevoir l'ordre de la lever.
3. L'Echo-8, envoyé pour rétablir le relais, a barricadé l'équipage survivant dans les ponts inférieurs, puis est sorti chercher une issue. Il n'est pas revenu.
4. Les survivants ont tenu quelques semaines. Leurs journaux s'arrêtent.

Echo-9 retrouve la plaque de l'Echo-8 dans S3. Son corps n'est pas retrouvé. Si la plaque est ramenée au Tantalus, elle est déposée dans le casier vide.

---

## 8. Quêtes du Tantalus — [PROPOSÉ]

Elles utilisent le système de rapport existant (`npc-dialogue-v62.js`) : confiance `fragile → prudent → operationnel → solide`, choix de rapport `request-candid-assessment`, `acknowledge-welfare`, `review-mission`, `confirm-alert-role`, `request-infestation-evidence`, renouvellement après 8 heures de jeu. Aucune récompense n'est versée avant la preuve de réalisation.

### 8.1 Quêtes personnelles de l'équipage

| ID | Personnage | Titre | Après | Résumé | Effet |
| --- | --- | --- | --- | --- | --- |
| `ship-vega` | Mara Vega | **La ligne de commandement** | Acte II | Relire avec elle les ordres reçus et marquer ceux qui contredisent le sauvetage. | Influence le choix de l'Acte V |
| `ship-velez` | Tamsin Velez | **Le pas de tir** | Prologue | Battre ses temps de qualification ; elle raconte son premier déploiement raté. | Dotation d'assaut |
| `ship-echo-a` | ECHO-A | **Deux relèves** | S3 | Comparer ses protocoles avec la plaque de l'Echo-8. « Quand tu seras remplacé, qui remarquera ? » | Réplique d'épilogue |
| `ship-david` | DAVID-8R | **Mémoire récupérée** | Acte I | Trois composants trouvés en mission restaurent un secteur de sa mémoire : il a déjà servi sur un poste du réseau QZ. | Pièce optionnelle du dossier |
| `ship-mbaye` | Asha Mbaye | **Les noms de Port-Méridien** | Acte II | Compléter la liste des colons en attente avec les registres des relais. | Population de la colonie + |
| `ship-sorensen` | Leila Sørensen | **La route des hameaux** | C2 | Cartographier une route de survie entre le port et les hameaux. | Route alternative Acte V |
| `ship-okafor` | Noor Okafor | **Le registre des pertes** | Acte III | Ramener les plaques des colons morts trouvées en mission. | Infirmerie de la colonie + |
| `ship-bishop` | BISHOP-9 | **Directive de préservation** | Interlude | Lui demander ce qu'il ferait si la compagnie et un membre d'équipage s'opposaient. | Restaure la confiance perdue |
| `ship-harlow` | Inez Harlow | **Le sceau** | Acte I (quarantaine) | Analyser le fragment QZ17-04 : résidu biologique et colle industrielle. | Recherche, pièce du dossier |
| `ship-doyle` | Sanaa Doyle | **Calibrage lourd** | C1 | Récupérer des pièces de smartgun pour armer les murs du port. | Chantier Murs et sas + |
| `ship-reyes` | Pablo Reyes | **La charge de trop** | Acte III | Il a fait sauter un accès trop tôt lors d'une ancienne évacuation. Retrouver le registre de cette opération. | Charges de brèche, déblaiement des chantiers |
| `ship-mercer` | Cal Mercer | **Remettre le M577 en état** | Acte III | Réparer le blindé ; l'état du M577 au bilan existant sert de départ. | Blindage Acte V |
| `ship-orlov` | Maksim Orlov | **Fenêtre de tir** | Acte IV | Récupérer les enregistreurs du transport Kappa : pourquoi a-t-il mis si longtemps ? | Fenêtre d'extraction + |
| `ship-kwan` | Idris Kwan | **Le réacteur ne ment pas** | Prologue | Réparer le réacteur (`service:power`) ; il note une consommation inexpliquée au pont de quarantaine. | Indice de l'interlude |
| `ship-park` | Jun Park | **Après les conduits** | Interlude | Jun craint les conduits depuis l'incident. Les sécuriser avec lui. | Moral, oxygène |
| `ship-rook` | Rook | **Ce que les capteurs ont vu** | Acte II | Retrouver une navette non déclarée entre QZ-17 et Asphodèle. | Débloque `station-intro-silence` |

### 8.2 Vie à bord

| ID | Titre | Lieu | Résumé |
| --- | --- | --- | --- |
| `ship-mess` | **Repas de relève** | Mess | Réunir quatre membres au même service ; scène collective qui change à chaque acte. |
| `ship-cryo` | **Le casier vide** | Baie cryo | Fil de l'Echo-8, relancé par un indice à chaque acte ; se ferme avec S3. |
| `ship-sensor` | **Écoute de nuit** | Capteurs | Pendant la phase `break`, capter des messages retenus ; chaque fragment ajoute un nom à *Les noms de Port-Méridien*. |
| `ship-armory` | **Inventaire contradictoire** | Armurerie | Le registre ne correspond pas aux râteliers. Petite enquête qui forme aux méthodes de l'Acte II. |
| `ship-vehicle` | **Les plaques du M577** | Baie véhicules | Une plaque d'un ancien équipage, trouvée dans le blindé. |
| `ship-bioforge` | **Ce qu'on garde en vie** | Bioforge | Débat Inez / BISHOP-9 ; ouvre l'accès narratif à la Bioforge (**[PARTIEL]** comme système). |

### 8.3 Recrutement

| Recrue | Titre | Front | Résumé |
| --- | --- | --- | --- |
| **Mara Voss « RIVET »** | **Le même nom** | Station | Ancienne du chantier orbital ; elle répare la station. Elle porte le nom du contremaître I. Voss. **[À DÉCIDER]** lien familial ou homonymie. |
| **Nadia Bensaïd « SUTURE »** | **Pas de blessé sans extraction** | Colonie | Venue d'une colonie isolée ; rejoint l'équipage quand Port-Méridien atteint le palier *Rétablie*. |
| **Jonas Reed « BASTION »** | **Sécurité embarquée** | Enquête | Ancien agent de sécurité de cargos ; il a vu passer des scellés QZ17. Témoignage au dossier. |
| **Jun Seo « BALISE »** | **Itinéraires terrestres** | Colonie | Connaît les routes de convoi ; le recruter avant l'Acte III facilite le corridor. |

---

## 9. Opérations secondaires

Classement d'après le registre courant `special-operations-v131.js`, utilisé par `app.js`. Il complète le registre historique `special-operations-v67.js` : les anciens statuts `missing` de ce dernier ne décrivent pas les chapitres V131 aujourd'hui raccordés. Les placements narratifs ci-dessous restent proposés.

### 9.1 Liées à Lethe

| Opération | Statut | Place | Accroche [PROPOSÉ] |
| --- | --- | --- | --- |
| **Cargo Brutal** | Chapitre **[EXISTANT]** / promesse **[PARTIEL]** | Avant Acte I | Escorter un cargo civil vers Port-Méridien ; premier contact avec la priorité de fret. Art dédié de la Matriarche encore manquant dans le registre courant. |
| **Systèmes de survie Alien** | **[EXISTANT]** effective | Entre Actes I et II | Évasion d'un poste médical en quarantaine près du port ; mécaniques réutilisées dans l'interlude et S3. |
| **Doctrine Alpha / Bravo** | **[PARTIEL]** | Avant C1 ou C5 | Défense de colonie à cinq routes, quatre membres minimum : idéale pour tenir Port-Méridien. |
| **Opération Abysse Noir** | Chapitre jouable **[PARTIEL]** | Annexe | Exploration sous-marine : les berceaux QZ17 arrivaient-ils aussi par les réservoirs du port ? Le chapitre actuel utilise HADAL et MANTA (`legacy-operation-state-v131.js`). |
| **Broodstorm** | Chapitre jouable **[PARTIEL]** | Avant Acte V | Vol et escortes : couvrir les navettes entre Asphodèle et le port. Le chapitre actuel utilise le Cheyenne ; la modularité complète reste manquante (`legacy-operation-state-v131.js`). |

### 9.2 Archives MIRE (continuité séparée)

Le contenu du projet évoque des « archives MIRE et anomalies temporelles » (monde Palimpste). **[PROPOSÉ]** Les opérations éloignées du ton de Lethe sont des archives MIRE consultées depuis le laboratoire du Tantalus ou celui d'Asphodèle : reconstitutions et dossiers isolés, sans effet sur le dossier ni sur la colonie.

Mire Archive 001, Protocole Z-110, Jeri, Éloïse, A.T.A.X.-Q, Le chant de la Reine-Mère, Talos contre le Titan, LV-XENO et Pangaea sont tous **[PARTIEL]** et `playable: true` dans `special-operations-v131.js`. Leurs chapitres sont raccordés par `content.js`, avec des limites d'art dédié ou de campagne étendue. Leur classement narratif comme archives MIRE dans cette bible reste **[PROPOSÉ]** ; il ne change pas leur mode ou leur monde actuel.

**[À DÉCIDER]** Archives MIRE, ou seconde campagne.

---

## 10. Cinématiques

| ID | Titre | Partie | Durée | Statut |
| --- | --- | --- | --- | --- |
| CIN-00 | Ouverture | Titre | 60-75 s | [PROPOSÉ] |
| CIN-01 | Le casier vide | Prologue | 20 s | [PROPOSÉ] |
| CIN-02 | Deux ordres | Prologue | 30 s | [PROPOSÉ] |
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
| CIN-70 | Le silence d'Asphodèle | Station | 40 s | [PROPOSÉ] |
| CIN-71 | La voix de CASSIUS | Station S2 | 40 s | [PROPOSÉ] |
| CIN-72 | La plaque | Station S3 | 25 s | [PROPOSÉ] |
| CIN-80 | Premières lumières | Colonie, palier *Rétablie* | 30 s | [PROPOSÉ] |
| CIN-90 | Fins (×3) | Épilogue | 60 s | [PROPOSÉ] |

**Contraintes :** séquences scriptées dans le moteur Canvas 2D (plans fixes, parallaxe, panoramiques, cadres de dialogue avec portraits `npc-dialogue-portraits-v168.js`), pas de vidéos précalculées. Toutes passables et relisibles ; aucune récompense liée à leur affichage. Musique et sons originaux uniquement.

---

## 11. Raccordement technique — [PROPOSÉ]

1. **Contenu** : scènes sur le modèle de `PHASES` (`campaign-story-v160.js`) : `briefing`, `preparation`, `approach`, `deployment`, `player-control`.
2. **Persistance** : un état `storyCampaign` versionné (drapeaux `story-*`), un état `colonyV…` (chantiers, population, palier) et un état `stationV…` (modules, choix CASSIUS), avec migrations bornées qui ne touchent aucun identifiant existant.
3. **Récompenses** : versées uniquement dans la transaction de résolution d'opération, comme `applyCampaignStoryReturnV160`.
4. **Hub** : quêtes de bord exprimées comme faits de rapport (`NPC_RAPPORT_RULES_V135`, 64 faits maximum).
5. **Tests** par mission raccordée : accès, passage physique, retour, reprise de mission, reprise de sauvegarde.

**Ordre de production recommandé :** prologue (assemblage de l'existant) → Acte II + CIN-20 → front colonie intro et C1-C2 (base de la reconstruction) → Acte III → Acte I → front station intro et S1-S2 → interlude → Acte IV → S3-S4 et hub Asphodèle → Acte V et C5 → épilogue.

---

## 12. Points ouverts

| # | Question | Section |
| --- | --- | --- |
| 1 | Garder ou remplacer les noms et lieux d'un jeu existant présents dans le catalogue (Lethe, « Pioneer Station », ennemis et personnels de référence) ? Conserver le secteur `Cerberus` de Lethe ou proposer son rattachement au Tantalus Reach ? | §1.2 |
| 2 | Identité du signataire du badge : jamais (A) ou sous condition (B) ? | §5.7 |
| 3 | Mara Voss liée à I. Voss, ou homonymie ? | §8.3 |
| 4 | Opérations hors ton : archives MIRE ou seconde campagne ? | §9.2 |
| 5 | Le fil Echo-8 est-il conservé ? | §2.1, §7.4 |
| 6 | Noms proposés (Asphodèle, CASSIUS, Adèle Sarrazin, Tomas Wren, Lucia Ferro, Halloran, Grue) à valider. | §2.3 |
