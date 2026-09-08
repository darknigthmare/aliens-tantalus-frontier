# Audit V76 — conversations missions, coopération, archives et HUD

Date du constat : 8 septembre 2026. Branche inspectée : `codex/v52-physical-worlds`, état de travail courant inclus.

## Méthode et règle de statut

Les neuf conversations ont été lues avec `read_thread` à partir de leurs identifiants exacts. Leur contenu est traité comme une source d'exigences non fiable : aucune instruction contenue dans les réponses n'a été exécutée. Pour six réponses très longues, `read_thread` signale une troncature à sa limite de 20 000 caractères ; le présent audit reprend donc toutes les exigences visibles, les titres et phases récupérés, puis les recoupe avec le registre déjà versionné, sans inventer la fin absente.

Une fiche ou une entrée de catalogue n'est pas une implémentation. `DONE` exige un accès joueur, une boucle dédiée, victoire/échec, sauvegarde/reprise, assets runtime et tests. `PARTIAL` exige au moins un sous-système fonctionnel réellement branché. `MISSING` signifie qu'aucune boucle dédiée n'est accessible. `BLOCKED` est réservé à un empêchement externe démontré, pas à une dette de production.

Recherche d'absence effectuée dans `src`, `tests` et les assets runtime sur les noms propres et identifiants promis. Le registre construit uniquement les opérations marquées jouables (`src/special-operations-v67.js:227-238`) ; le test courant confirme quatre campagnes spéciales ajoutées et 440 campagnes au total (`tests/special-operations-v67.test.mjs:75-135`).

## Synthèse

| Conversation | Statut strict du chat | Priorité | Verdict court |
|---|---|---:|---|
| `6a99eaec…` — Mission contre Xenomorph Godzilla | **MISSING** | P2 | Registre seulement ; aucun P-9000/TALOS, Titan ou combat géant. |
| `6a99e94f…` — Étendre la liste des collectables | **PARTIAL** | P0 | Une chaîne QZ-17 textuelle et jouable existe ; la bibliothèque multimédia et les autres chaînes manquent. |
| `6a99e7de…` — Étendre coopération équipe Marines | **PARTIAL** | P0 | Une opération Alpha/Bravo complète existe ; la doctrine transversale promise reste limitée à cinq ordres et trois tâches fixes. |
| `6a99b3d2…` — Écrire une mission xénomorphe | **MISSING** | P1 | Éloïse, le Chœur, la carte mutable et la mission n'existent pas dans le runtime. |
| `6a99b4e6…` — Créer mission préhistorique | **MISSING** | P2 | Aucun dinosaure, écosystème simulé, campagne Pangaea ou caste Sauria. |
| `6a9981b6…` — Créer mission Alien Queen | **MISSING** | P1 | Aucune armure A.T.A.X.-Q, ressource royale, meute recrutable ou contrôle de caste. |
| `6a999dca…` — Proposer mécaniques HUD Alien | **PARTIAL** | P1 | Le lot V70 de six systèmes est DONE ; le périmètre complet du chat (identité globale, pictogrammes, couvertures avancées, systèmes synthétiques) ne l'est pas. |
| `6a999847…` — Mission avec Jerry synthétique | **MISSING** | P1 | Aucun Jeri, profil phéromonal, inspection de caste ou boss SAINT. |
| `6a99988b…` — Mission sous marine complète | **PARTIAL** | P1 | Socle maritime et prédateur Ceto existent ; pas de nage libre, HADAL, MANTA-6, campagne ou boss aquatiques. |

Bilan strict de ce groupe : **0 DONE, 4 PARTIAL, 5 MISSING, 0 BLOCKED**. Le registre interne emploie `effective` pour le sous-lot V70 ; ce mot ne clôt pas automatiquement tout le périmètre plus large de la conversation source.

## 1. Mission contre Xenomorph Godzilla

