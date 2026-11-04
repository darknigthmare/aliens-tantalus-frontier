# Aliens: Tantalus Frontier — Bible de campagne

> **Document de conception narrative, source uniquement.** Il n'est pas copié dans le build public.
> Fiction originale du projet (`provenance: tantalus-project-original`, `canonExact: false`).
> Aucune scène de film n'est reconstituée ; les noms de la franchise *Alien* restent la propriété de leurs ayants droit (voir `LICENSE_NOTICE.md`).

## 0. Comment lire ce document

Chaque élément porte un statut, pour ne jamais confondre ce qui tourne dans le jeu et ce qui reste à produire :

| Statut | Signification |
| --- | --- |
| **[EXISTANT]** | Jouable aujourd'hui ; le module source est cité. Le texte de ce document ne remplace pas celui du code. |
| **[PARTIEL]** | Un système ou une opération existe avec `implementationStatus: 'partial'` dans `src/special-operations-v67.js`. |
| **[PROPOSÉ]** | Contenu de conception à valider, puis à raccorder aux systèmes de contenu, de chargement, de jeu, d'interface et de sauvegarde. |
| **[À DÉCIDER]** | Point ouvert qui demande un arbitrage du propriétaire avant production. |

Les identifiants de contenu existants (`special-archive-relay`, `special-c12-horde`, `special-black-cocoon`, `special-narrative-qz17`, `crew-09-inez-harlow`, etc.) sont conservés tels quels. Les nouveaux identifiants proposés suivent le préfixe `story-` pour éviter toute collision avec les sauvegardes.

---

## 1. Concept

### 1.1 Pitch

**2204, système du Tantalus.** Sur la frontière coloniale, les messages de détresse arrivent en retard. Pas à cause des pannes : à cause des priorités. Quand un relais doit choisir entre une cargaison et des vivants, quelqu'un a déjà choisi.

Le joueur incarne la **Relève Echo-9**, réveillée en cryostase à bord de l'USS *Tantalus*. Sa mission officielle : restaurer les relais et évacuer les colons de Lethe. Sa mission réelle, qu'il découvre pièce par pièce : établir **qui** a fait passer le fret avant les vivants, et **ce que transportait ce fret**.

### 1.2 Thèmes et règles d'écriture

Ces règles prolongent le ton déjà établi dans `campaign-story-v160.js` et `campaign-lethe-story-v163.js` :

1. **Une preuve n'est pas une accusation.** Un badge prouve un droit d'accès, pas un visage. Les personnages (surtout Inez Harlow et MU/TH/UR) séparent toujours le fait établi, la pièce manquante et la supposition.
2. **Sortir vivant vaut mieux que gagner.** Les objectifs mesurent l'extraction, jamais le nombre de contacts abattus.
3. **Le fret contre les vivants.** Chaque acte remet ce choix devant le joueur sous une forme différente.
4. **Rien n'est automatique.** Un départ attend une commande, une balise n'est pas un embarquement, un retour n'est validé qu'au sas refermé.
5. **Le Tantalus est un foyer.** Entre deux sorties, l'équipage vit, doute et se souvient. Le hub porte la moitié de l'émotion de la campagne.

### 1.3 Vue d'ensemble

| Partie | Titre | Lieu principal | Statut du contenu jouable |
| --- | --- | --- | --- |
| Prologue | Relève Echo-9 | Tantalus → Port-Méridien | **[EXISTANT]** réveil, qualification, quai des vivants |
| Acte I | La cargaison fantôme | Lethe · QZ-17 | **[PARTIEL]** `special-narrative-qz17` |
| Acte II | Le dernier relais | Lethe · QZ-18 | **[EXISTANT]** `special-archive-relay` |
| Acte III | Corridor de feu | Lethe · corridor puis C-12 | **[EXISTANT]** convoi M577 + `special-c12-horde` |
| Interlude | Quarantaine | Tantalus | **[PROPOSÉ]** |
| Acte IV | Cocon noir | Lethe · galeries colonisées | **[EXISTANT]** `special-black-cocoon` |
| Acte V | La dernière course de Tantalus | Lethe · surface et complexe | **[PARTIEL]** `last-course-tantalus` |
| Épilogue | Ce que le retour devra raconter | Tantalus | **[PROPOSÉ]** |

---

## 2. Personnages

### 2.1 Le joueur

**Echo-9 (« la Relève Echo-9 »)** — opérateur des Marines coloniaux sorti de cryostase pour reprendre un poste laissé vacant. Le prénom, l'apparence et la tenue restent ceux du créateur de personnage ; la campagne ne fixe ni genre ni passé précis. Echo-9 parle peu, décrit ce qu'il fait (« Je prends les réserves au relais »), et garde toujours un trajet de retour en vue.

**[PROPOSÉ]** Fil personnel : Echo-9 découvre au fil des actes que la relève dont il prend la place, l'**Echo-8**, a disparu sur Lethe. Les archives MIRE évoquent l'unité, sans corps ni dossier de clôture. Ce fil se résout dans l'Acte IV (voir §6.4).

### 2.2 L'équipage du Tantalus

Les seize membres et leurs postes viennent de `HUB_NPC_ROSTER` (`src/hub-v52-runtime.js`). Les fonctions narratives sont **[PROPOSÉ]**.

