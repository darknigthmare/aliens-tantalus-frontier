# ALIENS: COLONIAL MARINES — 0.10.0 « Retour aux références »

Adaptation non officielle pour le projet Aliens: Tantalus Frontier. **Livraison locale autonome**, pas moteur parent fusionné, pas push GitHub, pas déploiement Vercel. Les plans, silhouettes, bruitages et dialogues sont originaux et provisoires. **La fidélité 1:1 n’est pas atteinte.**

## Jouer

Ouvrir `JOUER_COLONIAL_MARINES_0_10_0.html` dans un navigateur qui exécute les fichiers HTML locaux. Le jeu ne charge pas de ressource distante. Sur un système qui limite les HTML locaux, utiliser le serveur Node :

```sh
npm run preview
```

Puis ouvrir l’adresse indiquée. `LANCER_WINDOWS.cmd` lance le même serveur. Le navigateur de vérification de cette livraison bloque HTTP local et file:// ; les tests ont donc utilisé le HTML en mémoire avec une Map de stockage explicite. Ce résultat ne certifie pas la persistance native sur l’appareil du joueur. **Conserver le JSON exporté indépendamment.**

## Changements de la 0.10

105 salles de campagne/Stasis : les 85 existantes plus 20 secteurs reliés. Les quinze chapitres et les trois arènes Bug Hunt sont conservés. Le graphe contient 107 liaisons et 214 extrémités appariées, avec support, ancrage, niveaux et approche. Le journal enregistre 119 modifications de propriétés de seuil et 20 déplacements de mobilier ; ce n’est pas 119 portes nouvelles.

La passerelle de grue de Sulaco Falls bloque physiquement le passage avant sa commande. Une nouvelle escorte de Reid rejoint le relais dans The Raven ; la transmission nécessite vingt secondes et provoque deux contacts. Les trois valves du secteur gaz de Redemption sont obligatoires. Les scènes de Fiorina, du Legato et du Resolute restent des raccords/dossiers condensés et ne constituent pas la narration 1:1. Le pont de conclusion est une scène documentaire accessible, pas une cinématique de fin fidèle.

L’arsenal comprend 21 profils. Les 17 ajouts possèdent un ramassage physique, une sélection et leurs réserves ; Bug Hunt propose achats et recharges correspondants. Les trois sous-canons emploient des réserves séparées et ont chacun un achat de ravitaillement. Les six légendaires sont placées dans leur mission de référence, mais pas aux coordonnées métriques originales.

Onze profils de personnages différencient les costumes et signes visibles : bandana/barbe/tatouages d’O’Neal, prothèse de Cruz, tenue de vol de Reid, civils et scientifiques. **Visages, proportions exactes, animations et voix restent provisoires.** Les PNJ ajoutés dans les décors sont statiques, pas une nouvelle IA de scène complète. Dans Awakening, Hicks remplace la mauvaise étiquette de Lisbeth ; les anciens IDs techniques sont conservés pour la migration.

## Commandes

| Commande | Action |
|---|---|
| Q/D, A/D, flèches | Déplacement ; Z/S ou W/S changent la profondeur dans les salles larges |
| Souris / J | Tir ; J vise devant le personnage |
| 1–4 | Les quatre raccourcis d’armes historiques |
| **7** | Armement : voir les 21 profils et équiper une arme possédée |
| **5 / 6** | Tir secondaire / changer un module sous canon compatible |
| E maintenu | Utiliser, récupérer, traverser, relever, réparer ou redéployer |
| R / K | Recharger / mêlée ou pinces du chargeur |
| G / H | Grenade / soin |
| I / L / O | Équipement / leurre / mine |
| Tab / V | Tablette / désignation de cible |
| Clic droit / Y | Position assignée à O’Neal ; C annule |
| C / B | Ordre de l’équipier / ordre de l’escorte |
| U | Préparer le repli d’une sentinelle en veille |
| P / N | Magasin Bug Hunt à proximité / lancer la vague |
| T / F | Détecteur / lampe |
| M / Échap | Carte / pause |

Le XM99A doit finir sa charge avant de tirer. Les semi-automatiques exigent un relâchement entre deux pressions. Les menus suspendent le temps. Les armes nouvelles ne sont pas données par le simple affichage de leur fiche.

## Reprises

