# ALIENS: TANTALUS FRONTIER

## Travail courant V80

Reprise fondée sur les 26 conversations du projet ChatGPT « Aliens tantalus project ». Le suivi strict est désormais de **0 conversation intégralement terminée, 17 partielles et 9 manquantes** : [matrice de suivi](docs/references/V76_CHATGPT_PROJECT_GAP_MATRIX.md).

V80 transforme BIOFORGE en niveau 2D séparé, accessible depuis son sas physique du Tantalus. Le terminal choisit un profil terrestre validé et une quantité bornée, puis la boucle ferme les sas, imprime les spécimens, joue le combat, impose une purge atomique et n’autorise le retour au hub qu’une fois la zone vide. L’état persiste uniquement sous la racine `bioforgeV80` : il ne crédite ni campagne, ni ressource stratégique, ni perte d’équipage.

Le roster initial contient **11 profils validés**, avec un budget pondéré de 12 et un maximum absolu de 12 spécimens simultanés. BIOFORGE passe donc de **MISSING** à **PARTIAL** : la boucle dédiée existe, mais le roster ennemi total et le corpus artistique dédié annoncé dans la conversation ne sont pas terminés. Voir [le contrat runtime V80](docs/V80_BIOFORGE_RUNTIME.md), [l’audit level design V80](docs/V80_LEVEL_DESIGN_AUDIT.md) et [l’historique V80](docs/VERSION_HISTORY_V80.md).

## Référence V79

V79 livre une première tranche réelle de l’accueil spatial modulaire : couches bitmap indépendantes, sélection déterministe du monde, trois presets dédiés (Acheron, Ceto et Mire-9), modes Full/Reduced/Static, repli procédural par couche et ultime repli vers l’accueil V61. Le registre accepte exactement **18 assets OpenAI intégrés sur 53 slots planifiés** ; leurs dimensions, alpha, perspective, hash runtime et reçus source sont audités. Les contrats et limites vérifiés sont consignés dans [la validation V79](docs/VALIDATION_V79.md) et [le contrat runtime V79](docs/V79_TITLE_SCENE_RUNTIME.md).

Le contrat de vingt presets n’est donc pas terminé : **35 slots restent manquants**, dont 17 planètes dédiées, et seuls 3 presets de production sont disponibles. Cette tranche V79 est **PARTIAL**, pas une déclaration de jeu commercial complet ; les banques audio finales restent absentes (0/8) et les autres conversations conservent leurs écarts propres.

V78 reste la tranche historique qui a renforcé la sauvegarde/reprise, la navigation de l’accueil et la table de briefing : [validation V78](docs/VALIDATION_V78.md). Les sections V74/V71 ci-dessous sont elles aussi historiques et ne remplacent pas l’audit strict courant.

## Travail courant V74

Version 74.0.0 : Burster 016 et Korari 050 disposent de leurs atlas dédiés32 poses avec combat, dimensions, portée symétrique et reprise contrôlés. Le comparateur du bestiaire garde ses trois/quatre silhouettes sur un sol et une échelle communs, y compris sur mobile. Le recalage du sanglier 049 est corrigé, mais sa frange violette reste à traiter ; les deux nouvelles retouches OpenAI 054 restent refusées après revue.

Le lot reste les **mêmes50 profils** (007–057, hors020), pas cinquante nouveaux à chaque passe. État actualisé : [production V74](docs/ENEMY_PRODUCTION_V74.md), [validation V74](docs/VALIDATION_V74.md). Les entrées catalogue ou fichiers de production ne sont jamais un certificat de jeu terminé. Les fonctions et dettes V71 décrites ci-dessous restent une référence historique, pas une clôture des demandes restantes.

Référence fonctionnelle historique **v71.0.0**. Le contrat consolidé **v1→v71** conserve le Tantalus comme niveau physique persistant et expose cinq surfaces Special Operations accessibles : **CARGO BRUTAL** (V67), l’enquête **QZ-17** (V68), la **Doctrine Alpha / Bravo** (V69), **SYSTÈMES DE SURVIE ALIEN** (V70) et le **HUB DE L’USS TANTALUS** (V71). V71 ajoute dix annexes physiques, des stations persistantes et 50 couches artistiques. Le hub reste **partial** : sa structure jouable ne clôt pas ses cinq dettes de production. Le registre recense 19 conversations, dont **2 effective, 8 partial et 9 missing** ; **17 conversations restent donc inachevées**.