| Pont | Salle | Personnage | Rôle | Fonction dans la campagne |
| --- | --- | --- | --- | --- |
| 0 | Passerelle | **Mara Vega** | Commandante | Porte l'ordre officiel ; doit choisir entre obéir à la compagnie et protéger les colons. |
| 0 | Briefing | **Tamsin Velez** | Sergente | Mentor de terrain ; accueille Echo-9 au prologue. |
| 0 | Info. de combat | **ECHO-A** | Synthétique tactique | Miroir d'Echo-9 ; questionne ce que « relève » veut dire. |
| 0 | Baie cryo | **DAVID-8R** | Synthétique récupéré | Premier visage du jeu ; sa mémoire endommagée cache une pièce du dossier. |
| 1 | Quartiers | **Asha Mbaye** | Liaison coloniale | Voix des colons de Lethe ; tient les relais coloniaux. |
| 1 | Mess | **Leila Sørensen** | Éclaireuse | Routes de survie ; ancienne colonne d'évacuation. |
| 1 | Infirmerie | **Noor Okafor** | Infirmier | Soigne, compte les morts, refuse qu'on les oublie. |
| 1 | Laboratoire | **BISHOP-9** | Officier scientifique synthétique | Analyse ; loyauté à la compagnie mise à l'épreuve. |
| 2 | Quarantaine | **Inez Harlow** | Xénobiologiste, liaison science | Conscience méthodologique de la campagne. |
| 2 | Armurerie | **Sanaa Doyle** | Smartgunner | Humour sec ; protectrice de l'escouade. |
| 2 | Atelier | **Pablo Reyes** | Démolitions | Brèches et charges ; regrette une opération passée. |
| 2 | Baie véhicules | **Cal Mercer** | Chef véhicules | Responsable du M577 ; attaché à son blindé. |
| 3 | Hangar dropship | **Maksim Orlov** | Pilote | Assure les insertions ; pilote du transport final. |
| 3 | Réacteur | **Idris Kwan** | Ingénieur | Maintient le vaisseau en vie ; tient les comptes de l'énergie. |
| 3 | Support-vie | **Jun Park** | Technicien | Réparations ; premier témoin de l'incident de quarantaine. |
| 3 | Réseau capteurs | **Rook** | Marine de reconnaissance, liaison reconnaissance | Voix radio de toutes les sorties. |

**MU/TH/UR** — ordinateur de bord. Neutre, exact, sans complaisance. Énonce les règles de validation et ne récompense jamais une action non prouvée.

**Recrues disponibles** (`src/crew-recruitment-v85.js`) : Mara Voss « RIVET », Nadia Bensaïd « SUTURE », Jonas Reed « BASTION », Jun Seo « BALISE ». Chacune reçoit une quête de recrutement au §12.3.

### 2.3 L'adversité

| Force | Nature | Statut |
| --- | --- | --- |
| **Infestation de Lethe** | Castes xénomorphes déjà présentes dans les missions (drone, guerrier, coureur, etc.). | **[EXISTANT]** |
| **La priorité de fret** | Un profil « priorité cargaison » signé sur QZ-18 à 18:43 avec le badge de I. Voss, contremaître, sans image exploitable (`archive-relay-state-v122.js`). | **[EXISTANT]** |
| **Le destinataire de la cargaison fantôme** | Le chariot FL-09 mène une masse anormale vers une destination absente du bon officiel. | **[EXISTANT]** (indice) / **[PROPOSÉ]** (suite) |
| **Le Bureau des Acquisitions Spéciales** | Service d'une compagnie qui commande des spécimens sous couvert de fret. Présent par documents, jamais par un méchant à l'écran avant l'Acte V. | **[PROPOSÉ]** |
| **Le signataire du badge** | Identité volontairement non établie dans l'Acte II. Révélée seulement si le joueur réunit les preuves (§7). | **[PROPOSÉ]** |

**[À DÉCIDER]** Nommer explicitement Weyland-Yutani comme commanditaire, ou garder une filiale fictive. Le projet référence déjà Weyland-Yutani dans son contenu (commandos, navette) ; une filiale fictive limite le risque de contradiction avec le canon.

---

## 3. Prologue — « Relève Echo-9 »

**But :** apprendre les commandes, rencontrer l'équipage, poser la question centrale (le fret contre les vivants) avant le premier tir sur Lethe.

### CIN-00 · Ouverture (titre) — [PROPOSÉ]

Durée cible : 60 à 75 s, non jouable, passable.

| Plan | Image | Son / texte |
| --- | --- | --- |
| 1 | Noir. Une ligne de télémétrie verte. | Bip de relais, régulier, puis un silence de deux secondes. |
| 2 | Relais QZ-18 au crépuscule de Lethe, antenne givrée. | Texte : `LETHE · RELAIS QZ-18 · 18:41` |
| 3 | Gros plan d'un pupitre : un brouillon de détresse s'écrit, puis passe en `EN ATTENTE`. | Le bip reprend, plus lent. |
| 4 | Un badge posé sur le pupitre, nom illisible. Une main hors champ le prend. | Aucune voix. |
| 5 | Le message part : `18:54`. | Texte : `TREIZE MINUTES` |
| 6 | Orbite. L'USS *Tantalus* sort de l'ombre de la planète. | Thème principal (`assets/audio/`). |
| 7 | Logo `ALIENS: TANTALUS FRONTIER`. | — |

**Pourquoi :** les horaires 18:41 / 18:42 / 18:54 sont ceux du dossier QZ-18. Le joueur les verra plus tard comme des preuves ; l'ouverture lui donne déjà l'impression de les connaître.

### P-1 · Réveil dans la baie cryogénique — [EXISTANT]

Modules : onboarding joueur, `hub-opening-v88.js`.

- Le poste de cryostase attend la confirmation de réveil ; DAVID-8R accueille la Relève Echo-9.
- Création du personnage (`player-creator-ui-v84.js`).
- Tamsin Velez rappelle la règle : avant une sortie, on identifie l'objectif et la voie de retour.

**Ajout [PROPOSÉ] — CIN-01 « Le casier vide » (20 s)** : en sortant de la baie, Echo-9 passe devant un casier marqué `ECHO-8`, vidé, scellé par MU/TH/UR. DAVID-8R : « Ce poste a été libéré. Je n'ai pas d'autre information. » Le joueur peut interagir ; aucune réponse de plus. Ce plan pose le fil personnel.

