# ALIENS: TANTALUS FRONTIER

Version de travail web jouable **v61.0.0**. Le contrat consolidé **v1→v61** ajoute un vrai écran titre, des stations de briefing et d’armurerie ouvertes depuis le niveau, un booth de contrôle indépendant dans le hangar, quatre MID corrigés et une personnalisation bitmap filtrable. Les M39, M42A, M6B, M83 SADAR, M5 RPG, M94, F44AA, Type 88 et AK-4047 disposent maintenant de leurs propres plaques 4 × 4 reliées au classeur Excel privé ; les contenus sans visuel exact restent bloqués plutôt que rendus invisibles.

Dernier déploiement public vérifié (V60 au moment du jalon V61) : [aliens-tantalus-frontier.vercel.app](https://aliens-tantalus-frontier.vercel.app)

## Lancer localement

```powershell
npm.cmd run dev
```

Ouvrir `http://127.0.0.1:4173`.

## Boucle désormais effective

- Commandement : décisions datées, ressources, recherches, modules, journal et pression de crise persistants ; la diplomatie avance l'horloge, applique une transaction unique puis verrouille le canal jusqu'à son cooldown.
- Préparation : achat, inventaire, arme, équipement à charges, véhicule, équipage, soins, costume, dossier Apex et profil Neuro-Xeno.
- Opération : trois topologies connectées et distinctes (vaisseau vertical, colonie multi-route, extérieur planétaire), zones, sas, portes, conduits, échelles, événements et couches far/mid/foreground issus du monde/campagne/Forge ; danger, difficulté, rencontres contextuelles — reine comprise uniquement lorsque la campagne exige une ruche/reine —, combat, furtivité, véhicule, pertes, extraction et récompenses.
- Escouade physique : les trois équipiers sélectionnés suivent, se mettent en couverture, tirent, soignent, réparent, scannent, réaniment, occupent le véhicule et conservent leur état à la reprise ; le coop local peut prendre ou rendre un poste sans dupliquer l'acteur IA.
- Seize contrats physiques : sauvetage, atmosphère, ruche, boîte noire, escorte, purge, abordage, défense, traque Apex, synthétique, capture, relais Neuro-Xeno, protection, conduits, véhicule et fuite.
- Hub : 4 ponts, 16 salles et 16 PNJ nommés avec feuille, spécialité, animation et interaction persistante ; portes, ascenseurs, conduits, objectifs et crises xénomorphe, synthétique ou pathogène sont neutralisés dans le niveau avant résolution stratégique. Le hangar dropship assemble arrière-plan, booth de contrôle, UD-4L, portes/props, danger et premier plan indépendants au lieu d’une scène monolithique. La table d’opérations et le comptoir d’armurerie sont des landmarks bitmap collisionnables ; leur dialogue puis leur interface se superposent au hub mis en pause, qui reprend au même endroit.
- Frontier Forge : validation, annuler/rétablir, sauvegarde/import/export et playtest réel des tuiles mission ou vaisseau.
- Conséquences : ressources, équipage, état des mondes, routes, factions, crise et progression restent après rechargement.
- Reprise native : l'opération recharge checkpoint, joueur/coop/escouade, niveau v52 et zones, mission et objectifs, inventaire/tracker, portes/conduits, ressources ramassables, ennemis et drops, véhicule/passagers, charges d'équipement et état Neuro-Xeno. Les identifiants et signatures sont recoupés, les seeds 32 bits restent intacts, les nombres sont bornés et aucun projectile n'est sérialisé ou recréé ; un ennemi mort ou un pickup pris ne peut donc pas être refarmé après rechargement.
- Logistique durable : récupération industrielle, récupération de mission et commerce diplomatique peuvent renouveler le carburant ; une campagne n'est pas condamnée par une réserve finie sans source.

Les catalogues volumineux sont couverts par des adaptateurs systémiques testés. L’audit V61 confirme **191 plaques, 2 708 cellules et 382 chemins raw/normalisés présents**. La complétude exacte des personnages, ennemis, véhicules, objets et props est détaillée dans la matrice V61 ; une entrée catalogue n’est jamais présentée comme une plaque dédiée lorsqu’elle réemploie une famille visuelle ou reste bloquée par sa référence canonique.

Les MID Medical, Science Lab, Quarantine et Life Support sont désormais quatre bitmaps RGBA 1 774 × 887 corrigés. La dette restante porte notamment sur la Harpoon Gun, seule arme Excel encore reliée sans ambiguïté mais sans plaque dédiée, quatre identités ambiguës ou absentes (Heavy Pulse, Plasma, ES-4 et Compound Bow), trois châssis bloqués, les couches de costumes composables et la source UD-4L agrandie.

## Contrôles
Le contrat d’identité des animations est strict : le profil `neuro-002` dérive `enemy-002-facehugger` et utilise `enemy.facehugger.locomotion`; aucune plaque Drone ne peut le remplacer silencieusement. Sans profil Neuro actif, le joueur revient aux animations `player.echo9-marine`.


Mission joueur 1 :

- `A/D` ou flèches : marcher ; `W/S` : grimper ou traverser un conduit ; `Espace` : sauter.
- `F` : tirer ; `R` : recharger ; `Q` : tracker ; `E` : interagir/réanimer/neutraliser.
- `V` : lancer l’ouverture ou la sortie physique du véhicule ; `H` : medkit ; `X` : contre-impulsion Neuro-Xeno si disponible.
- `P` ou `Échap` : pause ; `Entrée` : reprendre au checkpoint après un échec.

Coop locale : `J/L`, `I/K`, `U`, `O`, `Y`, `T`, `G`.

Hub : `A/D`, `W/S`, `Espace`, `E`, `C` pour s'accroupir et `F` pendant une crise. Les commandes tactiles restent sous la scène en portrait.

## Contenu conservé et consommé

| Catalogue | Total v61 |
| --- | ---: |
| Campagnes | 436 |
| Mondes | 64 |
| Armes | 146 |
| Équipements | 106 |
| Ennemis | 568 |
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

La gate hors navigateur valide **286 tests**, **143 modules lintés**, **191 plaques / 2 708 cellules** et un build de **3 443 entrées catalogue**. Le parcours navigateur et la publication sont consignés dans l’historique de version après leur exécution finale. Les résultats V60 restent archivés dans docs/VERSION_HISTORY_V60.md.

## Dossier de production

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