Les clés `ATF_ACM_V10_PROFILE_1` à `3`, suffixes `_main`, `_stasis`, `_hunt`, sont distinctes des anciennes clés. Les anciens fichiers V9 sont lus, jamais écrasés par la migration. La salle, l’inventaire antérieur, les escortes, le dossier de service et les sentinelles sont conservés. Les nouvelles armes et réserves secondaires sont initialisées vides dans une migration.

Si un acteur se trouve dans un meuble déplacé par cette passe, il rejoint le point libre voisin sans soin ni réinitialisation arbitraire de mission. Les anciens fichiers Stasis corrigent l’étiquette de Hicks. Les maintiens partiels et la charge de plasma ne sont pas persistés. Les campagnes conservent leur convention sans projectiles transitoires ; Bug Hunt sauvegarde sa file et ses projectiles.

Une seule défense Bug Hunt par profil, pas une reprise par arène. Les records demeurent distincts. L’export groupé comprend les trois chroniques disponibles ; une chronique absente n’est pas créée.

## Documents

- `RAPPORT_ILLUSTRE_COLONIAL_MARINES_0_10_0.html` : captures exécutées et résultats actuels.
- `CODEX_COLONIAL_MARINES_0_10_0.html` : 105 fiches de salle, trois arènes, plans, mobilier, actions et raccords.
- `AUDIT_FIDELITE_COLONIAL_MARINES_0_10_0.html` : sources, statuts présent/adapté/partiel/absent, équipements, apparences.
- `docs/fidelity/REFERENCE_LEDGER.json` : registre exploitable et déplacements consignés.
- `reports/spatial-reference010.json` : vérifications de données, graphe et extrémités.
- `docs/history-v09` et `tests/history-v09` : doctrine et tests originaux conservés ; ils ne représentent pas des validations courantes.

## Écarts encore ouverts

Les sous-secteurs du jeu commercial ne sont pas tous relevés. Les cartes ne sont pas mesurées 1:1 et les visites successives d’un même complexe ne forment pas encore un plan géographique commun authentifié. Les coupes verticales, cadences exactes des scripts, cinématiques, animations et dialogues originaux ne sont pas reconstitués.

La G2 électrochoc, la tourelle WY téléopérée, l’armement de véhicule GAU-113/B, toutes les modifications et leur progression restent absents ou incomplets. La mine actuelle n’est pas une Claymore directionnelle fidèle. L’arsenal utilise encore des valeurs tactiques originales : pistolets à réserve finie, armes lourdes conservables, déblocages différents de l’XP/commendations du jeu. Le matériel original Tantalus est identifié séparément.

Pas de coopération réseau ni de Versus. Les arènes Bug Hunt sont des plans originaux, pas Broadside/Mercenary/Tribute. Les cartes Reconnaissance/Movie et Academy ne sont pas livrées comme reproductions.

## Reconstruction et vérification

Node 20+ et Python 3. Le code du jeu n’a pas de dépendance réseau. Playwright/Chromium sont nécessaires seulement aux contrôles navigateur.

```sh
npm run build
npm test
python3 tools/audit_reference.py
python3 tests/run_agents.py
python3 tests/run_tactical_agents.py
node tests/logistics-agent.mjs
node tests/environment-agent.mjs
python3 tests/run_browser_checks.py
python3 tests/fidelity-browser.py
node tests/http-static.mjs
npm run docs
python3 tests/documents.py
python3 tools/verify_release.py
```

Les tests de logique emploient des fixtures isolées. Les agents de parcours connaissent les positions et visent idéalement ; ils utilisent les déplacements, combats, achats et interactions du moteur sans forcer ses objectifs. Ni tests humains, ni mesure de difficulté ou certification totale des collisions.

## Installateur local facultatif

```sh
node tools/install.mjs status /chemin/Tantalus
node tools/install.mjs apply /chemin/Tantalus
node tools/install.mjs remove /chemin/Tantalus
```

Il copie le module et ajoute un lien sous contrat hôte v86, commit de référence `496996f5ea557d970ec625aa346876f3eaed1c5f`. Il ne fusionne pas GameEngine/SaveSystem/MIRE. Un hôte différent, un dossier déjà modifié ou une sauvegarde d’installation d’une version antérieure entraînent un refus sans écrasement. Une ancienne installation doit être retirée avec son propre installateur avant cette pose. L’hôte actuel n’a pas été exécuté ni publié dans cette passe.