### P-2 · Qualification au pas de tir — [EXISTANT]

Module : `hub-opening-exercise-v89.js` (échelle, pas de tir, cibles, rétablissement de la liaison prioritaire en 3 s).

Rôle narratif : la « liaison prioritaire » interrompt l'exercice. **[PROPOSÉ]** La liaison relaie le premier écho de Lethe — un message colonial reçu avec treize minutes de retard. Mara Vega coupe l'exercice : départ immédiat pour Port-Méridien.

### P-3 · Port-Méridien, le quai des vivants — [EXISTANT]

Module : `port-meridien-v90.js`.

Déroulé existant : embarquer depuis la salle de briefing, porter un lot au triage, assister un blessé, réalimenter le sas, rassembler trois habitants et les guider vers le sas éclairé.

**Tissage narratif [PROPOSÉ]** :

- Port-Méridien est le port de transit où arrivent les évacués de Lethe.
- Au triage, le joueur porte **soit** un lot médical, **soit** une batterie pour le sas. Ce choix existe déjà ; il devient la première occurrence du thème « le fret contre les vivants ».
- Un docker dit en passant : « Les conteneurs scellés passent avant nous depuis trois semaines. » Première mention du fret prioritaire.

### CIN-02 · Deux ordres (fin du prologue) — [PROPOSÉ]

Retour au Tantalus, salle de briefing. Mara Vega projette la carte de Lethe : relais muets, colonie fragmentée.

> **Mara Vega** — Ordre de la compagnie : restaurer les relais, sécuriser le fret en attente. Ordre du Tantalus : ramener les vivants. Si les deux se contredisent, vous m'appelez.
>
> **Inez Harlow** — Et vous ramenez des relevés. Pas des impressions.

Écran : `ACTE I — LA CARGAISON FANTÔME`.

---

## 4. Acte I — « La cargaison fantôme » (QZ-17)

**Statut :** **[PARTIEL]** — `special-narrative-qz17` / `narrative-collectables-v68.js` (`FRONTIER`, `world-05-lethe`, 2204, intérieur de vaisseau vertical, 4 routes).

**Question de l'acte :** qu'est-ce qui a été déplacé sur QZ-17, et pourquoi le bon officiel ment-il ?

### 4.1 Preuves existantes

| Pièce | Ce qu'elle établit |
| --- | --- |
| PDA de quai — relève 02:00 | Transfert effectué malgré une validation de sécurité incomplète. |
| Courriel logistique — annulation QZ17-04 | Le responsable affirme que le transfert a été annulé avant tout déplacement. |
| Boîte noire FL-09 | Le chariot a bien bougé, avec une masse anormale, vers une destination absente du bon. |
| Sceau QZ17-04 — fragment intérieur | Sceau coupé après le monte-charge, avant l'arrivée annoncée en chambre froide. |

La contradiction PDA / courriel est le cœur de l'enquête ; la boîte noire tranche.

### 4.2 Déroulé — [PROPOSÉ] sur la base existante

1. **CIN-10 « Les quais déserts » (30 s)** : dropship d'Orlov, approche de QZ-17 sous la pluie. Rook : « Quatre accès. Aucun ne répond. »
2. **Exploration verticale** : récupérer les quatre pièces. Contacts xénomorphes rares, surtout des signes (traces de résine, conduits ouverts) : l'acte installe la peur avant le combat.
3. **Choix de piste (existant)** : *suivre la trace par la maintenance* ou *sécuriser la preuve en quarantaine*.
   - Maintenance → le joueur trouve **l'alcôve vide** : un berceau de transport refroidi, ouvert de l'intérieur. Gain : indice pour l'Acte IV.
   - Quarantaine → le fragment de sceau revient intact au Tantalus. Gain : Inez peut l'analyser (+recherche, et débloque la quête annexe *Le sceau*, §12.1).
4. **CIN-11 « Ouvert de l'intérieur » (25 s)** : quelle que soit la piste, le joueur voit une griffe d'acide sur l'intérieur d'un conteneur. Inez, par radio : « Ne concluez pas. Rapportez. »

### 4.3 Retour au Tantalus

Compte rendu avec Inez au labo de quarantaine. Trois questions, sur le modèle des retours QZ-18 :

- *Qu'est-ce qui a bougé ?* — Une charge lourde, réfrigérée, non déclarée.
- *Qui ment ?* — Le PDA et le courriel ne peuvent pas être vrais en même temps ; la boîte noire soutient le PDA.
- *Que transportait-on ?* — **Non établi.** Inez refuse de dire « spécimen » sans prélèvement.

**Conséquence durable :** drapeau `story-qz17-route` = `maintenance` | `quarantine`.

---

## 5. Acte II — « Le dernier relais » (QZ-18)

**Statut :** **[EXISTANT]** — `campaign-story-v160.js`, `archive-relay-state-v122.js`, `archive-relay-ui-v122.js`. Campagne « QZ-18 · LE DERNIER RELAIS ».

**Question de l'acte :** qu'est-ce qui a retardé la détresse ?

### 5.1 Ce que le jeu contient déjà

- **Briefing** « Le message arrivé trop tard » ; **préparation** « Ce que nous ferons des preuves » avec deux protocoles : *Audit technique* (+2 recherche) ou *Prévention à bord* (+2 moral), versés seulement avec le dossier complet et un retour validé.
- **Approche, déploiement, contrôle tactique** : PDA du quai ouest, relais à rétablir (E maintenu), ingénierie et sécurité en hauteur, fret au sol (F maintenu pour restaurer le brouillon), poste d'analyse, balise de retour à l'est.
- **Six pièces**, dont *Badge laissé au pupitre*, *Synchronisation des horloges*, *Alimentation sans interruption*, *Une identité, deux traces*, *Retard classé technique*, *Message de secours retenu*.
- **Conclusion juste** : *Détresse retardée par la priorité de fret* (et non *Dérive horaire et panne matérielle*).
- **Retour** : brouillon saisi à 18:41, mis en attente à 18:42, libéré à 18:54 ; badge de I. Voss laissé à 18:39, utilisé à 18:43 sans image ; la personne n'est pas identifiée.