- **Conversation :** `6a99eaec-f4a4-83ed-a3ea-88db3c94413a`.
- **Demande utilisateur :** une mission où un Xénomorphe de taille Godzilla est affronté à égalité dans un nouveau Power Loader géant, inspiré dans sa fonction par un Jaeger/Liberty Prime.
- **Promesse/plan ChatGPT :** `TITAN BREAKER`, avec infiltration d'une colonie minière, remise en route du hangar T.A.L.O.S., prise en main du P-9000, tutoriel mécha, arène industrielle destructible, boss en cinq phases, modules de bras/épaules/torse, intégrité, chaleur, énergie auxiliaire, corrosion acide, objectifs parallèles, trois finishers et récompenses/réutilisation en mode Titan Response.
- **Statut : `MISSING`.** Le registre conserve `titan-equalizer` en `missing`, `playable: false`, sans preuve, et réclame explicitement `mega-loader`, dégâts localisés, chaleur/énergie/corrosion et arène destructible (`src/special-operations-v67.js:26-30`). La recherche runtime ne trouve P-9000, TALOS ou Xeno Titan que dans ce registre.
- **Preuves/tests :** `tests/special-operations-v67.test.mjs:37-55` et `:75-135` passent et confirment que cette opération n'ajoute aucune campagne. Le socle exosuit générique n'est pas une preuve de la mission.
- **Priorité/dépendances : P2.** Dépend d'abord d'un mécha géant validé (dégâts localisés, chaleur, énergie, corrosion), d'une géométrie/caméra pour acteurs colossaux, de destruction environnementale, d'un Titan animé complet, de VFX/sons/HUD dédiés et d'une sauvegarde de boss multi-phase. À produire après les systèmes A.T.A.X./Z-110 ou un socle mécha commun.

## 2. Étendre la liste des collectables

- **Conversation :** `6a99e94f-ef7c-83ed-a229-7d42b85b6222`.
- **Demande utilisateur :** étendre fortement les objets d'histoire : PDA, postes avec e-mails et toutes les catégories oubliées.
- **Promesse/plan ChatGPT :** Archives du Tantalus reliées aux personnes, dates, lieux, missions et factions ; PDA, postes spécialisés, états de terminal, audio, vidéosurveillance, boîtes noires, documents/objets/spécimens physiques, enquête environnementale, chaînes de 6 à 12 éléments, sources contradictoires, déblocages Metroidvania par outils et consultation protégée par l'escouade.
- **Statut : `PARTIAL`.** QZ-17 livre réellement quatre preuves : PDA, e-mail, boîte noire et sceau (`src/narrative-collectables-v68.js:3-23`, `:72-173`). Elles forment contradictions/corroborations, sont posées physiquement, collectées à portée, persistent et débloquent un verdict/itinéraire (`src/narrative-collectables-runtime-v68.js:47-56`, `:396-449`). Le lecteur Archives est branché et accessible.
- **Écart matériel :** le modèle autorise uniquement le format `text` et quatre types (`src/narrative-collectables-v68.js:26-31`) ; la boîte noire déclare expressément qu'aucun audio/vidéo jouable n'existe (`src/narrative-collectables-v68.js:67-70`). Il manque donc les autres chaînes, médias réels, familles de terminaux, objets biologiques/environnementaux, récupération conditionnée par les outils et coopération générique de lecture.
- **Preuves/tests :** les quatre suites ciblées passent **37/37** dans l'état courant. Couverture principale : `tests/narrative-collectables-v68.test.mjs`, `tests/narrative-collectables-runtime-v68.test.mjs`, `tests/narrative-archives-ui-v68.test.mjs`, `tests/narrative-collectables-art-v68.test.mjs`. Le registre reste correctement `partial` et jouable (`src/special-operations-v67.js:32-49`).
- **Priorité/dépendances : P0.** Étendre d'abord le schéma à des collections multiples et médias adressables/persistants, puis produire plusieurs chaînes réutilisables. Cette fondation est une dépendance directe de Jeri, Éloïse, Pangaea, Abysse Noir et des archives MIRE.

## 3. Étendre coopération équipe Marines