Publication historique V71 vérifiée : [aliens-tantalus-frontier.vercel.app](https://aliens-tantalus-frontier.vercel.app), état `READY`, runtime du commit `8b28119`. L’accueil, les modules V71, le build-info et les échantillons WebP répondent en HTTP 200 ; les masters restent exclus (404). La publication ne transforme pas les fonctionnalités encore partielles en fonctionnalités terminées.

## Lancer localement

```powershell
npm.cmd run dev
```

Ouvrir `http://127.0.0.1:4173`.

## Boucle jouable et portée actuelle

- Commandement : décisions datées, ressources, recherches, modules, journal et pression de crise persistants ; la diplomatie avance l'horloge, applique une transaction unique puis verrouille le canal jusqu'à son cooldown.
- Préparation : achat, inventaire, arme, équipement à charges, véhicule, équipage, soins, costume, dossier Apex et profil Neuro-Xeno.
- Opération : trois topologies connectées et distinctes (vaisseau vertical, colonie multi-route, extérieur planétaire), zones, sas, portes, conduits, échelles, événements et couches far/mid/foreground issus du monde/campagne/Forge ; danger, difficulté, rencontres contextuelles — reine comprise uniquement lorsque la campagne exige une ruche/reine —, combat, furtivité, véhicule, pertes, extraction et récompenses.
- Special Operations : 19 conversations auditées et six surfaces jouables. Cargo Brutal et Systèmes de survie Alien sont `effective` ; QZ-17, Alpha/Bravo, Hub commercial et BIOFORGE sont jouables mais `partial`. Quatre surfaces sont des campagnes ; le hub et BIOFORGE utilisent `accessSurface: hub` et conservent le total à 440.
- Doctrine Alpha / Bravo : exactement quatre opérateurs actifs, deux binômes persistants, ordres et pings ancrés au terrain, trois consoles/tâches physiques et certification calculée depuis les résultats réels. Il s’agit d’une doctrine tactique dans le runtime local, pas d’un multijoueur réseau annoncé.
- Systèmes de survie Alien : six salles physiques reliées, capacité énergétique limitée entre support-vie, sécurité et CCTV, pression/oxygène simulés, sas soudables, surveillance sans pause du monde, flaques d’acide persistantes et autodestruction à double autorisation avant extraction.
- Escouade physique : les trois équipiers sélectionnés suivent, se mettent en couverture, tirent, soignent, réparent, scannent, réaniment, occupent le véhicule et conservent leur état à la reprise ; le coop local peut prendre ou rendre un poste sans dupliquer l'acteur IA.
- Seize contrats physiques : sauvetage, atmosphère, ruche, boîte noire, escorte, purge, abordage, défense, traque Apex, synthétique, capture, relais Neuro-Xeno, protection, conduits, véhicule et fuite.
- Hub : 4 ponts, 16 salles historiques, 10 annexes V71 et 16 PNJ nommés dans le hub historique. Chaque annexe est un sous-niveau 1 920 × 720 relié par une porte réciproque, avec sol, passerelle, échelle, colliders, six placements logiques, station persistante et cinq couches WebP (`far`, `mid`, `prop`, `foreground`, `door`). Les dix branches se parcourent physiquement ; leurs PNJ dédiés et les bitmaps autonomes de chaque prop restent à produire. Le vestibule BIOFORGE reste sans créature ; il ouvre désormais le niveau V80 séparé et sa progression isolée.
- Services V71 : Logistique exécute les ordres de module, MIRE indexe les archives, CCTV effectue un scan, Proving Ground prépare un soutien et Capsules arme une mitigation de crise. La relecture physique des archives, les commandes CCTV/lockdown et les exercices de tir/P-5000/tutoriels restent à réaliser. Les Capsules n’exécutent pas de scénario d’autodestruction et les visites ne délivrent aucun certificat d’exercice.
- Frontier Forge : validation, annuler/rétablir, sauvegarde/import/export et playtest réel des tuiles mission ou vaisseau.
- Conséquences : ressources, équipage, état des mondes, routes, factions, crise et progression restent après rechargement.
- Reprise native : l'opération recharge checkpoint, joueur/coop/escouade, niveau v52 et zones, mission et objectifs, inventaire/tracker, portes/conduits, ressources ramassables, ennemis et drops, véhicule/passagers, charges d'équipement et état Neuro-Xeno. Les identifiants et signatures sont recoupés, les seeds 32 bits restent intacts, les nombres sont bornés et aucun projectile n'est sérialisé ou recréé ; un ennemi mort ou un pickup pris ne peut donc pas être refarmé après rechargement.
- Logistique durable : récupération industrielle, récupération de mission et commerce diplomatique peuvent renouveler le carburant ; une campagne n'est pas condamnée par une réserve finie sans source.

Les catalogues volumineux sont couverts par des adaptateurs systémiques testés. Le manifeste principal V64 comptait **195 atlas / 2 772 cellules** ; les atlas supplémentaires V65/V66 et les visuels d’opérations V67→V71 sont suivis par leurs propres contrats et ne sont pas additionnés ici sans inventaire consolidé. Les **571 profils ennemis gameplay** ne signifient donc pas 571 silhouettes bitmap dédiées. Une entrée catalogue n'est jamais présentée comme une plaque unique lorsqu'elle réemploie une famille visuelle ou reste bloquée par sa référence canonique.

Les MID Medical, Science Lab, Quarantine et Life Support sont quatre bitmaps RGBA 1 774 × 887 corrigés. La Harpoon Gun / ASSO-400 ferme le dernier gap d’arme Excel relié sans ambiguïté. La dette connue conserve quatre identités d’armes ambiguës ou absentes (Heavy Pulse, Plasma, ES-4 et Compound Bow), trois châssis bloqués, les couches de costumes composables et la source UD-4L agrandie. Pour le hub V71, cinq dettes restent explicites : props bitmap autonomes, PNJ dédiés, exercices physiques, relecture physique des archives et commandes CCTV/lockdown. Le validateur peut valider la structure tout en conservant `productionReady: false` et `complete: false`. BIOFORGE doit encore étendre son roster et son corpus d’art dédiés ; les autres promesses des **26 conversations encore partial ou missing** restent également à produire.

## Contrôles

Le contrat d’identité des animations est strict : le profil `neuro-002` dérive `enemy-002-facehugger` et utilise `enemy.facehugger.locomotion`; aucune plaque Drone ne peut le remplacer silencieusement. Sans profil Neuro actif, le joueur revient aux animations `player.echo9-marine`.


Mission joueur 1 :

- `A/D` ou flèches : marcher ; `W/S` : grimper ou traverser un conduit ; `Espace` : sauter.
- `F` : tirer ; `R` : recharger ; `Q` : tracker ; `E` : interagir/réanimer/neutraliser.
- `V` : lancer l’ouverture ou la sortie physique du véhicule ; `H` : medkit ; `X` : contre-impulsion Neuro-Xeno si disponible.
- `P` ou `Échap` : pause ; `Entrée` : reprendre au checkpoint après un échec.

Coop locale : `J/L`, `I/K`, `U`, `O`, `Y`, `T`, `G`.

Hub : `A/D`, `W/S`, `Espace`, `E`, `C` pour s'accroupir et `F` pendant une crise. Les commandes tactiles restent sous la scène en portrait.

Annexes V71 : approcher une porte et utiliser `E` pour entrer ; parcourir le sous-niveau horizontal puis activer sa station avec `E`. La même porte ramène à la salle parente et la position/les améliorations sont persistées.

BIOFORGE V80 : activer la station du sas avec `E`, choisir le profil et la quantité au terminal, lancer l’impression puis combattre dans l’arène physique. Le retour au Tantalus reste verrouillé pendant l’impression, le combat et la purge ; la commande de purge d’urgence termine la session sans récompenser la campagne.

Doctrine Alpha / Bravo : `1`, `2` et `3` sélectionnent Alpha, Bravo ou les deux groupes ; `C` arme le ping terrain ; `B`, `N` et `M` appliquent respectivement `TENIR`, `FOCUS` et `RALLIER`.

Systèmes de survie Alien : les consoles et sas s’utilisent physiquement avec `E`. Le dock diégétique distribue l’énergie, change de flux CCTV et annule une action temporisée ; les contrôles ne deviennent actifs qu’à portée de l’équipement correspondant.

## Contenu conservé et consommé

| Catalogue | Total v71 |
| --- | ---: |
| Campagnes | 440 |
| Mondes | 64 |
| Armes | 146 |
| Équipements | 106 |
| Ennemis | 571 |
| Véhicules / châssis | 279 |
| Dossiers Apex | 244 |
| Profils Neuro-Xeno | 234 |
| Membres Echo-9 | 16 |
| Costumes | 392 |
| Modules USS Tantalus | 158 |
| Graines de niveau | 800 |

Les armes consomment leur famille et leur pénétration ; les ennemis leur fréquence, habitats, mondes et comportement ; un profil royal inéligible n'est jamais injecté comme boss hors contexte ruche/reine ; les six familles de véhicule ont locomotion, sièges et actions distincts ; les équipements possèdent charges et effets ; les costumes modifient armure, mobilité, furtivité, faction et rendu ; Apex respecte habitat/danger/probabilité ; Neuro-Xeno possède signal, brouillage, contre-impulsions et relais physique.

## Validation

```powershell
npm.cmd run qa
```

Le dernier passage complet historique consigné valide **952 tests : 951 réussis, 0 échec, 1 ignoré**, et le lint **278 modules**. Les **50 WebP** issus de **sept masters OpenAI** ont été contrôlés. Le build `71.0.0` contient **3 450 entrées catalogue**, 440 campagnes et les 50 couches du hub, tout en excluant les masters V71. Sur le miroir D, accueil et hub chargeaient sans erreur navigateur. Cette preuve historique concerne le sas BIOFORGE V71, pas la boucle V80. La publication Vercel et les contrôles HTTP historiques sont vérifiés ; voir [VALIDATION_V71](docs/VALIDATION_V71.md).

Le workspace a été récupéré sur `D:\CodexWork\aliens-tantalus-frontier\project` : **4 808 fichiers aux empreintes identiques**, deux sources tronquées restaurées et **3 864 fixtures synthétiques** (1 459 999 407 octets) déplacées sur D après vérification taille/SHA-256. Ces fixtures sont conservées dans `recovered-test-fixtures-20260905` et restent récupérables.

## Dossier de production

- [Contrat runtime BIOFORGE V80](docs/V80_BIOFORGE_RUNTIME.md)
- [Audit level design BIOFORGE V80](docs/V80_LEVEL_DESIGN_AUDIT.md)
- [Historique V80](docs/VERSION_HISTORY_V80.md)
- [Historique et gates V71](docs/VERSION_HISTORY_V71.md)
- [Audit level design et cohérence du hub V71](docs/V71_HUB_COMMERCIAL_AUDIT.md)
- [Provenance artistique V71](docs/ART_PROVENANCE_V71.md)
- [Validation V71](docs/VALIDATION_V71.md)
- [Historique et gates V70](docs/VERSION_HISTORY_V70.md)
- [QA navigateur V70 — systèmes de survie](docs/V70_BROWSER_QA.md)
- [QA artistique V70 — systèmes de survie](docs/V70_ALIEN_SURVIVAL_ART_QA.md)
- [Parité des 19 conversations V70](docs/CHATGPT_PROJECT_PARITY_V70.md)
- [Historique de validation V69](docs/VERSION_HISTORY_V69.md)
- [QA navigateur V69 — Doctrine Alpha / Bravo](docs/V69_BROWSER_QA.md)
- [QA artistique V69 — consoles Alpha / Bravo](docs/V69_ALPHA_BRAVO_ART_QA.md)
- [Parité des 19 conversations V69](docs/CHATGPT_PROJECT_PARITY_V69.md)
- [Historique de validation V68](docs/VERSION_HISTORY_V68.md)
- [QA navigateur V68 — QZ-17](docs/V68_BROWSER_QA.md)
- [Historique de validation V67](docs/VERSION_HISTORY_V67.md)
- [QA navigateur V67 — Cargo Brutal](docs/V67_BROWSER_QA.md)
- [Historique de validation V66](docs/VERSION_HISTORY_V66.md)
- [Historique de validation V65](docs/VERSION_HISTORY_V65.md)
- [Historique de validation V64](docs/VERSION_HISTORY_V64.md)
- [Historique de validation V63](docs/VERSION_HISTORY_V63.md)
- [Provenance artistique ASSO-400 V63](docs/ART_PROVENANCE_V63.md)
- [Matrice de complétude artistique V63](docs/references/V63_ASSET_COMPLETION_MATRIX.md)
- [Audit PNG, alpha, halo et grilles V63](docs/references/V63_PNG_ALPHA_AUDIT.md)
- [Audit d’implémentation V62](docs/V62_IMPLEMENTATION_AUDIT.md)
- [Historique de validation V62](docs/VERSION_HISTORY_V62.md)
- [Audit PNG, alpha, halo, grilles et normalisation parallaxe V62](docs/references/V62_PNG_ALPHA_AUDIT.md)
- [Provenance artistique V62](docs/ART_PROVENANCE_V62.md)
- [Historique de validation V61](docs/VERSION_HISTORY_V61.md)
- [Audit level design V61](docs/V61_LEVEL_DESIGN_AUDIT.md)
- [Matrice de complétude artistique V61](docs/references/V61_ASSET_COMPLETION_MATRIX.md)
- [Audit Excel vers runtime V61](docs/references/V61_EXCEL_CONTENT_GAP_AUDIT.md)
- [Provenance artistique V61](docs/ART_PROVENANCE_V61.md)
- [Historique de validation V60](docs/VERSION_HISTORY_V60.md)
- [Audit level design V60](docs/V60_LEVEL_DESIGN_AUDIT.md)
- [Matrice de complétude artistique V60](docs/references/V60_ASSET_COMPLETION_MATRIX.md)
- [Historique de release V59](docs/VERSION_HISTORY_V59.md)
- [Provenance artistique V59](docs/ART_PROVENANCE_V59.md)
- [Matrice de complétude et dette V59](docs/references/V59_ASSET_COMPLETION_MATRIX.md)
- [Audit level design V57 : constats, corrections et dette artistique](docs/V57_LEVEL_DESIGN_AUDIT.md)
- [Audit V58 : cohérence des salles, portes, tailles et parallaxes](docs/V58_ROOM_COHERENCE_AUDIT.md)
- [Source consolidée des promesses v1→v51](docs/GAMEPLAY_PROMISE_SOURCE_V51.md)
- [Matrice de complétude artistique V58](docs/references/V58_ASSET_COMPLETION_MATRIX.md)
- [Provenance artistique V58](docs/ART_PROVENANCE_V58.md)
- [Historique de release V58](docs/VERSION_HISTORY_V58.md)
- [Matrice d'audit des promesses et preuves exécutables v55](docs/GAMEPLAY_PROMISE_AUDIT_V55.md)
- [Inventaire exhaustif runtime v55 : personnages, ennemis, véhicules, props et couches](docs/ASSET_RUNTIME_INVENTORY_V55.md)
- [Inventaire machine v55](docs/ASSET_RUNTIME_INVENTORY_V55.json)
- [Historique de release v55](docs/VERSION_HISTORY_V55.md)
- [Vague ImageGen v55 : prompts, périmètre et dettes](docs/prompts/V55_IMAGEGEN_WAVE.md)
- [Provenance OpenAI v55](docs/ART_PROVENANCE_V55.md)
- [Matrice d'audit des promesses et preuves exécutables v54](docs/GAMEPLAY_PROMISE_AUDIT_V54.md)
- [Inventaire exhaustif runtime v54 : personnages, ennemis, véhicules, props et couches](docs/ASSET_RUNTIME_INVENTORY_V54.md)
- [Inventaire machine v54](docs/ASSET_RUNTIME_INVENTORY_V54.json)
- [Architecture runtime v52](docs/ARCHITECTURE_V52.md)
- [Historique de release v54](docs/VERSION_HISTORY_V54.md)
- [Vague ImageGen v54 : prompts, chemins et gates](docs/prompts/V54_IMAGEGEN_WAVE.md)
- [Provenance des cinq masters OpenAI v54](docs/ART_PROVENANCE_V54.md)
- [Audit v51 conservé](docs/GAMEPLAY_PROMISE_AUDIT_V51.md)
- [Contrat de contenu](docs/CONTENT_CONTRACT.md)
- [Audit level design v50 et comparaison avec Aliens: Infestation](docs/LEVEL_DESIGN_AUDIT_V50.md)
- [Bible sprites et animations](docs/SPRITE_ANIMATION_BIBLE.md)
- [Provenance artistique](docs/ART_PROVENANCE.md)
- [Licence et propriété intellectuelle](LICENSE_NOTICE.md)

## Fidélité et droits

La base Tantalus est documentée par les [notes officielles de Focus Entertainment](https://support.focus-entmt.com/hc/en-us/articles/12816621940754-PC-PLAYSTATION-XBOX-UPDATE-AUGUST-1-2023) et les [concepts de production Tantalus Base d'Emilien Morisset](https://arka.artstation.com/projects/1xRx88). La direction « used future » s'appuie notamment sur l'[entretien Alien: Isolation de PlayStation](https://blog.playstation.com/archive/2014/03/26/behind-terror-alien-isolation-exclusive-interview).

Le dépôt ne redistribue aucun fichier officiel extrait d'un jeu. Son exploitation publique ou commerciale suppose que le détenteur du dépôt dispose des droits annoncés.