### 5.2 Liens avec la campagne — [PROPOSÉ]

- Le profil « priorité cargaison » signé à 18:43 visait **la même série de scellés QZ17** que l'Acte I. C'est le premier lien entre les deux relais. Il n'apparaît qu'au retour, dans une quatrième question optionnelle débloquée si l'Acte I est terminé : *« Quel fret avait la priorité ? »*
- **CIN-20 « Treize minutes » (40 s)**, après le retour validé : Asha Mbaye lit à voix haute le message de détresse libéré à 18:54. Les noms des colons qui attendaient sont affichés. Pas de musique. Ce moment donne un poids humain à un chiffre.
- Mara Vega transmet le dossier à la compagnie. Réponse automatique : *« Priorité cargaison maintenue. »* Fin d'acte.

**Conséquence durable :** `story-qz18-protocol` = `technical-audit` | `crew-prevention` | `standard` (déjà déductible de la sauvegarde existante).

---

## 6. Acte III — « Corridor de feu » (convoi M577 → C-12)

### 6.1 Mission A · Ramener le blindé — [EXISTANT]

Modules : `campaign-convoy-story-v161.js`, `campaign-convoy-story-ui-v161.js`, campagne APC convoy.

Scènes existantes : « Ramener le blindé » (ordre de convoyage), « Ce que le retour devra raconter » (manifeste du M577), « Dernier contrôle avant départ », « La liaison reste ouverte », « Trois voies, une sortie ». Commandes : W/S pour changer de voie, Espace pour accélérer, F tourelle, R recharger. Bilan au retour : état du M577, relevé du corridor.

**Tissage [PROPOSÉ]** :

- **Le manifeste du M577 est le choix moral de l'acte.** La compagnie exige que le blindé ramène trois conteneurs scellés du dépôt ; Asha Mbaye demande qu'il ramène des colons. La capacité est limitée : chaque conteneur embarqué retire deux places.
- Le choix se fait dans l'écran de manifeste existant, enrichi d'un curseur fret / passagers.
- **CIN-30 « Le choix de Cal » (20 s)** : Cal Mercer tape sur la coque du M577. « Il porte ce qu'on lui donne. Décidez vite. »

### 6.2 Mission B · Une sortie plutôt qu'une victoire (C-12) — [EXISTANT]

Module : `campaign-lethe-story-v163.js` (`special-c12-horde`).

Déroulé existant : le corridor mène au complexe, l'ascenseur C-12 est en panne et coupe le repli ; activer le relais, quatre secondes d'avertissement, tenir quarante-cinq secondes de rétablissement, rejoindre le sas à droite et maintenir E deux secondes. Protocoles de compte rendu : *Bilan de l'ascenseur* ou *Bilan des axes*.

**Tissage [PROPOSÉ]** :

- Les colons ou conteneurs embarqués en 6.1 attendent dans le M577 au pied de C-12. Le joueur défend donc *quelque chose de précis* pendant les 45 secondes.
- Si des conteneurs ont été embarqués, l'un d'eux **frappe de l'intérieur** pendant la défense (son seulement, aucun ennemi supplémentaire). Inez : « Je ne l'ai pas entendu. Vous non plus. Notez l'heure. »

### CIN-31 · Fin d'acte « Le sas refermé » — [PROPOSÉ]

Le sas de C-12 se ferme. Silence. Dans le hangar du Tantalus, les colons descendent — ou les conteneurs sont déchargés sous scellés par BISHOP-9, sur ordre de la compagnie. Plan final sur l'écran de quarantaine : `CONTRÔLE BIOLOGIQUE · 1 ANOMALIE`.

**Conséquence durable :** `story-m577-manifest` = nombre de colons (0-6) et de conteneurs (0-3) ramenés.

---

## 7. Interlude — « Quarantaine » (à bord du Tantalus) — [PROPOSÉ]

**Pourquoi un interlude :** le hub doit devenir dangereux une fois, pour que le joueur tienne à ce foyer. Le projet référence déjà une « Ruche expérimentale du Tantalus » et des « Tantalus Tunnel Vermin » dans son contenu ; cet interlude leur donne une place narrative.

### 7.1 Déclencheur

- Si des conteneurs ont été ramenés en Acte III : l'un d'eux s'est ouvert en quarantaine.
- Sinon : une forme larvaire a voyagé dans le train d'atterrissage du dropship (le joueur ne peut pas tout éviter, seulement l'ampleur).

### 7.2 Déroulé