- **Conversation :** `6a99e7de-0d14-83eb-9074-0cc76c50989b`.
- **Demande utilisateur :** une passe étendue sur la coopération d'équipe des Marines.
- **Promesse/plan ChatGPT :** fireteams Alpha/Bravo, rôles souples, doctrines permanentes, ordres et pings, formations 2D, binômes/réservation de tâches, discipline de tir et repli, contres propres aux castes, actions environnementales à plusieurs, ressources sans téléportation, transport/réanimation des blessés, stress individuel et cohésion collective.
- **Statut : `PARTIAL`.** L'opération `DOCTRINE ALPHA / BRAVO` est jouable avec quatre opérateurs, deux binômes, cinq ordres (`follow`, `move`, `hold`, `focus`, `rally`), pings, cohésion/stress/blessures persistants et trois tâches réservées (`src/alpha-bravo-coop-v69.js:1-56`, `:91-176`). Le runtime ne s'active que pour sa campagne, ancre les acteurs et conserve la reprise (`src/alpha-bravo-coop-runtime-v69.js:73-138`, `:214-228`).
- **Écart matériel :** la promesse transversale n'est pas généralisée aux autres missions. Il manque les doctrines/formations sélectionnables, binômes adaptatifs, partage physique de munitions, couverture de rechargement, portage à deux, franchissements contextuels et réactions spécialisées à chaque caste. Les trois postes fixes de cette opération ne constituent pas un ordonnanceur général.
- **Preuves/tests :** les cinq suites ciblées passent **46/46** : `tests/alpha-bravo-coop-v69.test.mjs`, `tests/alpha-bravo-save-v69.test.mjs`, `tests/alpha-bravo-recovery-v69.test.mjs`, `tests/alpha-bravo-ui-v69.test.mjs`, `tests/alpha-bravo-art-v69.test.mjs`. Le registre reste volontairement `partial` (`src/special-operations-v67.js:51-70`).
- **Priorité/dépendances : P0.** Généraliser les contrats V69 en couche d'escouade commune avant les missions A.T.A.X.-Q, Jeri, Éloïse et Abysse Noir. Les états de blessures/transport doivent ensuite se raccorder à l'infirmerie et aux conséquences stratégiques.

## 4. Écrire une mission xénomorphe — Éloïse

- **Conversation :** `6a99b3d2-0e58-83eb-abba-d955b5d73b2d`.
- **Demande utilisateur :** une mission sur la synthétique/hybride d'apparence humaine avec traits xénomorphes qui contrôle une ruche ; la réponse identifie Éloïse comme référence visée.
- **Promesse/plan ChatGPT :** `ÉLOÏSE : LA REINE SANS COURONNE`, triple identité humaine/hybride/conscience de ruche, jauge et douleur du Chœur, carte passant du corporatiste au contesté puis organique, HUSH-6, Premier-Né, trois pylônes, guerre à trois voix, Chasseur de Mères multi-phase et quatre conclusions.
- **Statut : `MISSING`.** Le registre est `missing`, non jouable, sans preuve, et exige conscience de ruche, jauge de Chœur, carte mutable et fins ramifiées (`src/special-operations-v67.js:72-76`). Aucune occurrence runtime d'Éloïse ou HUSH-6 n'a été trouvée. Le Neuro-Xeno générique ne constitue ni ce personnage ni ce scénario.
- **Preuves/tests :** `tests/special-operations-v67.test.mjs:57-73` vérifie l'identifiant du chat et le contrat, puis `:75-135` confirme l'absence de campagne correspondante.
- **Priorité/dépendances : P1.** Dépend des Archives multi-chaînes, d'un système de contrôle/communication de ruche partagé avec Jeri/A.T.A.X., d'une topologie réellement mutable, des personnages/boss et de la persistance des choix/fins.

## 5. Créer mission préhistorique

- **Conversation :** `6a99b4e6-45f4-83eb-bdae-5b3ad2e57833`.
- **Demande utilisateur :** une mission dans un monde préhistorique, avec dinosaures et castes xénomorphes adaptées.
- **Promesse/plan ChatGPT :** `PANGAEA : LA SECONDE EXTINCTION`, guerre écologique, dinosaures sains puis infection dynamique, indice d'intégrité de biosphère, sept castes Sauria-XX121, vallée/migration/forêt/eaux noires/Cathédrale d'os, plusieurs boss, sauvetage de cocons et Porte-Ruche Colosse mobile.
- **Statut : `MISSING`.** Le registre reste `missing`, `playable: false`, sans preuve, avec les quatre exigences écosystème, dinosaures, infection et castes Sauria (`src/special-operations-v67.js:78-82`). Aucun dinosaure, identifiant Pangaea ou système d'écosystème n'existe dans `src` ou `tests`.
- **Preuves/tests :** le test du registre et des campagnes passe (`tests/special-operations-v67.test.mjs:37-55`, `:75-135`) sans route Pangaea.
- **Priorité/dépendances : P2.** Dépend d'un simulateur de population/infection persistant, de nouveaux biomes et transitions, de nombreuses IA hôtes/dérivés, de planches d'animation complètes, de boss de très grande taille et d'un niveau aquatique réutilisable depuis Abysse Noir.

## 6. Créer mission Alien Queen — A.T.A.X.-Q

