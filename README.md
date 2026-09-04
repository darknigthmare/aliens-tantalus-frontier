# ALIENS: TANTALUS FRONTIER

Version de travail web jouable **v69.0.0**. Le contrat consolidé **v1→v69** conserve le Tantalus comme niveau physique persistant et ajoute trois lots Special Operations réellement accessibles : **CARGO BRUTAL** (V67), l’enquête **QZ-17** (V68) et la **Doctrine Alpha / Bravo** (V69). Cette dernière déploie quatre opérateurs en deux binômes, avec sélection de groupe, ordres, pings, tâches réservées, stress, cohésion, blessures et bilan persistant. Le registre recense 19 conversations mais n’en classe encore qu’une `effective`, contre 9 `partial` et 9 `missing` : V69 ne prétend donc pas être le jeu commercial complet.

Cible publique du projet : [aliens-tantalus-frontier.vercel.app](https://aliens-tantalus-frontier.vercel.app). La publication d’une release n’est considérée comme acquise qu’après vérification séparée du déploiement et de la réponse HTTP.

## Lancer localement

```powershell
npm.cmd run dev
```

Ouvrir `http://127.0.0.1:4173`.

## Boucle désormais effective

- Commandement : décisions datées, ressources, recherches, modules, journal et pression de crise persistants ; la diplomatie avance l'horloge, applique une transaction unique puis verrouille le canal jusqu'à son cooldown.
- Préparation : achat, inventaire, arme, équipement à charges, véhicule, équipage, soins, costume, dossier Apex et profil Neuro-Xeno.
- Opération : trois topologies connectées et distinctes (vaisseau vertical, colonie multi-route, extérieur planétaire), zones, sas, portes, conduits, échelles, événements et couches far/mid/foreground issus du monde/campagne/Forge ; danger, difficulté, rencontres contextuelles — reine comprise uniquement lorsque la campagne exige une ruche/reine —, combat, furtivité, véhicule, pertes, extraction et récompenses.
- Special Operations : le registre expose 19 conversations auditées et seulement trois routes jouables. Cargo Brutal est `effective` ; QZ-17 et Alpha/Bravo restent `partial` tant que leurs promesses globales respectives ne sont pas entièrement produites.
- Doctrine Alpha / Bravo : exactement quatre opérateurs actifs, deux binômes persistants, ordres et pings ancrés au terrain, trois consoles/tâches physiques et certification calculée depuis les résultats réels. Il s’agit d’une doctrine tactique dans le runtime local, pas d’un multijoueur réseau annoncé.
- Escouade physique : les trois équipiers sélectionnés suivent, se mettent en couverture, tirent, soignent, réparent, scannent, réaniment, occupent le véhicule et conservent leur état à la reprise ; le coop local peut prendre ou rendre un poste sans dupliquer l'acteur IA.
- Seize contrats physiques : sauvetage, atmosphère, ruche, boîte noire, escorte, purge, abordage, défense, traque Apex, synthétique, capture, relais Neuro-Xeno, protection, conduits, véhicule et fuite.
- Hub : 4 ponts, 16 salles et 16 PNJ nommés avec feuille, spécialité, animation et interaction persistante ; portes, ascenseurs, conduits, objectifs et crises xénomorphe, synthétique ou pathogène sont neutralisés dans le niveau avant résolution stratégique. Le hangar dropship assemble arrière-plan, booth de contrôle, UD-4L, portes/props, danger et premier plan indépendants au lieu d’une scène monolithique. La table d’opérations et le comptoir d’armurerie sont des landmarks bitmap collisionnables ; leur dialogue puis leur interface se superposent au hub mis en pause, qui reprend au même endroit.
- Frontier Forge : validation, annuler/rétablir, sauvegarde/import/export et playtest réel des tuiles mission ou vaisseau.
- Conséquences : ressources, équipage, état des mondes, routes, factions, crise et progression restent après rechargement.
- Reprise native : l'opération recharge checkpoint, joueur/coop/escouade, niveau v52 et zones, mission et objectifs, inventaire/tracker, portes/conduits, ressources ramassables, ennemis et drops, véhicule/passagers, charges d'équipement et état Neuro-Xeno. Les identifiants et signatures sont recoupés, les seeds 32 bits restent intacts, les nombres sont bornés et aucun projectile n'est sérialisé ou recréé ; un ennemi mort ou un pickup pris ne peut donc pas être refarmé après rechargement.
- Logistique durable : récupération industrielle, récupération de mission et commerce diplomatique peuvent renouveler le carburant ; une campagne n'est pas condamnée par une réserve finie sans source.

Les catalogues volumineux sont couverts par des adaptateurs systémiques testés. Le manifeste principal V64 comptait **195 atlas / 2 772 cellules** ; les atlas supplémentaires V65/V66 et les visuels d’opérations V67→V69 sont suivis par leurs propres contrats et ne sont pas additionnés ici sans inventaire consolidé. Les **571 profils ennemis gameplay** ne signifient donc pas 571 silhouettes bitmap dédiées. Une entrée catalogue n'est jamais présentée comme une plaque unique lorsqu'elle réemploie une famille visuelle ou reste bloquée par sa référence canonique.

Les MID Medical, Science Lab, Quarantine et Life Support sont quatre bitmaps RGBA 1 774 × 887 corrigés. La Harpoon Gun / ASSO-400 ferme le dernier gap d'arme Excel relié sans ambiguïté. La dette connue conserve quatre identités d’armes ambiguës ou absentes (Heavy Pulse, Plasma, ES-4 et Compound Bow), trois châssis bloqués, les couches de costumes composables, la source UD-4L agrandie, les petits props finaux par salle, ainsi que les 18 conversations encore `partial` ou `missing`.

## Contrôles

Le contrat d’identité des animations est strict : le profil `neuro-002` dérive `enemy-002-facehugger` et utilise `enemy.facehugger.locomotion`; aucune plaque Drone ne peut le remplacer silencieusement. Sans profil Neuro actif, le joueur revient aux animations `player.echo9-marine`.


Mission joueur 1 :

- `A/D` ou flèches : marcher ; `W/S` : grimper ou traverser un conduit ; `Espace` : sauter.
- `F` : tirer ; `R` : recharger ; `Q` : tracker ; `E` : interagir/réanimer/neutraliser.
- `V` : lancer l’ouverture ou la sortie physique du véhicule ; `H` : medkit ; `X` : contre-impulsion Neuro-Xeno si disponible.
- `P` ou `Échap` : pause ; `Entrée` : reprendre au checkpoint après un échec.

Coop locale : `J/L`, `I/K`, `U`, `O`, `Y`, `T`, `G`.

Hub : `A/D`, `W/S`, `Espace`, `E`, `C` pour s'accroupir et `F` pendant une crise. Les commandes tactiles restent sous la scène en portrait.

Doctrine Alpha / Bravo : `1`, `2` et `3` sélectionnent Alpha, Bravo ou les deux groupes ; `C` arme le ping terrain ; `B`, `N` et `M` appliquent respectivement `TENIR`, `FOCUS` et `RALLIER`.

## Contenu conservé et consommé

| Catalogue | Total v69 |
| --- | ---: |
| Campagnes | 439 |
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

La dernière gate locale V69 consignée valide **840 tests réussis**, **1 test ignoré**, **0 échec**, **258 modules lintés** et un build de **3 449 entrées catalogue**. La QA navigateur V69 est documentée séparément : elle couvre le lancement réel de la mission Alpha/Bravo sur bureau et mobile, les contrôles tactiques, le placement sûr des contacts et l’accessibilité, sans transformer cette preuve ciblée en certification du jeu commercial complet.

## Dossier de production

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