1. **CIN-40 « Jun Park ne répond plus » (30 s)** : alerte au support-vie, pont 3. Les PNJ passent en phase de routine `alert` (déjà prévue dans `NPC_ROUTINE_PHASES_V62`).
2. **Traque** dans les conduits et les ponts 2 et 3 avec les systèmes de survie (soudure de portes, routage d'énergie, caméras, acide persistant — `alien-survival-systems`, **[EXISTANT]** comme système).
3. **Sauver Jun Park** dans les conduits du support-vie.
4. **Choix** : 
   - tuer la créature (sécurité, perte de l'échantillon) ;
   - la capturer pour BISHOP-9 et Inez (laboratoire, gain de recherche, risque de rechute plus tard).
5. **CIN-41 « Ce que BISHOP-9 savait »** : en relisant les journaux de quarantaine, Inez découvre que BISHOP-9 avait reçu un ordre de priorité de la compagnie : préserver tout spécimen. Il ne l'a pas caché, mais personne ne lui a demandé. Dialogue court ; la confiance de l'équipage envers BISHOP-9 baisse d'un niveau (`NPC_TRUST_LEVELS_V62`).

**Conséquences durables :** `story-quarantine-outcome` = `destroyed` | `captured` ; confiance BISHOP-9.

---

## 8. Acte IV — « Cocon noir »

**Statut :** **[EXISTANT]** — `campaign-lethe-story-v163.js` (`special-black-cocoon`), `black-cocoon-state-v121.js`, `black-cocoon-runtime-v121.js`.

### 8.1 Ce que le jeu contient déjà

Briefing « Une liaison a disparu » : dernière liaison depuis les galeries de Lethe, le dossier reprend au premier signe de conscience de l'opérateur, sa capture n'a pas de témoin. Le joueur coupe la résine (E maintenu, ou F plus bruyant), récupère le sac, rétablit le relais, ouvre une sortie (industrielle ou circuit de refroidissement), rejoint le transport Kappa, tient la zone 90 secondes, puis termine le contrôle biologique à bord. Protocoles : *Trajet d'exfiltration* ou *Contrôle du retour*.

### 8.2 Ce qui précède la capture — [PROPOSÉ]

Le jeu existant commence volontairement *après* la capture, sans témoin. La campagne respecte ce choix :

- **CIN-50 « Les dernières images » (35 s)** : caméra casque d'Echo-9, image dégradée. Le joueur suit un signal de balise dans le dépôt de QZ-17 — la destination absente du bon officiel. Le signal est celui de l'**Echo-8**. L'image se coupe sur une silhouette au plafond.
- Le joueur ne joue pas la capture. Elle reste une lacune assumée, cohérente avec le dossier « sans témoin exploitable ».

### 8.3 Découverte dans les galeries — [PROPOSÉ]

- Dans la galerie basse, le joueur trouve des **berceaux de transport refroidis** identiques à celui de l'alcôve de QZ-17 (Acte I, piste maintenance), marqués de la série QZ17.
- Il trouve aussi la plaque d'identité de l'Echo-8 dans la résine. Pas de corps. Interaction optionnelle ; Echo-9 : « Je la prends. Elle rentre avec moi. »
- **Révélation de l'acte :** la cargaison fantôme était une livraison *vers* la ruche, pas *depuis* elle. Quelqu'un nourrissait et étudiait la colonie de Lethe. La priorité de fret servait à garder ce trafic hors des registres d'évacuation.

### CIN-51 · Contrôle biologique — [PROPOSÉ]

Dans la baie du Tantalus, le scanner balaie Echo-9. Noor Okafor attend, les mains vides. Résultat : `NÉGATIF`. Noor : « Bon retour. Cette fois, je l'écris. » Si la plaque de l'Echo-8 a été récupérée, elle est déposée dans le casier vide du prologue.

**Conséquences durables :** `story-echo8-tag` (récupérée ou non), `story-cocoon-exit` (`industrial` | `cooling`).

---

## 9. Acte V — « La dernière course de Tantalus »

**Statut :** **[PARTIEL]** — opération `last-course-tantalus` : course APC ancrée à droite, voies, hordes continues, Crushers, poursuite de Reine et score.

### 9.1 Situation — [PROPOSÉ]

La compagnie déclare Lethe « perte d'actif » et programme l'abandon de la colonie dans 48 heures. Le dernier convoi part du complexe vers le port spatial. Le Tantalus a assez de place pour les colons **ou** pour le contenu du dépôt QZ-17 que la compagnie réclame officiellement.

### 9.2 Préparation au Tantalus — [PROPOSÉ]

- **Conseil de guerre** dans la salle de briefing. Chaque membre de l'équipage donne un avis ; ceux dont la confiance est *solide* (`NPC_TRUST_LEVELS_V62`) proposent un bonus de mission (Sanaa : tourelle renforcée, Cal : blindage du M577, Orlov : fenêtre d'extraction plus longue, Leila : itinéraire alternatif).
- **Choix de commandement de Mara Vega** : obéir à l'ordre d'abandon (récupérer le dépôt) ou désobéir (évacuer tout le monde). Le joueur ne décide pas à sa place ; il présente le dossier. Ce que Vega décide dépend des preuves réunies (§10).

### 9.3 Déroulé de la course

1. **CIN-60 « Dernier départ » (30 s)** : le M577 sort du complexe sous la pluie. Cal au volant, Echo-9 à la tourelle.
2. **Course APC [PARTIEL]** : trois voies, hordes continues, Crushers.
3. **Point médian [PROPOSÉ]** : un pont s'effondre. Le joueur doit lâcher la remorque de fret ou la remorque des colons en retard (si Vega a désobéi, il n'y a pas de remorque de fret et la perte touche des réserves de munitions à la place).
4. **Poursuite de Reine [PARTIEL]** : la Reine de Lethe sort de la ruche, nourrie par les livraisons du dépôt.
5. **Port spatial** : le dropship d'Orlov attend. Tenir 60 secondes. Embarquement.

### CIN-61 · Lethe derrière eux — [PROPOSÉ]

Depuis le hublot du dropship : la colonie, la ruche qui s'étend, et la lumière du port qui s'éteint. Rook, à la radio, fait l'appel des colons embarqués. Le nombre affiché est celui que le joueur a réellement sauvé sur toute la campagne (Port-Méridien, M577, convoi final).

---

## 10. Choix, preuves et fins

### 10.1 Le dossier final

La campagne tient un dossier d'enquête unique, `story-dossier`, alimenté par les actes :