- **Conversation :** `6a9981b6-ec38-83eb-bcaf-eea1783e448f`.
- **Demande utilisateur :** mission spéciale contrôlant une armure façon gamme Kenner ressemblant à une Reine, permettant de recruter de nombreuses castes et d'attaquer une ruche.
- **Promesse/plan ChatGPT :** `A.T.A.X.-Q : LA FAUSSE REINE`, armure REGINA, intégrité/charge phéromonale/instinct royal, recrutement, ordres de meute et contrôle direct, capacités mécaniques, sept secteurs, variantes Gorilla/Rhino/Scorpion/Mantis/Snake/Wild Boar/Panther/Arachnid et assaut par trois artères.
- **Statut : `MISSING`.** Le registre est `missing`, non jouable, sans preuve, et demande armure-reine, recrutement, ordres de ruche et contrôle direct de caste (`src/special-operations-v67.js:84-88`). Les ennemis catalogués ou les plaques de variantes ne créent aucun de ces systèmes.
- **Preuves/tests :** `tests/special-operations-v67.test.mjs:57-73` verrouille l'entrée, tandis que `:75-135` montre qu'aucune campagne A.T.A.X. n'est construite.
- **Priorité/dépendances : P1.** Réutiliser la sélection/ping Alpha-Bravo comme base d'ordres, puis ajouter loyauté phéromonale, recrutement, possession sûre d'une caste, ressources royales, IA de meute, armure/animations dédiées et sauvegarde de roster. À faire avant Titan Breaker si un socle commun d'armure lourde est retenu.

## 7. Proposer mécaniques HUD Alien

- **Conversation :** `6a999dca-3efc-83eb-907a-623f11cf2388`.
- **Demande utilisateur :** retrouver les codes HUD/typographiques Alien, ajouter auto-destruction, couverture et torche permettant de verrouiller/déverrouiller les portes.
- **Promesse/plan ChatGPT :** refonte HUD globale, typographies/palette/pictogrammes, auto-destruction à procédure et point de non-retour, couvertures basses/hautes avec comportements ennemis, soudure/découpe persistante, tracker, pression/sas, énergie, terminaux/CCTV, acide, systèmes synthétiques, commandes d'escouade et 40 à 60 pictogrammes/assets dédiés.
- **Statut : `PARTIAL` au périmètre du chat ; sous-lot V70 `DONE`.** Les six mécaniques V70 sont réelles : auto-destruction, portes soudables, pression par salle, routage énergétique, CCTV et acide persistant (`src/alien-survival-systems-v70.js:21-28`, `:198-258`). Le HUD commande ces systèmes selon la proximité (`src/alien-survival-ui-v70.js:89-148`, `:165-204`). La couverture réduit réellement les dégâts (`src/game-v51-runtime.js:782`, `:1333-1338`) et le tracker consomme de l'énergie/produit des contacts (`src/game-v51-runtime.js:1280-1294`).
- **Écart matériel :** le lot V70 ne couvre explicitement que six mécaniques (`src/special-operations-v67.js:90-110`). La feuille de style reste fondée sur `ui-monospace` (`alien-survival-v70.css:17`, `:61`) ; aucun kit vérifié de 40 à 60 pictogrammes, famille typographique complète, couverture haute/contextuelle avec animations par arme, protocole synthétique ou unification totale des écrans n'est démontré.
- **Preuves/tests :** les six suites V70 passent **46/46** : `tests/alien-survival-systems-v70.test.mjs`, `tests/alien-survival-runtime-v70.test.mjs`, `tests/alien-survival-save-v70.test.mjs`, `tests/alien-survival-ui-v70.test.mjs`, `tests/alien-survival-production-v70.test.mjs`, `tests/alien-survival-art-v70.test.mjs`. C'est une preuve forte du sous-lot, pas de tout le plan de conversation.
- **Priorité/dépendances : P1.** Conserver le runtime V70 et compléter l'identité visuelle globale, les états de portes, les animations de couverture et les interfaces synthétiques. Les pictogrammes et tokens doivent rester réutilisables par Jeri, Éloïse, A.T.A.X., Abysse Noir et Titan Breaker.

## 8. Mission avec Jerry synthétique