| Pièce | Source | Condition |
| --- | --- | --- |
| Contradiction PDA / courriel | Acte I | Les quatre pièces QZ-17 |
| Fragment de sceau QZ17-04 | Acte I | Piste quarantaine |
| Berceau ouvert de l'intérieur | Acte I | Piste maintenance |
| Priorité de fret à 18:43 | Acte II | Dossier QZ-18 complet et validé |
| Ordre de préservation de BISHOP-9 | Interlude | Journaux de quarantaine lus |
| Berceaux série QZ17 dans la ruche | Acte IV | Galerie basse explorée |
| Plaque de l'Echo-8 | Acte IV | Récupérée |

### 10.2 Identité du signataire — [À DÉCIDER]

Le jeu existant affirme que la personne qui a utilisé le badge de I. Voss n'est pas identifiée. Deux options compatibles :

- **Option A — elle ne l'est jamais.** La campagne accuse un système (la priorité de fret), pas une personne. Plus fidèle au ton actuel.
- **Option B — elle ne l'est qu'avec 6 pièces sur 7.** Le recoupement des horaires du dépôt QZ-17 et du poste fret QZ-18 désigne le responsable logistique cité dans le courriel d'annulation de l'Acte I. Avec moins de pièces, l'identité reste « non établie ».

Recommandation : Option B, avec un texte de retour qui rappelle ce qui reste non prouvé, même quand l'identité est établie.

### 10.3 Fins — [PROPOSÉ]

| Fin | Condition | Résultat |
| --- | --- | --- |
| **« Le relais parle »** | Vega a désobéi + dossier ≥ 5 pièces | Le dossier est diffusé sur tous les relais coloniaux par Asha. La compagnie perd le contrôle du récit. Le Tantalus devient un vaisseau sans port d'attache. |
| **« Le fret d'abord »** | Vega a obéi | Le dépôt est récupéré, la colonie partiellement évacuée. Inez démissionne. Le dossier est classé « retard technique ». |
| **« Les vivants, sans preuve »** | Vega a désobéi + dossier < 5 pièces | Les colons sont sauvés, mais le dossier ne tient pas. Vega est relevée de son commandement à l'arrivée. |

Aucune fin ne tue Echo-9 : la mort en mission reste gérée par les systèmes d'échec et de reprise existants.

---

## 11. Épilogue — « Ce que le retour devra raconter » — [PROPOSÉ]

Jouable, sans combat. Le joueur se promène dans le Tantalus après la campagne. Chaque membre de l'équipage a une dernière réplique qui dépend des fins et des quêtes annexes. La baie cryogénique se rouvre : un nouveau poste de relève est préparé. Sur le casier de l'Echo-8, une étiquette : `RETOUR CONFIRMÉ` (si la plaque a été ramenée) ou `POSTE LIBÉRÉ` (sinon).

Dernier texte à l'écran, version « Le relais parle » : `QZ-18 · 18:41 · MESSAGE TRANSMIS SANS DÉLAI.`

---

## 12. Quêtes du Tantalus (hub) — [PROPOSÉ]

Les quêtes de bord utilisent les systèmes de rapport existants (`npc-dialogue-v62.js`) : niveaux de confiance `fragile → prudent → operationnel → solide`, choix de rapport `request-candid-assessment`, `acknowledge-welfare`, `review-mission`, `confirm-alert-role`, `request-infestation-evidence`, renouvellement après 8 heures de jeu. Chaque quête se termine par un gain de confiance, de moral ou de recherche — jamais d'une récompense versée avant la preuve de réalisation.

### 12.1 Quêtes personnelles de l'équipage

| ID proposé | Personnage | Titre | Disponible après | Résumé | Récompense |
| --- | --- | --- | --- | --- | --- |
| `story-crew-vega` | Mara Vega | **La ligne de commandement** | Acte II | Relire avec elle les ordres reçus depuis le prologue et identifier ceux qui contredisent la mission de sauvetage. | Confiance, influence sur le choix de l'Acte V |
| `story-crew-velez` | Tamsin Velez | **Le pas de tir** | Prologue | Battre ses temps de qualification ; elle raconte son premier déploiement raté. | Moral, dotation d'assaut |
| `story-crew-echo-a` | ECHO-A | **Deux relèves** | Acte IV | Comparer ses protocoles avec la plaque de l'Echo-8. Il pose la question : « Quand tu seras remplacé, qui remarquera ? » | Confiance, fin d'épilogue spécifique |
| `story-crew-david` | DAVID-8R | **Mémoire récupérée** | Acte I | Rapporter trois composants trouvés en mission pour restaurer un secteur de sa mémoire : il a été récupéré sur une épave de la compagnie. | Recherche, pièce optionnelle du dossier |
| `story-crew-mbaye` | Asha Mbaye | **Les noms de Lethe** | Acte II | Compléter la liste des colons en attente avec les registres des relais. | Moral, + colons récupérables en Acte V |
| `story-crew-sorensen` | Leila Sørensen | **La route de Kestrel** | Acte III | Cartographier une route de survie alternative pour la course finale. | Itinéraire alternatif Acte V |
| `story-crew-okafor` | Noor Okafor | **Le registre des pertes** | Acte III | Rapporter les plaques des colons morts trouvées en mission ; il refuse de laisser des noms dans la résine. | Moral, soins de campagne améliorés |
| `story-crew-bishop` | BISHOP-9 | **Directive de préservation** | Interlude | Lui demander ce qu'il ferait si l'ordre de la compagnie et la vie d'un membre de l'équipage se contredisaient. Réponse différente selon la confiance. | Restaure la confiance perdue à l'interlude |
| `story-crew-harlow` | Inez Harlow | **Le sceau** | Acte I (piste quarantaine) | Analyser le fragment QZ17-04 au laboratoire : résidu biologique et colle industrielle. | Recherche, pièce du dossier |
| `story-crew-doyle` | Sanaa Doyle | **Calibrage lourd** | Acte III | Récupérer des pièces de smartgun sur un poste de sécurité abandonné. | Tourelle M577 renforcée Acte V |
| `story-crew-reyes` | Pablo Reyes | **La charge de trop** | Acte III | Il avoue avoir fait sauter un accès trop tôt lors d'une ancienne évacuation. Retrouver le registre de cette opération. | Confiance, charges de brèche |
| `story-crew-mercer` | Cal Mercer | **Remettre le M577 en état** | Acte III | Réparer le blindé avec des pièces récupérées ; l'état du M577 au bilan existant sert de point de départ. | Blindage Acte V |
| `story-crew-orlov` | Maksim Orlov | **Fenêtre de tir** | Acte IV | Récupérer les enregistreurs du transport Kappa : Orlov veut savoir pourquoi le transport a mis si longtemps. | Fenêtre d'extraction plus longue Acte V |
| `story-crew-kwan` | Idris Kwan | **Le réacteur ne ment pas** | Prologue | Réparer le réseau du réacteur (service existant `service:power`) ; il découvre une consommation inexpliquée au pont de quarantaine. | Énergie, indice de l'interlude |
| `story-crew-park` | Jun Park | **Après les conduits** | Interlude | Jun a peur des conduits du support-vie depuis l'incident. Les sécuriser avec lui. | Moral, oxygène |
| `story-crew-rook` | Rook | **Ce que les capteurs ont vu** | Acte II | Retrouver dans les balayages de reconnaissance la trajectoire d'une navette non déclarée au-dessus de QZ-17. | Pièce optionnelle du dossier |

### 12.2 Quêtes de vie à bord

| ID proposé | Titre | Lieu | Résumé |
| --- | --- | --- | --- |
| `story-ship-mess` | **Repas de relève** | Mess | Réunir quatre membres d'équipage au même service ; scène de dialogue collectif qui change selon l'acte. |
| `story-ship-cryo` | **Le casier vide** | Baie cryo | Fil de l'Echo-8, relancé à chaque acte par un nouvel indice. Se ferme à l'Acte IV. |
| `story-ship-sensor` | **Écoute de nuit** | Réseau de capteurs | Pendant la phase `break`, capter des fragments de messages coloniaux en retard. Chaque fragment débloque un nom pour *Les noms de Lethe*. |
| `story-ship-armory` | **Inventaire contradictoire** | Armurerie | Le registre d'armes ne correspond pas aux râteliers. Petite enquête interne qui forme aux méthodes de l'Acte II. |
| `story-ship-vehicle` | **Le badge du M577** | Baie véhicules | Une plaque de convoi d'un ancien équipage, trouvée dans le blindé. |
| `story-ship-bioforge` | **Ce qu'on garde en vie** | Bioforge | Débat Inez / BISHOP-9 sur la Bioforge. Débloque l'accès narratif à la Bioforge (**[PARTIEL]** comme système). |

### 12.3 Quêtes de recrutement

| Recrue | Titre | Résumé |
| --- | --- | --- |
| **Mara Voss « RIVET »** | **Le même nom** | Voss porte le même nom que le contremaître I. Voss de QZ-18. **[À DÉCIDER]** lien familial ou simple homonymie. Si lien : elle rejoint l'équipage pour prouver que son parent n'a pas signé à 18:43. Sa motivation existante (« travailler sur le terrain plutôt que réparer après coup les conséquences des décisions ») la rend compatible. |
| **Nadia Bensaïd « SUTURE »** | **Pas de blessé sans extraction** | Sauver une équipe médicale coincée à Port-Méridien. |
| **Jonas Reed « BASTION »** | **Sécurité embarquée** | Ancien agent de sécurité sur des cargos ; il a vu passer des scellés QZ17. Le recruter apporte un témoignage au dossier. |
| **Jun Seo « BALISE »** | **Itinéraires terrestres** | Connaît les routes de convoi de Lethe ; le recruter avant l'Acte III réduit la difficulté du corridor. |

---

## 13. Opérations secondaires (hors Tantalus)

Les opérations de `special-operations-v67.js` sont classées selon leur place dans la fiction. Les statuts sont ceux du code.

### 13.1 Liées à la trame de Lethe

| Opération | Statut | Place proposée | Accroche narrative [PROPOSÉ] |
| --- | --- | --- | --- |
| **Cargo Brutal** | **[EXISTANT]** effective, ordre 1 | Entre prologue et Acte I | Escorter un cargo civil vers Port-Méridien ; premier contact avec la priorité de fret. |
| **Systèmes de survie Alien** | **[EXISTANT]** effective, ordre 4 | Entre Actes I et II ; mécaniques réutilisées dans l'interlude | Évasion d'une quarantaine sur Lethe (`escape the quarantine`) : un poste médical de la colonie, auto-destruction, portes soudables. |
| **Doctrine Alpha / Bravo** | **[PARTIEL]**, ordre 3 | Entre Actes II et III | Défense de colonie à cinq routes, minimum 4 membres d'équipage : protéger le dépôt d'évacuation avant le départ du M577. |
| **Opération Abysse Noir** | **[PARTIEL]**, ordre 8 | Entre Actes IV et V | Dropship modulaire, escortes et bombardements : couvrir l'arrivée des transports d'évacuation. Débloque l'escadrille alliée pour l'Acte V. |
| **Broodstorm** | **[PARTIEL]**, ordre 17 | Optionnelle, après Acte III | Exploration sous-marine (scaphandre HADAL, sous-marin MANTA-6) : les berceaux QZ17 arrivaient-ils par la mer ? |

### 13.2 Archives MIRE (continuité séparée)