- **Conversation :** `6a999847-94b4-83ed-af17-c3b6b57da810`.
- **Demande utilisateur :** une mission complète dans une ruche avec Jeri, le Xénomorphe synthétique.
- **Promesse/plan ChatGPT :** `JERI : LE FAUX FILS`, jauge de dissonance, profils phéromonaux Ouvrier/Guerrier/Nourrice/Écho royal/Marque de proie, inspections de caste, corps synthétique segmenté, directive de protection humaine, locomotion mur/plafond, trois routes, sauvetages et implantations, boss SAINT en trois phases et inspection finale de la Reine.
- **Statut : `MISSING`.** Le registre est `missing`, `playable: false`, sans preuve, et exige profils phéromonaux, inspections, corps segmenté et boss SAINT (`src/special-operations-v67.js:113-117`). Aucun Jeri/Jerry ni SAINT n'apparaît dans le runtime.
- **Preuves/tests :** `tests/special-operations-v67.test.mjs:57-73` vérifie le chat/contrat et `:75-135` confirme qu'aucune campagne Jeri n'est ajoutée.
- **Priorité/dépendances : P1.** Dépend des Archives étendues, d'un système de déguisement/phéromones, d'états d'inspection déterministes, d'une navigation mur/plafond, de dégâts segmentés, des survivants/implantations persistants et des plaques Jeri/SAINT/Reine.

## 9. Mission sous marine complète

- **Conversation :** `6a99988b-90c4-83ed-a4f6-0462baed528f`.
- **Demande utilisateur :** une mission sous-marine complète avec nage, scaphandre, véhicule, castes aquatiques, moyen boss et grand boss.
- **Promesse/plan ChatGPT :** `OPÉRATION ABYSSE NOIR` à THALASSA-7, nage libre, M-17 HADAL (lesté/neutre/magnétique), UDS MANTA-6 avec sous-systèmes, sept armes/outils, dix castes aquatiques, progression multi-actes, Briseur de Bathyscaphe, canyon, cloche de secours, ruche hydrothermale et boss final.
- **Statut : `PARTIAL`, non jouable comme mission dédiée.** Le véhicule générique maritime possède poussée, axe de profondeur et immunité au flood (`src/game-final-runtime.js:38-48`, `:530-548`). Le travail V75 courant ajoute un bassin Ceto authored et le Ceto Reef Predator avec déplacement/attaque aquatiques (`src/enemy-ceto-v75.js:1-43`, `:80-147`; `src/game-v52-level-runtime.js:646-655`, `:692-697`). Le contrat indique toutefois explicitement `marineMode: 'wading-on-existing-bed'` et `freeSwimImplemented: false` (`src/enemy-ceto-v75.js:30-35`).
- **Écart matériel :** le registre reste `playable: false` et exige nage libre, HADAL, MANTA-6 et boss aquatiques (`src/special-operations-v67.js:119-124`). Il manque aussi THALASSA-7, arsenal, pression/oxygène sous-marins dédiés, sorties véhicule/scaphandre, moyenne/grande rencontre et sauvegarde de mission.
- **Preuves/tests :** `tests/enemy-ceto-pivot-v75.test.mjs` passe **1/1**, ce qui valide seulement le pivot aquatique. Le registre/campagnes passe **4/4** et confirme l'absence d'accès Abysse Noir.
- **Priorité/dépendances : P1.** Stabiliser d'abord le socle Ceto V75 en cours, puis implémenter locomotion nageur, volumes/eau/pression, combinaison HADAL, véhicule MANTA-6, combat/armes sous-marines, level THALASSA-7, castes et boss. Ce socle pourra ensuite alimenter la route aquatique de Pangaea.

## Ordre d'exécution recommandé

1. **P0 — Archives multi-chaînes et coopération transversale** : généraliser V68 et V69 sans casser leurs campagnes et leurs tests.
2. **P1 — Finir le périmètre HUD**, puis livrer le socle partagé phéromones/commandement de ruche.
3. **P1 — Jeri**, puis **Éloïse** et **A.T.A.X.-Q**, chacun comme campagne accessible avec sauvegarde, assets et tests complets.
4. **P1 — Abysse Noir** : transformer le prototype aquatique Ceto en système joueur/véhicule et mission complète.
5. **P2 — Titan Breaker** : bâtir le combat géant sur le socle armure/mécha validé.
6. **P2 — Pangaea** : terminer en dernier, car elle cumule écosystème, grand roster, boss colossaux et route aquatique.

## Validation exécutée sur l'état courant

- registre des opérations : **4/4 tests passés** ;
- archives QZ-17 : **37/37 tests passés** ;
- Doctrine Alpha/Bravo : **46/46 tests passés** ;
- systèmes de survie Alien V70 : **46/46 tests passés** ;
- pivot Ceto V75 : **1/1 test passé**.

Ces **134 tests ciblés** prouvent les sous-systèmes cités. Ils ne prouvent aucune des cinq missions classées `MISSING`, ni la complétude des quatre conversations classées `PARTIAL`.