Le contenu du projet évoque déjà les « archives MIRE et anomalies temporelles ». **[PROPOSÉ]** Les opérations qui s'éloignent du ton de Lethe sont présentées comme des **archives MIRE** consultées depuis le laboratoire ou le centre d'information de combat : des reconstitutions, des simulations ou des dossiers historiques. Elles n'affectent pas le dossier de la campagne principale et gardent leur sauvegarde isolée quand elle est prévue (c'est le cas de Mire Archive 001).

| Opération | Statut | Cadre MIRE proposé |
| --- | --- | --- |
| **Mire Archive 001 : Nostromo** | **[PARTIEL]**, ordre 7 | Archive historique la plus ancienne ; score de synchronisation. |
| **Protocole Z-110** | missing, ordre 9 | Dossier d'un programme de Power Loaders de nouvelle génération. |
| **Jeri : le faux fils** | missing, ordre 10 | Infiltration par profils phéromonaux ; dossier d'expérience. |
| **Éloïse : la reine sans couronne** | missing, ordre 11 | Synthétique hybride et ruche : archive à fins ramifiées. |
| **A.T.A.X.-Q : la fausse reine** | missing, ordre 12 | Programme d'armure-reine. |
| **Le chant de la Reine-Mère** | missing, ordre 13 | Archive biologique sur l'influence maternelle. |
| **Talos contre le Titan** | missing, ordre 14 | Essai de combat à grande échelle. |
| **LV-XENO : la ruche-monde** | missing, ordre 15 | Archive d'un monde entièrement colonisé. |
| **Pangaea : la seconde extinction** | missing, ordre 16 | Archive d'écosystème préhistorique contaminé. |

**[À DÉCIDER]** Garder ces opérations comme archives MIRE (cohérence maximale avec Lethe), ou les intégrer dans une seconde campagne.

---

## 14. Tableau des cinématiques

| ID | Titre | Acte | Durée cible | Passable | Statut |
| --- | --- | --- | --- | --- | --- |
| CIN-00 | Ouverture | Titre | 60-75 s | Oui | [PROPOSÉ] |
| CIN-01 | Le casier vide | Prologue | 20 s | Oui | [PROPOSÉ] |
| CIN-02 | Deux ordres | Prologue | 30 s | Oui | [PROPOSÉ] |
| CIN-10 | Les quais déserts | I | 30 s | Oui | [PROPOSÉ] |
| CIN-11 | Ouvert de l'intérieur | I | 25 s | Oui | [PROPOSÉ] |
| CIN-20 | Treize minutes | II | 40 s | Oui | [PROPOSÉ] |
| CIN-30 | Le choix de Cal | III | 20 s | Oui | [PROPOSÉ] |
| CIN-31 | Le sas refermé | III | 30 s | Oui | [PROPOSÉ] |
| CIN-40 | Jun Park ne répond plus | Interlude | 30 s | Oui | [PROPOSÉ] |
| CIN-41 | Ce que BISHOP-9 savait | Interlude | 45 s | Oui | [PROPOSÉ] |
| CIN-50 | Les dernières images | IV | 35 s | Oui | [PROPOSÉ] |
| CIN-51 | Contrôle biologique | IV | 25 s | Oui | [PROPOSÉ] |
| CIN-60 | Dernier départ | V | 30 s | Oui | [PROPOSÉ] |
| CIN-61 | Lethe derrière eux | V | 45 s | Oui | [PROPOSÉ] |
| CIN-70 | Fin (×3) | Épilogue | 60 s | Oui | [PROPOSÉ] |

**Contraintes de production :**

- Moteur : Canvas 2D en modules ES (`AGENTS.md`). Les cinématiques sont des séquences scriptées dans le moteur existant (plans fixes, parallaxe, panoramiques, cadres de dialogue avec portraits `npc-dialogue-portraits-v168.js`), pas des vidéos précalculées.
- Toutes passables, toutes relisibles depuis les archives du Tantalus, aucune récompense versée par l'affichage ou le passage d'une cinématique (même règle que les comptes rendus V160/V163).
- Musique et effets : compositions originales uniquement (`LICENSE_NOTICE.md`).

---

## 15. Raccordement technique — [PROPOSÉ]

Pour qu'un acte cesse d'être un prototype, il doit être relié (`AGENTS.md`, règles d'intégration) :

1. **Contenu** : textes de scène sur le modèle de `PHASES` dans `campaign-story-v160.js` (`briefing`, `preparation`, `approach`, `deployment`, `player-control`).
2. **Persistance** : un état `storyCampaign` versionné dans la sauvegarde, contenant les drapeaux `story-*` de ce document, avec migration bornée qui ne modifie aucun identifiant existant.
3. **Récompenses** : versées uniquement dans la transaction de résolution d'opération, jamais par une interface, comme `applyCampaignStoryReturnV160`.
4. **Hub** : quêtes de bord exprimées comme faits de rapport (`NPC_RAPPORT_RULES_V135`, 64 faits maximum).
5. **Tests** : pour chaque acte raccordé, vérifier accès logique, passage physique, retour, reprise de mission et reprise de sauvegarde.

**Ordre de production recommandé :** prologue (assemblage de l'existant) → Acte II (déjà complet, ajouter CIN-20) → Acte III (manifeste fret/passagers) → Acte I (compléter QZ-17) → Acte IV → interlude → Acte V → épilogue.

---

## 16. Points ouverts

| # | Question | Section |
| --- | --- | --- |
| 1 | Weyland-Yutani nommé, ou filiale fictive ? | §2.3 |
| 2 | Identité du signataire du badge : jamais (A) ou sous condition (B) ? | §10.2 |
| 3 | Mara Voss liée à I. Voss, ou homonymie ? | §12.3 |
| 4 | Opérations hors ton : archives MIRE ou seconde campagne ? | §13.2 |
| 5 | Le fil Echo-8 est-il conservé ? Il ajoute une motivation personnelle mais crée un personnage absent. | §2.1 |
