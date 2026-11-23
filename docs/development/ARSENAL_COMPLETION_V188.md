# Arsenal — complétion V188 (spec 014, lot A du 22 novembre 2026, lot B du 23 novembre 2026)

Document de développement **source uniquement** (admission exacte dans
`scripts/verify-public-release-v86.mjs`, exclu du build public). Il répond à la
demande du propriétaire « fidélité 1:1 comme le reste : améliorer et compléter
toutes les armes disponibles et manquantes, avec leurs chargeurs, VFX, etc. »
selon la règle du projet : **aucune arme n’est déclarée fidèle 1:1**. Chaque
valeur est rangée en trois statuts :

- **documenté** : relevé dans une source citée — alimentation et munition de la
  colonne `Alimentation` / `Munition / calibre` de
  `docs/arsenal/data/tantalus_arsenal_master_v1.csv` (recopiée telle quelle dans
  `src/weapon-arsenal-v188.js` et recontrôlée contre le CSV par le test), reçus
  de munition V124 (M41A 10 × 24 mm sans étui, M56 M250 sans étui), admission
  V193 (chargeur détachable seulement pour les quatre M41A) ;
- **adapté [PROPOSÉ]** : capacités, cadences, temps et temps forts de
  rechargement, choix VFX et sons — réglages de jeu Tantalus ;
- **à définir [À DÉFINIR] / [À VÉRIFIER]** : ce que les sources ne tranchent pas.

## Ce qui est livré dans le code

| Domaine | Réalisation | Limite |
| --- | --- | --- |
| Contrat lisible (stand de tir) | `src/weapon-arsenal-v188.js` : un profil gelé par arme du catalogue (219 depuis le lot B) — alimentation + source, capacité de jeu + source, modes/cadence, temps forts de rechargement, transaction, VFX (bouche, éjection, traceur, impact), sons, art tenu, points d’attache, emplacements de modules, maîtrise, fidélité. `getArsenalProfileV188(id)`, `listArsenalProfilesV188()`, et `engine.getArsenalStateV188(role)` pour l’état vivant | Données de jeu, pas mesures de source |
| Alimentations non détachables | `src/weapon-arsenal-runtime-v188.js` (couche `withArsenalFeedsV188`, juste sous `withMagazineRecoveryWorldV168`) : pont natif du contrat V171 pour **tube** (M37A2 + finitions, Hicks Ithaca 37, fusil de Sevastopol), **barillet** (.357 + finitions), **bande** (M56 + finitions), **réservoir** (M240 + finitions, lance-flammes de Sevastopol) et **tir unique** (M6B, M83, M5 + finitions) — 31 identifiants au lot A, 75 avec le lot B (cellules, réservoirs, bandes et barillets hors lot A : voir plus bas) | Le chronomètre et le transfert final restent ceux de V77 |
| Comportement | pompe obligatoire après chaque tir (0,4 s [PROPOSÉ]), étui éjecté au cycle (V124) ; tube rechargé cartouche par cartouche, interruption = cartouches déjà insérées conservées ; barillet : étuis retenus jusqu’au rechargement ; bande/réservoir : remplacement à 88 % du geste ; lanceur : **une** roquette dans le tube, le surplus du chiffre historique passe en réserve (somme conservée) ; .357 : 6 chambres (CSV « Capacité canon ») | Animations natives de pompe, barillet, bande et réservoir absentes |
| Chargeurs physiques | les quatre M41A (preuve V193) et, depuis le lot B (décision A6), les quatre VP70 (accessoire réel Heckler & Koch VP70) ont un chargeur détachable et le ramassage au sol V168 ; aucune autre arme ne reçoit de chargeur inventé | Les autres « box » restent sur le transfert numérique V77 jusqu’à preuve propre au modèle |
| VFX | tirs V131 (fusils à pompe, lance-flammes, roquettes, énergie) désormais envoyés au passage de bouche V188 ; traînée de fumée des roquettes ; étincelles/braises quand un projectile V131 frappe une surface ; explosion visible même sans cible touchée. Éclaboussure acide : inchangée, déterminée par la biologie de la cible (vfx-v188) | Aucun sprite nouveau ; primitives Canvas des emplacements nommés |
| Audio | indices existants (synthèse originale V188) choisis par profil : lance-flammes, lanceurs (`weapon-m41a-grenade`), smartgun, fusil à pompe, pistolet ; clac de pompe `weapon-dry-fire` | Aucun nouvel échantillon ; sons propres à chaque arme [À DÉFINIR] |
| Art tenu | 178 armes à plaque native inchangées ; les ajouts dessinent une silhouette Canvas derrière des emplacements nommés `held-weapon-placeholder-*` (fusil à pompe, lance-flammes, puis au lot B pistolet, fusil, pistolet-mitrailleur, précision, arme lourde, lanceur, énergie, aiguillon) | Plaques natives requises (pas de génération d’image) |
| Sauvegardes | état du pont sous `player/coop.arsenalFeedV188` (schéma 188) dans la reprise ; une alimentation falsifiée ou absente est reconstruite depuis les nombres ; anciennes sauvegardes intactes ; option `arsenalFeedsV188: false` | Transaction de rechargement en cours non reprise (V77 la relance ou la solde) |

## Armes ajoutées (identifiants nouveaux, rien de renuméroté)

Trois dossiers P0/P1 de l’index de recherche V171 sont promus en entrées de
catalogue **sans plaque** (`src/weapon-catalog-additions-v188.js`). La règle
existante de l’armurerie (« PLAQUETTE DÉDIÉE REQUISE ») les rend **non
achetables** tant qu’une plaque native admise n’existe pas ; elles sont jouables
par chargement (sauvegarde) et lisibles par le stand de tir. Les numéros 194–196
évitent 191, réservé comme numéro inconnu par le test V124.

| ID | Arme | Source citée | Documenté | Adapté [PROPOSÉ] | À définir |
| --- | --- | --- | --- | --- | --- |
| weapon-194-hicks-ithaca-37-shotgun | Hicks Ithaca 37 Shotgun | *Aliens* (1986) à l’écran ; identification de l’accessoire par l’IMFDB (https://www.imfdb.org/wiki/Aliens, https://www.imfdb.org/wiki/Ithaca_37_%22Stakeout%22) et le wiki AVP — sources **secondaires** | fusil à pompe, alimentation tube (mécanisme de l’arme réelle) | capacité 4, cadence 1,5/s, dégâts, rechargement 2,6 s | Stakeout d’usine ou modèle long recoupé (débattu) ; chambrage 12 ga [À VÉRIFIER] ; plaque native |
| weapon-195-sevastopol-pump-shotgun | Sevastopol Pump Shotgun | Manuel officiel Feral d’*Alien: Isolation* (https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/ : « Select shotgun ») | la classe « Shotgun » | tube et pompe, capacité 4, cadence 1,3/s | désignation « Model 37 12 Gauge » (wiki secondaire) ; munition ; plaque |
| weapon-196-sevastopol-flamethrower | Sevastopol Flamethrower | Même manuel (« Select flamethrower ») | la classe « Flamethrower » | réservoir 80 unités, débit, dégâts | contenance réelle, apparence ; plaque |

Les dossiers d’origine restent `RESEARCH_ONLY` dans l’index V171 ; la vue de
recherche affiche maintenant leur rapprochement exact (`promotedCatalogIdV188`,
par `researchId`, jamais par nom). Les dossiers V170 correspondants
(`proposed-model-37-12-gauge-pump-action`, `proposed-sevastopol-flamethrower`)
sont inchangés.

Mise à jour du 23 novembre 2026 : le paragraphe « Non ajoutées » du lot A est
remplacé par la section « Lot B » ci-dessous. L’achat des armes 194–196 relève
du lot parallèle des décisions du propriétaire.

## Lot B — armes de la franchise ajoutées (23 novembre 2026)

Demande du propriétaire : « ajouter toutes les armes manquantes de l’univers
Aliens, jouables, avec une fidélité 1:1 ». Règle du projet appliquée : **aucune
arme n’est déclarée fidèle 1:1** ; chaque valeur est documentée (source citée),
adaptée [PROPOSÉ] ou à définir. Le lot livre des **familles complètes dans
l’ordre de priorité** et liste le reste avec les sources déjà réunies :

1. **films** : *Alien* (1979), *Aliens* (1986), *Alien Resurrection* (1997),
   *Prometheus* (2012), *Alien: Covenant* (2017) — toutes les armes humaines
   portatives citées par les sources consultées ou par le suivi V170 ;
   *Alien 3* et *Alien: Romulus* n’apportent aucune arme nouvelle (voir plus bas) ;
2. **série** : *Alien: Earth* (2025) — armes identifiées par la presse spécialisée ;
3. **jeux dont la liste a pu être lue arme par arme** : *Aliens: Dark Descent*,
   *Aliens vs Predator* (2010) et *Aliens versus Predator 2* (2001), armes des
   marines seulement.

38 entrées de catalogue, identifiants **197 à 235** (`src/weapon-catalog-franchise-v188.js`),
ajoutées en fin de catalogue. Numéros sautés : **191** (réservé par le test V124)
et **216** (le résolveur visuel historique V112 ramène 216, 256, 296… sur la
plaque du Heavy Pulse Rifle par modulo : l’arme aurait emprunté un art qui n’est
pas le sien).

Chaque arme est **jouable** : entrée de catalogue, classe de tir existante
(balle, rafale de trois, gerbe, jet de flammes, grenade, plasma, laser, décharge
électrique, canons rotatifs, contact étourdissant), alimentation raccordée
(pont natif tube / bande / réservoir / cellule, ou transfert numérique V77 pour
un chargeur non documenté), rechargement, effets de bouche, d’éjection, de
traînée et d’impact des couches V188, indices sonores existants, profil tenu
avec points d’attache, emplacement Canvas nommé, maîtrise (carnet V167, tout
identifiant du catalogue), nom et description FR/EN. Chaque arme est
**achetable à l’armurerie avec une plaque provisoire dessinée**
(`src/weapon-provisional-plaque-v188.js` : cadre pointillé, silhouette de classe
en primitives Canvas, mention « PLAQUE PROVISOIRE · ILLUSTRATION À PRODUIRE » ;
aucune image n’est générée ni empruntée). Mécanisme partagé : toute entrée du
catalogue portant `admissionV188: 'provisional-plaque-purchasable'` l’obtient.

### Sources et accès (23 novembre 2026)

| Source | Nature | Accès pendant ce lot | Ce qu’elle appuie |
| --- | --- | --- | --- |
| IMFDB (pages *Alien*, *Aliens*, *Alien³*, *Alien: Resurrection*, *Prometheus*, *Alien: Covenant*, VP70, acteurs) | base d’accessoires, **secondaire** | pages en HTTP 403 ; contenu lu par extraits de recherche | identification des accessoires, armes réelles de base, porteurs |
| Prop Store (lance-flammes d’*Alien*, Draco Double Burner) | maison de ventes, **secondaire proche de l’accessoire** | extraits de recherche | fonctionnement à gaz et veilleuse ; fabrication de toutes pièces du Draco |
| Royal Armouries (M41A) | musée, **primaire pour l’accessoire** | déjà citée par V174 ; extrait de recherche | fusil 10 mm et lance-grenades 30 mm à pompe superposés |
| The Firearm Blog, Hook & Barrel (*Alien: Earth*, *Romulus*) | presse spécialisée, **secondaire** | extraits de recherche | Maxim 9, Kel-Tec KSG, Steyr AUG, KRISS Vector, fusils bullpup de Prodigy |
| AvPGalaxy (*Dark Descent*, *AvP 2010*, *AvP2*) | site de fans, **secondaire** | pages lues en entier (hors fin tronquée de *Dark Descent*) | listes d’armes, modes de tir, capacités quand elles sont données |
| Synthèses du *Colonial Marines Technical Manual* (AVP Central, wikis) | **secondaire** ; le manuel de 1995 lui-même **n’a pas été consulté** | extraits de recherche | 900 coups/min, 10×24 mm sans étui, chargeur de 99 (M41A) ; pistolet M4A3 de 12 coups |
| StrategyWiki (*Fireteam Elite*, *Colonial Marines*), GameWatcher, Fandom (*Isolation*, Xenopedia) | listes du suivi V170 | **HTTP 403 / 402** : non relues | rien dans ce lot — familles reportées |

### Registre de fidélité du lot B

Source unique : `WEAPON_FRANCHISE_LEDGER_V188` (même module), recontrôlé par
`scripts/verify-weapon-franchise-v188.mjs`. « Rien au-delà du nom » signifie que
le suivi V170 cite l’arme mais que sa page n’a pas pu être relue : l’arme est
jouable comme adaptation de classe, entièrement [PROPOSÉ].

| ID | Arme · œuvre | Sources (URL — nature) | Documenté | Adapté [PROPOSÉ] | À définir / à vérifier |
| --- | --- | --- | --- | --- | --- |
| weapon-197-nostromo-flamethrower | Nostromo Flamethrower · *Alien (1979)* | https://www.imfdb.org/wiki/Alien ; https://propstore.com/the-prop-store-collection/aliens/flamethrower/ — base d’accessoires de films (secondaire) | arme principale de l’équipage, assemblée par Parker (IMFDB) ; accessoire à gaz avec veilleuse (Prop Store) | dégâts 28 [PROPOSÉ] ; cadence 9/s [PROPOSÉ] ; rechargement 2.6 s [PROPOSÉ] ; capacité 60 [PROPOSÉ] ; alimentation de jeu « tank » [PROPOSÉ] | contenance ; désignation en univers ; plaque native |
| weapon-198-nostromo-electric-prod | Nostromo Electric Prod · *Alien (1979)* | https://en.wikipedia.org/wiki/Alien_(film) ; https://www.imfdb.org/wiki/Alien — résumé du film (secondaire) | Brett assemble une arme semblable à un aiguillon à bétail (résumé du film) ; accessoire visible sur une photo de plateau (IMFDB) | dégâts 18 [PROPOSÉ] ; cadence 2/s [PROPOSÉ] ; rechargement 1 s [PROPOSÉ] ; capacité 1 [PROPOSÉ] ; alimentation de jeu « none » [PROPOSÉ] | source d’énergie ; effet réel sur la créature ; plaque native |
| weapon-199-nostromo-laser-pistol | Nostromo Laser Pistol · *Alien (1979)* | https://www.imfdb.org/wiki/Alien ; https://alienanthology.fandom.com/wiki/RXF-M5_EVA_Pistol — base d’accessoires de films (secondaire) | accessoire construit sur un Rexim-Favor raccourci (IMFDB) ; jamais tiré dans le film ; « pistolet laser » selon la novélisation (IMFDB) | dégâts 22 [PROPOSÉ] ; cadence 2.2/s [PROPOSÉ] ; rechargement 2.2 s [PROPOSÉ] ; capacité 12 [PROPOSÉ] ; alimentation de jeu « cell » [PROPOSÉ] | désignation RXF-M5 (wiki secondaire) ; tout comportement de tir ; plaque native |
| weapon-200-vasquez-sw-model-39 | Vasquez S&W Model 39 · *Aliens (1986)* | https://www.imfdb.org/wiki/Aliens ; https://www.imfdb.org/wiki/Jenette_Goldstein ; https://avp.fandom.com/wiki/Smith_%26_Wesson_Model_39 — base d’accessoires de films (secondaire) | arme de secours de Vasquez, distincte du VP70 (IMFDB, wiki AVP) | dégâts 24 [PROPOSÉ] ; cadence 3.2/s [PROPOSÉ] ; rechargement 1.6 s [PROPOSÉ] ; capacité 8 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité et calibre de l’arme réelle ; plaque native |
| weapon-201-lacrima-99-shockrifle | Lacrima 99 Shockrifle · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection ; https://alienanthology.fandom.com/wiki/Lacrima_99_Shockrifle — base d’accessoires de films (secondaire) | fusil d’assaut réglementaire de l’USM, réglage principal à projectiles solides (IMFDB) ; accessoires fabriqués de toutes pièces (wiki Alien Anthology) | dégâts 27 [PROPOSÉ] ; cadence 8/s [PROPOSÉ] ; rechargement 2.1 s [PROPOSÉ] ; capacité 30 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | alimentation et capacité ; mode « choc » ; baïonnette (dossier séparé) ; plaque native |
| weapon-202-draco-double-burner | Draco Double Burner · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection ; https://propstore.com/product/alien-resurrection-1997/14-ellen-ripleys-sigourney-weaver-and-gary-christies-gary-dourdan-screen-and-photo-matched-light-up-draco-double-burner — base d’accessoires de films (secondaire) | modes fusil, lance-grenades et lance-flammes (IMFDB) ; conçu par Nigel Phelps, construit de toutes pièces (Prop Store) | dégâts 30 [PROPOSÉ] ; cadence 9/s [PROPOSÉ] ; rechargement 2.6 s [PROPOSÉ] ; capacité 70 [PROPOSÉ] ; alimentation de jeu « tank » [PROPOSÉ] | modes fusil et lance-grenades non implémentés ; contenance ; plaque native |
| weapon-203-usm-standard-sidearm | USM Standard Sidearm · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection — nom du suivi V170 seulement — page non relue (HTTP 403) | rien au-delà du nom | dégâts 22 [PROPOSÉ] ; cadence 3.4/s [PROPOSÉ] ; rechargement 1.7 s [PROPOSÉ] ; capacité 12 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité de l’accessoire ; alimentation ; plaque native |
| weapon-204-call-zip-gun | Call Zip Gun · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection — nom du suivi V170 seulement — page non relue (HTTP 403) | rien au-delà du nom | dégâts 20 [PROPOSÉ] ; cadence 2.4/s [PROPOSÉ] ; rechargement 1.5 s [PROPOSÉ] ; capacité 4 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité de l’accessoire ; alimentation ; plaque native |
| weapon-205-christie-wrist-pistols | Christie Wrist Pistols · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection — nom du suivi V170 seulement — page non relue (HTTP 403) | rien au-delà du nom | dégâts 21 [PROPOSÉ] ; cadence 4.6/s [PROPOSÉ] ; rechargement 1.9 s [PROPOSÉ] ; capacité 14 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité des accessoires ; mécanisme de manche ; alimentation ; plaque native |
| weapon-206-vriess-collapsible-shotgun | Vriess Collapsible Shotgun · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection — nom du suivi V170 seulement — page non relue (HTTP 403) | rien au-delà du nom | dégâts 40 [PROPOSÉ] ; cadence 1.4/s [PROPOSÉ] ; rechargement 2.4 s [PROPOSÉ] ; capacité 4 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité de l’accessoire ; mécanisme et capacité ; plaque native |
| weapon-207-usm-collapsible-grenade-launcher | USM Collapsible Grenade Launcher · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection — nom du suivi V170 seulement — page non relue (HTTP 403) | rien au-delà du nom | dégâts 58 [PROPOSÉ] ; cadence 1.2/s [PROPOSÉ] ; rechargement 3 s [PROPOSÉ] ; capacité 4 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité de l’accessoire ; mécanisme et capacité ; plaque native |
| weapon-208-okee-doke-corral-cowboy-pistol | Okee-Doke Corral Cowboy Pistol · *Alien Resurrection (1997)* | https://www.imfdb.org/wiki/Alien:_Resurrection — nom du suivi V170 seulement — page non relue (HTTP 403) | rien au-delà du nom | dégâts 30 [PROPOSÉ] ; cadence 2/s [PROPOSÉ] ; rechargement 2.2 s [PROPOSÉ] ; capacité 6 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité de l’accessoire ; porteur ; alimentation ; plaque native |
| weapon-209-es-7-supernova-shockgun | ES-7 Supernova Shockgun · *Prometheus (2012)* | https://www.imfdb.org/wiki/Prometheus ; https://avp.fandom.com/wiki/ES-7_Supernova_Electrostatic_Shockgun — base d’accessoires de films (secondaire) | accessoires construits sur le Benelli M3T Super 90 (IMFDB) | dégâts 34 [PROPOSÉ] ; cadence 1.6/s [PROPOSÉ] ; rechargement 2.4 s [PROPOSÉ] ; capacité 8 [PROPOSÉ] ; alimentation de jeu « cell » [PROPOSÉ] | désignation et munition en univers ; capacité ; plaque native |
| weapon-210-prometheus-flamethrower | Prometheus Flamethrower · *Prometheus (2012)* | https://www.imfdb.org/wiki/Prometheus ; https://avp.fandom.com/wiki/Category:Prometheus_(film)_weapons — base d’accessoires de films (secondaire) | lance-flammes illustré sur la page du film (IMFDB) | dégâts 29 [PROPOSÉ] ; cadence 9/s [PROPOSÉ] ; rechargement 2.5 s [PROPOSÉ] ; capacité 60 [PROPOSÉ] ; alimentation de jeu « tank » [PROPOSÉ] | désignation ; contenance ; plaque native |
| weapon-211-covenant-rmc-bullpup-rifle | RMC Bullpup Rifle · *Alien: Covenant (2017)* | https://www.imfdb.org/wiki/Alien:_Covenant ; https://avp.fandom.com/wiki/Category:Alien:_Covenant_weapons — base d’accessoires de films (secondaire) | fusils bullpup futuristes appelés RMC (IMFDB) | dégâts 26 [PROPOSÉ] ; cadence 7.5/s [PROPOSÉ] ; rechargement 2.2 s [PROPOSÉ] ; capacité 30 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | désignation F903WE ; alimentation et capacité ; plaque native |
| weapon-212-covenant-thales-f90-sl40 | Cole Thales F90 · *Alien: Covenant (2017)* | https://www.imfdb.org/wiki/Alien:_Covenant — base d’accessoires de films (secondaire) | Thales F90 avec Thales SL40 porté par Cole (IMFDB) | dégâts 25 [PROPOSÉ] ; cadence 8/s [PROPOSÉ] ; rechargement 2.2 s [PROPOSÉ] ; capacité 30 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | lance-grenades SL40 non implémenté ; capacité ; plaque native |
| weapon-213-covenant-beretta-92fs | Beretta 92FS Brigadier · *Alien: Covenant (2017)* | https://www.imfdb.org/wiki/Alien:_Covenant — base d’accessoires de films (secondaire) | Beretta 92FS Brigadier, 9x19 mm (IMFDB) | dégâts 23 [PROPOSÉ] ; cadence 3.6/s [PROPOSÉ] ; rechargement 1.7 s [PROPOSÉ] ; capacité 15 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité de l’arme réelle ; plaque native |
| weapon-214-covenant-remington-870-short | Faris Shortened Remington 870 · *Alien: Covenant (2017)* | https://www.imfdb.org/wiki/Alien:_Covenant — base d’accessoires de films (secondaire) | Remington 870 raccourci et modifié (IMFDB) ; pompe et tube : mécanisme de l’arme réelle | dégâts 44 [PROPOSÉ] ; cadence 1.4/s [PROPOSÉ] ; rechargement 2.6 s [PROPOSÉ] ; capacité 4 [PROPOSÉ] ; alimentation de jeu « tube » [PROPOSÉ] | capacité du tube raccourci ; plaque native |
| weapon-215-covenant-security-ar-15 | Covenant Security AR-15 · *Alien: Covenant (2017)* | https://www.imfdb.org/wiki/Alien:_Covenant ; https://avp.fandom.com/wiki/Category:Alien:_Covenant_weapons — base d’accessoires de films (secondaire) | AR-15 personnalisé porté par un agent de sécurité (IMFDB) | dégâts 24 [PROPOSÉ] ; cadence 8.2/s [PROPOSÉ] ; rechargement 2.1 s [PROPOSÉ] ; capacité 30 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | désignation en univers ; capacité ; plaque native |
| weapon-217-prodigy-bullpup-rifle | Prodigy Bullpup Rifle · *Alien: Earth (2025)* | https://www.thefirearmblog.com/blog/the-guns-of-alien-earth-44823319 ; https://www.hookandbarrel.com/shooting/guns-of-alien-earth — presse spécialisée (secondaire) | fusils d’assaut bullpup des forces de sécurité (The Firearm Blog) | dégâts 25 [PROPOSÉ] ; cadence 8.5/s [PROPOSÉ] ; rechargement 2.2 s [PROPOSÉ] ; capacité 40 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | identité de l’accessoire (sources divergentes) ; alimentation ; plaque native |
| weapon-218-prodigy-maxim-9-pistol | Prodigy Maxim 9 Pistol · *Alien: Earth (2025)* | https://www.thefirearmblog.com/blog/the-guns-of-alien-earth-44823319 ; https://www.hookandbarrel.com/shooting/guns-of-alien-earth — presse spécialisée (secondaire) | SilencerCo Maxim 9 porté par la sécurité de Prodigy (The Firearm Blog, Hook & Barrel) | dégâts 22 [PROPOSÉ] ; cadence 3.4/s [PROPOSÉ] ; rechargement 1.7 s [PROPOSÉ] ; capacité 15 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité de l’arme réelle ; plaque native |
| weapon-219-morrow-kel-tec-ksg | Morrow Kel-Tec KSG · *Alien: Earth (2025)* | https://www.thefirearmblog.com/blog/the-guns-of-alien-earth-44823319 — presse spécialisée (secondaire) | Kel-Tec KSG utilisé par Morrow (The Firearm Blog) ; pompe et tubes : mécanisme de l’arme réelle | dégâts 42 [PROPOSÉ] ; cadence 1.5/s [PROPOSÉ] ; rechargement 2.8 s [PROPOSÉ] ; capacité 7 [PROPOSÉ] ; alimentation de jeu « tube » [PROPOSÉ] | capacité des tubes ; sélection des deux tubes non simulée ; plaque native |
| weapon-220-alien-earth-steyr-aug | Steyr AUG · *Alien: Earth (2025)* | https://www.hookandbarrel.com/shooting/guns-of-alien-earth — presse spécialisée (secondaire) | Steyr AUG présent dans la série (Hook & Barrel) | dégâts 24 [PROPOSÉ] ; cadence 8/s [PROPOSÉ] ; rechargement 2.1 s [PROPOSÉ] ; capacité 30 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | porteur et épisode ; capacité ; plaque native |
| weapon-221-alien-earth-kriss-vector | KRISS Vector · *Alien: Earth (2025)* | https://www.hookandbarrel.com/shooting/guns-of-alien-earth — presse spécialisée (secondaire) | KRISS Vector présent dans la série (Hook & Barrel) | dégâts 17 [PROPOSÉ] ; cadence 12/s [PROPOSÉ] ; rechargement 2 s [PROPOSÉ] ; capacité 25 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | porteur et épisode ; capacité ; plaque native |
| weapon-222-m39-u-submachine-gun | M39-U Submachine Gun · *Aliens: Dark Descent* | https://www.avpgalaxy.net/games/aliens-dark-descent/weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | chargeur de 48 coups, rechargement 2 s, tir automatique (liste AvPGalaxy) ; capacité 48 (https://www.avpgalaxy.net/games/aliens-dark-descent/weapons/ · « 48-round clip ») | dégâts 15 [PROPOSÉ] ; cadence 11/s [PROPOSÉ] ; rechargement 2 s [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | calibre ; plaque native |
| weapon-223-xm99a1-phased-plasma-pulse-rifle | XM99A1 Phased Plasma Pulse Rifle · *Aliens: Dark Descent* | https://www.avpgalaxy.net/games/aliens-dark-descent/weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | capacité 100, rechargement 3 s, rafale plasma (liste AvPGalaxy) ; capacité 100 (https://www.avpgalaxy.net/games/aliens-dark-descent/weapons/ · « 100-round clip ») | dégâts 30 [PROPOSÉ] ; cadence 5/s [PROPOSÉ] ; rechargement 3 s [PROPOSÉ] ; alimentation de jeu « cell » [PROPOSÉ] | surcharge optionnelle non implémentée ; forme de la cellule ; plaque native |
| weapon-224-m42a3-sniper-rifle | M42A3 Sniper Rifle · *Aliens: Dark Descent* | https://www.avpgalaxy.net/games/aliens-dark-descent/weapons/ ; https://strategywiki.org/wiki/Aliens:_Fireteam_Elite/Weapons — liste d’armes du jeu, lue arme par arme (secondaire) | fusil à verrou, coup par coup, fort recul (liste AvPGalaxy) | dégâts 68 [PROPOSÉ] ; cadence 0.8/s [PROPOSÉ] ; rechargement 3 s [PROPOSÉ] ; capacité 5 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité ; silencieux optionnel non implémenté ; plaque native |
| weapon-225-vp78-pistol | VP78 Pistol · *Aliens vs Predator (2010)* | https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/ — liste d’armes du jeu, lue arme par arme (secondaire) | coup par coup ou rafale de trois, 9 mm « squash-head », munitions illimitées (liste AvPGalaxy) | dégâts 16 [PROPOSÉ] ; cadence 2.6/s [PROPOSÉ] ; rechargement 1.6 s [PROPOSÉ] ; capacité 18 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | coup par coup non sélectionnable ici ; plaque native |
| weapon-226-zx-76-shotgun | ZX-76 Shotgun · *Aliens vs Predator (2010)* | https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/ — liste d’armes du jeu, lue arme par arme (secondaire) | tir secondaire des deux canons, peu de cartouches, rechargement long (liste AvPGalaxy) | dégâts 46 [PROPOSÉ] ; cadence 1.3/s [PROPOSÉ] ; rechargement 3.2 s [PROPOSÉ] ; capacité 6 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité ; mécanisme d’alimentation ; plaque native |
| weapon-227-m41a-2-pulse-rifle | M41A/2 Pulse Rifle · *Aliens vs Predator (2010)* | https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/ — liste d’armes du jeu, lue arme par arme (secondaire) | tir automatique en rafales courtes, lance-grenades secondaire (liste AvPGalaxy) | dégâts 22 [PROPOSÉ] ; cadence 9/s [PROPOSÉ] ; rechargement 1.8 s [PROPOSÉ] ; capacité 99 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité ; lance-grenades non implémenté sur ce modèle ; plaque native |
| weapon-228-m59-b-smartgun | M59/B Smartgun · *Aliens vs Predator (2010)* | https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/ — liste d’armes du jeu, lue arme par arme (secondaire) | visée automatique ou tir libre, porteur ralenti (liste AvPGalaxy) | dégâts 19 [PROPOSÉ] ; cadence 10/s [PROPOSÉ] ; rechargement 3.6 s [PROPOSÉ] ; capacité 150 [PROPOSÉ] ; alimentation de jeu « belt » [PROPOSÉ] | alimentation ; visée automatique non implémentée ; plaque native |
| weapon-229-m260b-flamethrower | M260B Flamethrower · *Aliens vs Predator (2010)* | https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/ — liste d’armes du jeu, lue arme par arme (secondaire) | jet soutenu ; tir secondaire projetant du carburant (liste AvPGalaxy) | dégâts 26 [PROPOSÉ] ; cadence 9/s [PROPOSÉ] ; rechargement 2.5 s [PROPOSÉ] ; capacité 80 [PROPOSÉ] ; alimentation de jeu « tank » [PROPOSÉ] | contenance ; projection de carburant non implémentée ; plaque native |
| weapon-230-m42c-scoped-rifle | M42C Scoped Rifle · *Aliens vs Predator (2010)* | https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/ — liste d’armes du jeu, lue arme par arme (secondaire) | arme longue portée à lunette (liste AvPGalaxy) | dégâts 64 [PROPOSÉ] ; cadence 0.9/s [PROPOSÉ] ; rechargement 2.8 s [PROPOSÉ] ; capacité 6 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité ; lunette spéciale non implémentée ; plaque native |
| weapon-231-m-4a4-pistol | M-4A4 Pistol · *Aliens versus Predator 2 (2001)* | https://www.avpgalaxy.net/games/avp2/marine-weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | 12 coups par chargeur, tir coup par coup, deux types de balles (liste AvPGalaxy) ; capacité 12 (https://www.avpgalaxy.net/games/avp2/marine-weapons/ · « 12 rounds per clip ») | dégâts 21 [PROPOSÉ] ; cadence 3.4/s [PROPOSÉ] ; rechargement 1.6 s [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | balles perforantes non implémentées ; plaque native |
| weapon-232-m-240a1-flamethrower | M-240A1 Flamethrower · *Aliens versus Predator 2 (2001)* | https://www.avpgalaxy.net/games/avp2/marine-weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | flamme soutenue à la détente (liste AvPGalaxy) | dégâts 29 [PROPOSÉ] ; cadence 9/s [PROPOSÉ] ; rechargement 2.4 s [PROPOSÉ] ; capacité 80 [PROPOSÉ] ; alimentation de jeu « tank » [PROPOSÉ] | contenance ; plaque native |
| weapon-233-wy-102-sniper-rifle | WY-102 Sniper Rifle · *Aliens versus Predator 2 (2001)* | https://www.avpgalaxy.net/games/avp2/marine-weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | 30 coups, zoom à lunette (liste AvPGalaxy) ; capacité 30 (https://www.avpgalaxy.net/games/avp2/marine-weapons/ · « 30 rounds ») | dégâts 62 [PROPOSÉ] ; cadence 0.9/s [PROPOSÉ] ; rechargement 2.8 s [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | forme du chargeur ; plaque native |
| weapon-234-m-92-grenade-launcher | M-92 Grenade Launcher · *Aliens versus Predator 2 (2001)* | https://www.avpgalaxy.net/games/avp2/marine-weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | quatre types de grenades : à retardement, de proximité, intelligente, IEM (liste AvPGalaxy) | dégâts 56 [PROPOSÉ] ; cadence 1.3/s [PROPOSÉ] ; rechargement 3 s [PROPOSÉ] ; capacité 6 [PROPOSÉ] ; alimentation de jeu « box » [PROPOSÉ] | capacité ; types de grenades non implémentés ; plaque native |
| weapon-235-m-90-minigun | M-90 Minigun · *Aliens versus Predator 2 (2001)* | https://www.avpgalaxy.net/games/avp2/marine-weapons/ — liste d’armes du jeu, lue arme par arme (secondaire) | mise en rotation puis tir, 900 coups (liste AvPGalaxy) ; capacité 900 (https://www.avpgalaxy.net/games/avp2/marine-weapons/ · « 900 rounds per clip ») | dégâts 9 [PROPOSÉ] ; cadence 14/s [PROPOSÉ] ; rechargement 4 s [PROPOSÉ] ; alimentation de jeu « belt » [PROPOSÉ] | forme de l’alimentation ; rotation à vide secondaire non implémentée ; plaque native |

Fiches de recherche inscrites avec leur source avant la promotion (elles
n’existaient pas dans l’index V171 de 129 lignes, qui n’est pas réécrit) :

| Fiche | Arme | Œuvre | Source |
| --- | --- | --- | --- |
| proposed-v188-nostromo-flamethrower | Nostromo flamethrower | Alien (1979) | https://www.imfdb.org/wiki/Alien |
| proposed-v188-nostromo-electric-prod | Nostromo electric prod | Alien (1979) | https://en.wikipedia.org/wiki/Alien_(film) |
| proposed-v188-nostromo-laser-pistol | Nostromo laser pistol | Alien (1979) | https://www.imfdb.org/wiki/Alien |
| proposed-v188-covenant-thales-f90-sl40 | Thales F90 with SL40 (Cole) | Alien: Covenant (2017) | https://www.imfdb.org/wiki/Alien:_Covenant |
| proposed-v188-covenant-remington-870-short | Shortened Remington 870 (Faris) | Alien: Covenant (2017) | https://www.imfdb.org/wiki/Alien:_Covenant |
| proposed-v188-alien-earth-maxim-9 | SilencerCo Maxim 9 (Prodigy security) | Alien: Earth (2025) | https://www.thefirearmblog.com/blog/the-guns-of-alien-earth-44823319 |
| proposed-v188-alien-earth-kel-tec-ksg | Kel-Tec KSG (Morrow) | Alien: Earth (2025) | https://www.thefirearmblog.com/blog/the-guns-of-alien-earth-44823319 |
| proposed-v188-alien-earth-steyr-aug | Steyr AUG | Alien: Earth (2025) | https://www.hookandbarrel.com/shooting/guns-of-alien-earth |
| proposed-v188-alien-earth-kriss-vector | KRISS Vector | Alien: Earth (2025) | https://www.hookandbarrel.com/shooting/guns-of-alien-earth |

Cas sans arme nouvelle :

- ***Alien 3*** : les commandos de Weyland-Yutani portent le **M41A** peint en
  noir (IMFDB ; Royal Armouries : deux fusils supplémentaires construits pour la
  suite). C’est le modèle `weapon-001` ; aucune arme à feu nouvelle. Les armes
  de fortune des détenus (haches, torches) ne sont pas inscrites [À DÉFINIR].
- ***Alien: Romulus*** : seul le F44AA (`weapon-017`) est identifié. Sa capacité
  est donnée à 400 (Hook & Barrel) ou 450 coups (Popular Airsoft) : sources
  secondaires contradictoires, valeur de jeu inchangée [À VÉRIFIER].
- ***Alien: Isolation*** : le DV-303 Bolt Gun est le `weapon-022` déjà au
  catalogue (dossier de comparaison V170).
- ***Aliens: Dark Descent*** : le M41E3 lourd correspond au `weapon-016`, le
  SA .357 au `weapon-021` (rapprochements à vérifier, pas des preuves).

### Alimentations natives hors lot A (T104)

Le pont natif V188 couvre maintenant, **sans changer aucune capacité** :

| Alimentation | Armes (finitions comprises) | Comportement |
| --- | --- | --- |
| cellule | ES-4, Plasma Rifle, Neuro-Link Disruptor, N79 EVA Laser, EDS-93 Zadak, P.649 HEL, EVI-87 Zvezda ; lot B : pistolet laser du Nostromo, ES-7 Supernova, XM99A1 | la cellule est remplacée d’un bloc à 88 % du geste (même machine d’états que le réservoir) ; interruption = rien de perdu, rien de créé |
| réservoir | projecteurs Ripper, Reef Caster, Cryo Lance, Pathogen Containment, OCAP-91 Volcan, Type 99 ; lot B : six lance-flammes | idem |
| bande | L59 Minigun, Thunderbolt Mk.2 ; lot B : M59/B Smartgun, M-90 Minigun | idem |
| barillet | Frontier Revolver | étuis retenus jusqu’au rechargement |
| tube | lot B : Remington 870 raccourci (Faris), Kel-Tec KSG (Morrow) | pompe après chaque tir, cartouche par cartouche |

Volontairement **non raccordés** (`ARSENAL_UNBRIDGED_SPECIAL_FEEDS_V188`) : le bâton
étourdissant (action de contact V130, ne dépense aucune charge), le cutter
(outil V130), l’arc et le fusil-harpon (projectiles récupérables V131 tirés de la
réserve), le Bolt Gun et le harpon sonique (alimentation « single » du CSV : une
capacité de 1 changerait l’équilibrage — décision du propriétaire).

### Décisions du propriétaire du 23 novembre 2026

- **A9 — cadence du M41A** : la fiche d’armurerie cite « 900 coups/min selon les
  synthèses du *Colonial Marines Technical Manual* (1995), source secondaire »
  (`ARSENAL_DOCUMENTED_RATES_V188`, sources : https://www.avpcentral.com/aliens-colonial-marines-technical-manual
  et https://avpcentral.com/m41a-pulse-rifle-history-and-variants ; le manuel
  lui-même n’a pas été consulté). La cadence de jeu reste 7,7/s [PROPOSÉ] :
  aucun changement de jeu.
- **A6 — chargeurs physiques** : recherche d’une preuve propre au modèle.
  - **VP70 : admis.** L’accessoire de Gorman est un Heckler & Koch VP70 réel
    (https://www.imfdb.org/wiki/William_Hope), pistolet à chargeur amovible
    (https://www.imfdb.org/wiki/Heckler_%26_Koch_VP70 ; capacité réelle de
    18 coups, spécification générale). Les quatre identités VP70 reçoivent le
    chargeur physique et le ramassage au sol par `weapon-feed-admission-v193`
    (option existante des chargeurs physiques). La capacité de jeu (52 et
    finitions) reste [PROPOSÉ] : les 18 coups réels ne sont pas appliqués ; le
    chargeur de l’accessoire lui-même n’a pas été examiné.
  - **M4A3 : inchangé.** Trouvé : « 12-round clip, 1.5 s reload » (liste
    AvPGalaxy de *Dark Descent*), « 9mm automatic with a 12-round magazine »
    (synthèse du manuel, AVP Central), « replaceable magazines » (miroir de
    wiki de fans). Aucune de ces sources n’est le manuel ni une preuve propre à
    l’accessoire ; pas d’admission sans relecture du manuel [À VÉRIFIER].
  - **F44AA : inchangé.** Trouvé : « lengthy magazine size » (Wētā Workshop),
    400 ou 450 coups selon deux sites. Rien sur un chargeur amovible ni sur
    une scène de rechargement.

## Inventaire — catalogue (113 identités, 219 identifiants)

Colonnes : alimentation et munition documentées (CSV maître ou fiche V188) ;
capacité du jeu et sa source ; modes et cadence ([PROPOSÉ], catalogue/V131) ;
transaction de rechargement et durée ([PROPOSÉ]) ; VFX : lumière de bouche,
politique d’éjection, traceur, impact ; son de tir et de cycle (indices V188
existants) ; art tenu (plaque native ou emplacement Canvas) et points
d’attache V125 ; chargeur ramassable au sol ; statut de fidélité. Les
variantes de finition (Field, Veteran, Prototype) partagent le mécanisme de leur
base par le générateur du catalogue ; pour un tube ou un barillet du lot A, elles
partagent aussi sa capacité (le chiffre historique d’une finition, p. ex. 90
cartouches, n’est pas un mécanisme). **Lot A** = armes vérifiées le 22 novembre ;
**lot B** = armes de la franchise ajoutées le 23 novembre (table régénérée ce jour).

| ID (variantes) | Modèle · rôle · lot | Alimentation (source) | Capacité jeu (source) | Modes · cadence [PROPOSÉ] | Rechargement | Bouche · éjection · traceur · impact | Audio (tir / cycle) | Art tenu · points d’attache | Chargeur au sol | Fidélité |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| weapon-001-m41a-pulse-rifle (041, 081, 121) | M41A Pulse Rifle · Rifle · **lot A** | box · 10x24 caseless (CSV maître) | 99 · [PROPOSÉ] | automatic, underbarrel-30mm-v174-contract-not-native · 7.7/s (cité : 900 c/min, source secondaire) | v167-physical-magazine-opt-in · 1.45 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | oui (V168) | identité documentée · Aliens (1986) |
| weapon-002-m41a2-pulse-rifle (042, 082, 122) | M41A2 Pulse Rifle · Rifle · **lot A** | box · 10mm caseless (to verify) (CSV maître) | 18 · [PROPOSÉ] | automatic · 3.3/s | v77-numeric-transfer · 1.5 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-003-m4a3-service-pistol (043, 083, 123) | M4A3 Service Pistol · Pistol · **lot A** | box · 9mm (verify) (CSV maître) | 35 · [PROPOSÉ] | automatic · 4.6/s | v77-numeric-transfer · 2.2 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-004-vp70-combat-pistol (044, 084, 124) | VP70 Combat Pistol · Pistol · **lot A** | box · 9mm (prop real) (CSV maître) | 52 · [PROPOSÉ] | automatic · 5.9/s | v167-physical-magazine-opt-in · 2.9 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | oui (V168) | identité secondaire [À VÉRIFIER] · Aliens (1986) |
| weapon-005-m56-smartgun (045, 085, 125) | M56 Smartgun · Heavy · **lot A** | belt · M250 caseless (variant) (CSV maître) | 69 · [PROPOSÉ] | automatic · 7.2/s | pont natif belt · 0.8 s | flash · none-caseless · smartgun-tracer · spark | weapon-smartgun | native-plaque · grip/muzzle/support/reload | non | identité documentée · Aliens (1986) |
| weapon-006-m240-incinerator-unit (046, 086, 126) | M240 Incinerator Unit · Flamethrower · **lot A** | tank · incinerator fuel (CSV maître) | 86 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 1.5 s | flame · none · flame-stream · burn | weapon-flamethrower | native-plaque · grip/muzzle/support/reload | non | identité documentée · Aliens (1986) |
| weapon-007-m37a2-pump-shotgun (047, 087, 127) | M37A2 Pump Shotgun · Shotgun · **lot A** | tube · 12ga (verify) (CSV maître) | 4 · [PROPOSÉ] | pump-single · 2.222/s | pont natif tube · 2.2 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-008-m39-submachine-gun (048, 088, 128) | M39 Submachine Gun · SMG · **lot A** | box · cased_ballistic (CSV maître) | 21 · [PROPOSÉ] | automatic · 11.1/s | v77-numeric-transfer · 2.9 s | flash · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-009-m42a-scope-rifle (049, 089, 129) | M42A Scope Rifle · Sniper · **lot A** | box · 10mm caseless (verify) (CSV maître) | 38 · [PROPOSÉ] | automatic · 12.4/s | v77-numeric-transfer · 0.8 s | flash · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien RPG / Colonial Marines |
| weapon-010-m6b-rocket-launcher (050, 090, 130) | M6B Rocket Launcher · Launcher · **lot A** | single · rocket_M6B (CSV maître) | 1 (catalogue 55) · mécanisme | single-projectile · 1.818/s | pont natif single · 1.5 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator 2 (2001) |
| weapon-011-m83-sadar (051, 091, 131) | M83 SADAR · Launcher · **lot A** | single · rocket_M83 (CSV maître) | 1 (catalogue 72) · mécanisme | single-projectile · 1.818/s | pont natif single · 2.2 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator: Extinction |
| weapon-012-m5-rpg (052, 092, 132) | M5 RPG · Launcher · **lot A** | single · rocket_M5 (CSV maître) | 1 (catalogue 89) · mécanisme | single-projectile · 1.818/s | pont natif single · 2.9 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-013-m94-impact-grenade (053, 093, 133) | M94 Impact Grenade · Grenade launcher · **lot A** | drum · impact_grenade (CSV maître) | 7 · [PROPOSÉ] | single-projectile · 3.333/s | v77-numeric-transfer · 0.8 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-014-m40-hedp-grenade (054, 094, 134) | M40 HEDP Grenade · Grenade · **lot A** | single · 30mm_HE (CSV maître) | 24 · [PROPOSÉ] | grenade · 7.9/s | v77-numeric-transfer · 1.5 s | none · none · none · explosion | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Aliens (1986) |
| weapon-015-ua-571-c-sentry-gun (055, 095, 135) | UA 571-C Sentry Gun · Sentry · **lot A** | box · sentry_caseless (CSV maître) | 41 · [PROPOSÉ] | automatic · 9.2/s | v77-numeric-transfer · 2.2 s | flash · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support | non | identité documentée · Aliens (1986) |
| weapon-016-heavy-pulse-rifle (056, 096, 136) | Heavy Pulse Rifle · Heavy · **lot A** | box · 10mm caseless (verify) (CSV maître) | 58 · [PROPOSÉ] | automatic · 10.5/s | v77-numeric-transfer · 2.9 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Dark Descent |
| weapon-017-f44aa-pulse-rifle (057, 097, 137) | F44AA Pulse Rifle · Rifle · **lot A** | box · unknown (film prop) (CSV maître) | 75 · [PROPOSÉ] | automatic · 11.8/s | v77-numeric-transfer · 0.8 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité documentée · Alien: Romulus (2024) |
| weapon-018-type-88-heavy-assault-rifle (058, 098, 138) | Type 88 Heavy Assault Rifle · Rifle | box · cased_ballistic (CSV maître) | 92 · [PROPOSÉ] | automatic · 2.1/s | v77-numeric-transfer · 1.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-019-ak-4047-pulse-rifle (059, 099, 139) | AK-4047 Pulse Rifle · Rifle | box · unknown (CSV maître) | 10 · [PROPOSÉ] | automatic · 3.4/s | v77-numeric-transfer · 2.2 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien RPG / Colonial Marines |
| weapon-020-es-4-electroshock-pistol (060, 100, 140) | ES-4 Electroshock Pistol · Pistol | cell · charge_cell (CSV maître) | 27 · [PROPOSÉ] | automatic · 4.7/s | pont natif cell · 2.9 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | native-plaque · grip/muzzle/reload | non | identité documentée · Prometheus (2012) |
| weapon-021-357-magnum-revolver (061, 101, 141) | .357 Magnum Revolver · Revolver · **lot A** | cylinder · .357 (CSV maître) | 6 (catalogue 44) · CSV « Capacité canon » | automatic · 6/s | pont natif cylinder · 0.8 s | flash · retained-until-reload · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité documentée · Alien: Isolation |
| weapon-022-bolt-gun (062, 102, 142) | Bolt Gun · Industrial | single · bolt (CSV maître) | 61 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 1.5 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité documentée · Alien: Isolation |
| weapon-023-compound-bow (063, 103, 143) | Compound Bow · Bow | single · arrow (CSV maître) | 78 · [PROPOSÉ] | automatic · 2.5/s | v77-numeric-transfer · 2.2 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-024-harpoon-gun (064, 104, 144) | Harpoon Gun · Harpoon | single · harpoon (CSV maître) | 95 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 2.9 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien (1979) |
| weapon-025-plasma-rifle (065, 105, 145) | Plasma Rifle · Energy | cell · plasma_cell (CSV maître) | 13 · [PROPOSÉ] | automatic · 11.2/s | pont natif cell · 0.8 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator (1999) |
| weapon-026-combi-stick (066, 106, 146) | Combi-Stick · Melee | none · none (CSV maître) | 30 · [PROPOSÉ] | melee · 12.5/s | none · 1.5 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle/support | non | identité documentée · Predator 2 (1990) |
| weapon-027-smart-disc (067, 107) | Smart Disc · Thrown | none · none (CSV maître) | 47 · [PROPOSÉ] | disc · 2.8/s | none · 2.2 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Predator 2 (1990) |
| weapon-028-wrist-blades (068, 108) | Wrist Blades · Melee | none · none (CSV maître) | 64 · [PROPOSÉ] | melee · 4.1/s | none · 2.9 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Predator (1987) |
| weapon-029-cutting-torch (069, 109) | Cutting Torch · Tool | tank · torch_fuel (CSV maître) | 81 · [PROPOSÉ] | torch · 5.4/s | v77-numeric-transfer · 0.8 s | flame · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien: Isolation |
| weapon-030-maintenance-jack (070, 110) | Maintenance Jack · Melee | none · none (CSV maître) | 98 · [PROPOSÉ] | melee · 6.7/s | none · 1.5 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Alien: Isolation |
| weapon-031-fire-axe (071, 111) | Fire Axe · Melee | none · none (CSV maître) | 16 · [PROPOSÉ] | melee · 8/s | none · 2.2 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle/support | non | identité secondaire [À VÉRIFIER] · Alien: Covenant (2017) |
| weapon-032-combat-knife (072, 112) | Combat Knife · Melee | none · none (CSV maître) | 33 · [PROPOSÉ] | melee · 9.3/s | none · 2.9 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator 2 (2001) |
| weapon-033-stun-baton (073, 113) | Stun Baton · Melee | cell · charge_cell (CSV maître) | 50 · [PROPOSÉ] | stun · 10.6/s | v77-numeric-transfer · 0.8 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Alien: Isolation |
| weapon-034-sonic-harpoon (074, 114) | Sonic Harpoon · Harpoon | single · sonic_bolt (CSV maître) | 67 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 1.5 s | energy · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-035-neuro-link-disruptor (075, 115) | Neuro-Link Disruptor · Energy | cell · charge_cell (CSV maître) | 84 · [PROPOSÉ] | automatic · 2.2/s | pont natif cell · 2.2 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | native-plaque · grip/muzzle/reload | non | création Tantalus · Tantalus original |
| weapon-036-ripper-acid-projector (076, 116) | Ripper Acid Projector · Chemical | tank · acid_canister (CSV maître) | 2 · [PROPOSÉ] | automatic · 3.5/s | pont natif tank · 2.9 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-037-reef-caster (077, 117) | Reef Caster · Chemical | tank · acid_canister (CSV maître) | 19 · [PROPOSÉ] | automatic · 4.8/s | pont natif tank · 0.8 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-038-foundry-nailgun (078, 118) | Foundry Nailgun · Industrial | box · nail (CSV maître) | 36 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 1.5 s | none · none · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload | non | création Tantalus · Tantalus original |
| weapon-039-cryo-lance (079, 119) | Cryo Lance · Chemical | tank · cryo_canister (CSV maître) | 53 · [PROPOSÉ] | automatic · 6.25/s | pont natif tank · 2.2 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-040-pathogen-containment-projector (080, 120) | Pathogen Containment Projector · Chemical | tank · quarantine_agent (CSV maître) | 70 · [PROPOSÉ] | automatic · 6.25/s | pont natif tank · 2.9 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-147-ocap-91-volcan | OCAP-91 Volcan · Flamethrower | tank · fuel_canister (CSV maître) | 9 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 3.1 s | flame · none · flame-stream · burn | weapon-flamethrower | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-148-type-76-auto-shotgun | Type 76 Auto Shotgun · Shotgun | box · shotgun_shell (CSV maître) | 8 · [PROPOSÉ] | semi-scatter · 2.5/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-149-m12-rpg | M12 RPG · Launcher | single · rocket_M12 (CSV maître) | 3 · [PROPOSÉ] | single-projectile · 0.6/s | v77-numeric-transfer · 3.5 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-150-l59-minigun | L59 Minigun · Heavy | belt · cased_ballistic (CSV maître) | 120 · [PROPOSÉ] | automatic · 12/s | pont natif belt · 4 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-151-lem-mp11-stormsurge | LEM MP11 Stormsurge · SMG | box · cased_ballistic (CSV maître) | 32 · [PROPOSÉ] | automatic · 8.5/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-152-type-99-incinerator | Type 99 Incinerator · Flamethrower | tank · incinerator_fuel (CSV maître) | 100 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 3 s | flame · none · flame-stream · burn | weapon-flamethrower | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-153-am-16-gruppa | AM-16 Gruppa · Rifle | box · cased_ballistic (CSV maître) | 24 · [PROPOSÉ] | burst-3 · 3.125/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-154-microburst | Microburst · Launcher | box · microgrenade (CSV maître) | 12 · [PROPOSÉ] | single-projectile · 3.2/s | v77-numeric-transfer · 3.2 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-155-rapid-responder | Rapid Responder · Shotgun | box · shotgun_shell (CSV maître) | 32 · [PROPOSÉ] | automatic · 8/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-156-type-21-tactical-shotgun | Type 21 Tactical Shotgun · Shotgun | box · shotgun_shell (CSV maître) | 8 · [PROPOSÉ] | semi-scatter · 1.8/s | v77-numeric-transfer · 2.8 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-157-kramer-short-barrel | Kramer Short-Barrel · Shotgun | box · shotgun_shell (CSV maître) | 6 · [PROPOSÉ] | semi-scatter · 1.6/s | v77-numeric-transfer · 2.6 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-158-n79-eva-laser | N79 EVA Laser · Energy | cell · energy_cell (CSV maître) | 16 · [PROPOSÉ] | automatic · 2.3/s | pont natif cell · 2.5 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | native-plaque · grip/muzzle/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-159-l33-pike | L33 Pike · Sniper | box · cased_ballistic (CSV maître) | 8 · [PROPOSÉ] | automatic · 0.75/s | v77-numeric-transfer · 3 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-160-eds-93-zadak | EDS-93 Zadak Plasma Discharger · Shotgun | cell · plasma_cell (CSV maître) | 18 · [PROPOSÉ] | automatic · 2.1/s | pont natif cell · 3.2 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-161-thunderbolt-mk2 | Thunderbolt Mk.2 Autocannon · Heavy | belt · cased_ballistic (CSV maître) | 24 · [PROPOSÉ] | automatic · 2.8/s | pont natif belt · 4 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-162-x45-bombard | X45 Bombard · Sniper | box · flechette (CSV maître) | 8 · [PROPOSÉ] | automatic · 0.85/s | v77-numeric-transfer · 3.2 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-163-svat-92-sokol | SVAT-92 Sokol · Sniper | box · cased_ballistic (CSV maître) | 26 · [PROPOSÉ] | burst-3 · 3.125/s | v77-numeric-transfer · 2.7 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-164-mark-7-mod2-cqb | Mark 7 Mod 2 CQB Pistol · Pistol | box · cased_ballistic (CSV maître) | 24 · [PROPOSÉ] | automatic · 7.5/s | v77-numeric-transfer · 1.8 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-165-m51-breaching-scattergun | M51 Breaching Scattergun · Shotgun | box · shotgun_shell (CSV maître) | 6 · [PROPOSÉ] | semi-scatter · 1.4/s | v77-numeric-transfer · 2.7 s | flash · pump-cycle · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-166-p649-hel | P.649 HEL · Energy | cell · energy_cell (CSV maître) | 6 · [PROPOSÉ] | automatic · 0.7/s | pont natif cell · 3.4 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-167-dkt-59-misha | DKT-59 Misha · Pistol | box · cased_ballistic (CSV maître) | 6 · [PROPOSÉ] | semi-scatter · 1.7/s | v77-numeric-transfer · 2.6 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-168-evi-87-zvezda | EVI-87 Zvezda Plasma Rifle · Energy | cell · plasma_cell (CSV maître) | 36 · [PROPOSÉ] | automatic · 7.8/s | pont natif cell · 2.7 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-169-ppz-49-vol | PPZ-49 Vol · SMG | box · cased_ballistic (CSV maître) | 40 · [PROPOSÉ] | automatic · 8.2/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-170-frontier-revolver | Frontier Revolver · Revolver | cylinder · cased_ballistic (CSV maître) | 6 · [PROPOSÉ] | automatic · 1.2/s | pont natif cylinder · 3.1 s | flash · retained-until-reload · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-190-type-95-combat-pistol | Type 95 Combat Pistol · ballistic | box · [À DÉFINIR] (fiche V188) | 16 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-171-x1-fireball | X1 Fireball · Launcher | box · gel_D17 (CSV maître) | 12 · [PROPOSÉ] | automatic · 1.8/s | v77-numeric-transfer · 3.3 s | flash · none · gel-arc · spark | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-172-lem-stg24-storm-rifle | LEM StG24 Storm Rifle · Rifle | box · cased_ballistic (CSV maître) | 36 · [PROPOSÉ] | automatic · 7.8/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-173-u1a2-gl-conversion | U1A2 GL Conversion · Grenade launcher | box · grenade_40mm (CSV maître) | 5 · [PROPOSÉ] | single-projectile · 1.6/s | v77-numeric-transfer · 2.8 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-174-4c2-astra | 4C2 Astra · Rifle | box · cased_ballistic (CSV maître) | 42 · [PROPOSÉ] | burst-3 · 3.125/s | v77-numeric-transfer · 2.7 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-175-2b1-vajra | 2B1 Vajra · Launcher | box · impact_grenade (CSV maître) | 7 · [PROPOSÉ] | single-projectile · 1.2/s | v77-numeric-transfer · 3.9 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-176-6a-jaipur-smg | 6A Jaipur Submachine Gun · SMG | box · flechette (CSV maître) | 44 · [PROPOSÉ] | semi-scatter · 10.5/s | v77-numeric-transfer · 2.3 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-177-8a7-dambulla-machine-pistol | 8A7 Dambulla Machine Pistol · Pistol | box · cased_ballistic (CSV maître) | 28 · [PROPOSÉ] | automatic · 9.8/s | v77-numeric-transfer · 2.1 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-194-hicks-ithaca-37-shotgun | Hicks Ithaca 37 Shotgun · Shotgun · **lot A** | tube · 12 ga shotshell (chambrage de l’arme réelle) [À VÉRIFIER] (fiche V188) | 4 · [PROPOSÉ] | pump-single · 1.5/s | pont natif tube · 2.6 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, sans plaque · Aliens (1986) |
| weapon-195-sevastopol-pump-shotgun | Sevastopol Pump Shotgun · Shotgun · **lot A** | tube · shotshell [À DÉFINIR] (fiche V188) | 4 · [PROPOSÉ] | pump-single · 1.3/s | pont natif tube · 2.8 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, sans plaque · Alien: Isolation |
| weapon-196-sevastopol-flamethrower | Sevastopol Flamethrower · Flamethrower · **lot A** | tank · fuel [À DÉFINIR] (fiche V188) | 80 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.4 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, sans plaque · Alien: Isolation |
| weapon-197-nostromo-flamethrower | Nostromo Flamethrower · Flamethrower · **lot B** | tank · fuel [À DÉFINIR] (fiche V188) | 60 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.6 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Alien (1979) |
| weapon-198-nostromo-electric-prod | Nostromo Electric Prod · Melee · **lot B** | none · none [À DÉFINIR] (fiche V188) | 1 · [PROPOSÉ] | stun · 2/s | none · 1 s | none · none · none · melee-contact | shot (historique) | canvas-placeholder `held-weapon-placeholder-prod` · grip/muzzle | non | identité citée, plaque provisoire · Alien (1979) |
| weapon-199-nostromo-laser-pistol | Nostromo Laser Pistol · Pistol · **lot B** | cell · energy cell [À DÉFINIR] (fiche V188) | 12 · [PROPOSÉ] | automatic · 2.2/s | pont natif cell · 2.2 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload | non | identité citée, plaque provisoire · Alien (1979) |
| weapon-200-vasquez-sw-model-39 | Vasquez S&W Model 39 · Pistol · **lot B** | box · 9 mm (arme réelle) [À VÉRIFIER] (fiche V188) | 8 · [PROPOSÉ] | automatic · 3.2/s | v77-numeric-transfer · 1.6 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Aliens (1986) |
| weapon-201-lacrima-99-shockrifle | Lacrima 99 Shockrifle · Rifle · **lot B** | box · solid slugs (IMFDB) — calibre [À DÉFINIR] (fiche V188) | 30 · [PROPOSÉ] | automatic · 8/s | v77-numeric-transfer · 2.1 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-202-draco-double-burner | Draco Double Burner · Flamethrower · **lot B** | tank · fuel [À DÉFINIR] (fiche V188) | 70 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.6 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-203-usm-standard-sidearm | USM Standard Sidearm · Pistol · **lot B** | box · [À DÉFINIR] (fiche V188) | 12 · [PROPOSÉ] | automatic · 3.4/s | v77-numeric-transfer · 1.7 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-204-call-zip-gun | Call Zip Gun · Pistol · **lot B** | box · [À DÉFINIR] (fiche V188) | 4 · [PROPOSÉ] | automatic · 2.4/s | v77-numeric-transfer · 1.5 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-205-christie-wrist-pistols | Christie Wrist Pistols · Pistol · **lot B** | box · [À DÉFINIR] (fiche V188) | 14 · [PROPOSÉ] | automatic · 4.6/s | v77-numeric-transfer · 1.9 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-206-vriess-collapsible-shotgun | Vriess Collapsible Shotgun · Shotgun · **lot B** | box · shotshell [À DÉFINIR] (fiche V188) | 4 · [PROPOSÉ] | semi-scatter · 1.4/s | v77-numeric-transfer · 2.4 s | flash · per-shot · none · spark | weapon-shotgun | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-207-usm-collapsible-grenade-launcher | USM Collapsible Grenade Launcher · Launcher · **lot B** | box · grenade [À DÉFINIR] (fiche V188) | 4 · [PROPOSÉ] | single-projectile · 1.2/s | v77-numeric-transfer · 3 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | canvas-placeholder `held-weapon-placeholder-launcher` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-208-okee-doke-corral-cowboy-pistol | Okee-Doke Corral Cowboy Pistol · Pistol · **lot B** | box · [À DÉFINIR] (fiche V188) | 6 · [PROPOSÉ] | automatic · 2/s | v77-numeric-transfer · 2.2 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Alien Resurrection (1997) |
| weapon-209-es-7-supernova-shockgun | ES-7 Supernova Shockgun · Shotgun · **lot B** | cell · charge [À DÉFINIR] (fiche V188) | 8 · [PROPOSÉ] | automatic · 1.6/s | pont natif cell · 2.4 s | energy · none · energy-bolt · energy-scorch | shot (historique) | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Prometheus (2012) |
| weapon-210-prometheus-flamethrower | Prometheus Flamethrower · Flamethrower · **lot B** | tank · fuel [À DÉFINIR] (fiche V188) | 60 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.5 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Prometheus (2012) |
| weapon-211-covenant-rmc-bullpup-rifle | RMC Bullpup Rifle · Rifle · **lot B** | box · [À DÉFINIR] (fiche V188) | 30 · [PROPOSÉ] | automatic · 7.5/s | v77-numeric-transfer · 2.2 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Covenant (2017) |
| weapon-212-covenant-thales-f90-sl40 | Cole Thales F90 · Rifle · **lot B** | box · 5,56 mm (arme réelle) [À VÉRIFIER] (fiche V188) | 30 · [PROPOSÉ] | automatic · 8/s | v77-numeric-transfer · 2.2 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Covenant (2017) |
| weapon-213-covenant-beretta-92fs | Beretta 92FS Brigadier · Pistol · **lot B** | box · 9x19 mm (IMFDB) (fiche V188) | 15 · [PROPOSÉ] | automatic · 3.6/s | v77-numeric-transfer · 1.7 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Alien: Covenant (2017) |
| weapon-214-covenant-remington-870-short | Faris Shortened Remington 870 · Shotgun · **lot B** | tube · shotshell (arme réelle) [À VÉRIFIER] (fiche V188) | 4 · [PROPOSÉ] | pump-single · 1.4/s | pont natif tube · 2.6 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Covenant (2017) |
| weapon-215-covenant-security-ar-15 | Covenant Security AR-15 · Rifle · **lot B** | box · [À VÉRIFIER] (fiche V188) | 30 · [PROPOSÉ] | automatic · 8.2/s | v77-numeric-transfer · 2.1 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Covenant (2017) |
| weapon-217-prodigy-bullpup-rifle | Prodigy Bullpup Rifle · Rifle · **lot B** | box · [À DÉFINIR] (fiche V188) | 40 · [PROPOSÉ] | automatic · 8.5/s | v77-numeric-transfer · 2.2 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Earth (2025) |
| weapon-218-prodigy-maxim-9-pistol | Prodigy Maxim 9 Pistol · Pistol · **lot B** | box · 9 mm (arme réelle) [À VÉRIFIER] (fiche V188) | 15 · [PROPOSÉ] | automatic · 3.4/s | v77-numeric-transfer · 1.7 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Alien: Earth (2025) |
| weapon-219-morrow-kel-tec-ksg | Morrow Kel-Tec KSG · Shotgun · **lot B** | tube · shotshell (arme réelle) [À VÉRIFIER] (fiche V188) | 7 · [PROPOSÉ] | pump-single · 1.5/s | pont natif tube · 2.8 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Earth (2025) |
| weapon-220-alien-earth-steyr-aug | Steyr AUG · Rifle · **lot B** | box · [À VÉRIFIER] (fiche V188) | 30 · [PROPOSÉ] | automatic · 8/s | v77-numeric-transfer · 2.1 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Earth (2025) |
| weapon-221-alien-earth-kriss-vector | KRISS Vector · SMG · **lot B** | box · [À VÉRIFIER] (fiche V188) | 25 · [PROPOSÉ] | automatic · 12/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-smg` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Alien: Earth (2025) |
| weapon-222-m39-u-submachine-gun | M39-U Submachine Gun · SMG · **lot B** | box · [À DÉFINIR] (fiche V188) | 48 · documenté (liste du jeu) | automatic · 11/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-smg` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens: Dark Descent |
| weapon-223-xm99a1-phased-plasma-pulse-rifle | XM99A1 Phased Plasma Pulse Rifle · Energy · **lot B** | cell · plasma [À DÉFINIR] (fiche V188) | 100 · documenté (liste du jeu) | automatic · 5/s | pont natif cell · 3 s | energy · none · energy-bolt · energy-scorch | shot (historique) | canvas-placeholder `held-weapon-placeholder-energy` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Aliens: Dark Descent |
| weapon-224-m42a3-sniper-rifle | M42A3 Sniper Rifle · Sniper · **lot B** | box · [À DÉFINIR] (fiche V188) | 5 · [PROPOSÉ] | automatic · 0.8/s | v77-numeric-transfer · 3 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-sniper` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens: Dark Descent |
| weapon-225-vp78-pistol | VP78 Pistol · Pistol · **lot B** | box · 9 mm « squash-head » (liste du jeu) (fiche V188) | 18 · [PROPOSÉ] | burst-3 · 2.6/s | v77-numeric-transfer · 1.6 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Aliens vs Predator (2010) |
| weapon-226-zx-76-shotgun | ZX-76 Shotgun · Shotgun · **lot B** | box · shotshell [À DÉFINIR] (fiche V188) | 6 · [PROPOSÉ] | semi-scatter · 1.3/s | v77-numeric-transfer · 3.2 s | flash · per-shot · none · spark | weapon-shotgun | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens vs Predator (2010) |
| weapon-227-m41a-2-pulse-rifle | M41A/2 Pulse Rifle · Rifle · **lot B** | box · [À DÉFINIR] (fiche V188) | 99 · [PROPOSÉ] | automatic · 9/s | v77-numeric-transfer · 1.8 s | flash · none-caseless · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-rifle` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Aliens vs Predator (2010) |
| weapon-228-m59-b-smartgun | M59/B Smartgun · Heavy · **lot B** | belt · [À DÉFINIR] (fiche V188) | 150 · [PROPOSÉ] | automatic · 10/s | pont natif belt · 3.6 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-heavy` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens vs Predator (2010) |
| weapon-229-m260b-flamethrower | M260B Flamethrower · Flamethrower · **lot B** | tank · fuel [À DÉFINIR] (fiche V188) | 80 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.5 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Aliens vs Predator (2010) |
| weapon-230-m42c-scoped-rifle | M42C Scoped Rifle · Sniper · **lot B** | box · [À DÉFINIR] (fiche V188) | 6 · [PROPOSÉ] | automatic · 0.9/s | v77-numeric-transfer · 2.8 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-sniper` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens vs Predator (2010) |
| weapon-231-m-4a4-pistol | M-4A4 Pistol · Pistol · **lot B** | box · balles dum-dum ou perforantes (liste du jeu) (fiche V188) | 12 · documenté (liste du jeu) | automatic · 3.4/s | v77-numeric-transfer · 1.6 s | flash · per-shot · none · spark | weapon-pistol | canvas-placeholder `held-weapon-placeholder-pistol` · grip/muzzle/reload/ejection | non | identité citée, plaque provisoire · Aliens versus Predator 2 (2001) |
| weapon-232-m-240a1-flamethrower | M-240A1 Flamethrower · Flamethrower · **lot B** | tank · fuel [À DÉFINIR] (fiche V188) | 80 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.4 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, plaque provisoire · Aliens versus Predator 2 (2001) |
| weapon-233-wy-102-sniper-rifle | WY-102 Sniper Rifle · Sniper · **lot B** | box · [À DÉFINIR] (fiche V188) | 30 · documenté (liste du jeu) | automatic · 0.9/s | v77-numeric-transfer · 2.8 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-sniper` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens versus Predator 2 (2001) |
| weapon-234-m-92-grenade-launcher | M-92 Grenade Launcher · Launcher · **lot B** | box · grenades (quatre types dans le jeu d’origine) (fiche V188) | 6 · [PROPOSÉ] | single-projectile · 1.3/s | v77-numeric-transfer · 3 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | canvas-placeholder `held-weapon-placeholder-launcher` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens versus Predator 2 (2001) |
| weapon-235-m-90-minigun | M-90 Minigun · Heavy · **lot B** | belt · [À DÉFINIR] (fiche V188) | 900 · documenté (liste du jeu) | automatic · 14/s | pont natif belt · 4 s | flash · per-shot · none · spark | shot (historique) | canvas-placeholder `held-weapon-placeholder-heavy` · grip/muzzle/support/reload/ejection | non | identité citée, plaque provisoire · Aliens versus Predator 2 (2001) |


## Inventaire — armes de la franchise absentes du catalogue

Source : index de recherche V171 (129 dossiers, `src/weapon-research-index-v171.js`,
issu de `docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv`). Une flèche
indique une promotion V188 en catalogue (sans plaque au lot A, plaque provisoire au lot B) ; « ≈ » un nom identique
à une arme existante (rapprochement à vérifier, pas une preuve).

| Œuvre | Dossiers | Statut V188 |
| --- | --- | --- |
| Alien Resurrection (1997) | Lacrima 99 Shockrifle → **weapon-201-lacrima-99-shockrifle** [P2] ; Draco Double Burner → **weapon-202-draco-double-burner** [P2] ; USM Standard Sidearm → **weapon-203-usm-standard-sidearm** [P2] ; Call Zip Gun → **weapon-204-call-zip-gun** [P2] ; Christie wrist-mounted pistols → **weapon-205-christie-wrist-pistols** [P2] ; Vriess collapsible shotgun → **weapon-206-vriess-collapsible-shotgun** [P2] ; USM collapsible grenade launcher → **weapon-207-usm-collapsible-grenade-launcher** [P2] ; Okee-Doke Corral Cowboy Pistol → **weapon-208-okee-doke-corral-cowboy-pistol** [P2] ; Lacrima 99 bayonet assembly [P2] | promotion partielle, plaque provisoire |
| Alien RPG / Colonial Marines | M56A2 Smartgun [P2] ; VP-70MA6 Pistol [P2] ; G2 Electroshock Grenade [P2] ; U4 Firebomb [P2] ; ASSO-400 Harpoon Grappling Gun [P2] | RESEARCH_ONLY |
| Alien: Covenant (2017) | RMC F903WE Assault Rifle → **weapon-211-covenant-rmc-bullpup-rifle** [P2] ; CR-553 Carbine [P2] ; M4-AR 556-45 → **weapon-215-covenant-security-ar-15** [P2] ; Beretta 92FS → **weapon-213-covenant-beretta-92fs** [P2] ; Alien Covenant emergency axe [P2] | promotion partielle, plaque provisoire |
| Alien: Earth (2025) | Unknown security carbine — Alien Earth → **weapon-217-prodigy-bullpup-rifle** [P2] | promu, plaque provisoire |
| Alien: Isolation | DV-303 Bolt Gun [P0] ; Model 37-12 Gauge Pump Action → **weapon-195-sevastopol-pump-shotgun** [P0] ; Sevastopol Flamethrower → **weapon-196-sevastopol-flamethrower** [P0] ; Molotov (Sevastopol) [P2] ; Pipe Bomb (Sevastopol) [P2] ; EMP Mine (Sevastopol) [P2] ; Flashbang (Sevastopol) [P2] | promotion partielle sans plaque |
| Aliens (1986) | U1 Grenade Launcher [P1] ; Ripley improvised M41A + M240 [P1] ; Hicks Ithaca 37 shotgun → **weapon-194-hicks-ithaca-37-shotgun** [P1] ; Vasquez service pistol → **weapon-200-vasquez-sw-model-39** [P1] | promotion partielle, plaque provisoire |
| Aliens novels | Unidentified novel security firearm [P2] | RESEARCH_ONLY |
| Aliens versus Predator 2 (2001) | M4A4 Pistol → **weapon-231-m-4a4-pistol** [P2] ; M240A1 Flamethrower → **weapon-232-m-240a1-flamethrower** [P2] ; WY-102 Sniper Rifle → **weapon-233-wy-102-sniper-rifle** [P2] ; M92 Grenade Launcher → **weapon-234-m-92-grenade-launcher** [P2] ; M90 Minigun → **weapon-235-m-90-minigun** [P2] ; Speargun (AVP2) [P2] ; Netgun (AVP2) [P2] ; Plasma Pistol (AVP2) [P2] | promotion partielle, plaque provisoire |
| Aliens versus Predator: Extinction | Predator Plasma Glaive [P2] ; Predator Plasma Scythe [P2] ; Predator Blazer [P2] ; Predator Pred-Gun [P2] ; Predator AURORA Weapon [P2] ; Predator Fireliner [P2] ; Electroshock Missile Battery [P2] ; MP9 Submachine Gun [P2] | RESEARCH_ONLY |
| Aliens vs Predator (2010) | M41A/2 Pulse Rifle (AVP2010) → **weapon-227-m41a-2-pulse-rifle** [P2] ; VP78 Pistol → **weapon-225-vp78-pistol** [P2] ; ZX-76 Shotgun → **weapon-226-zx-76-shotgun** [P2] ; M59/B Smartgun → **weapon-228-m59-b-smartgun** [P2] ; M260B Flamethrower → **weapon-229-m260b-flamethrower** [P2] ; M42C Scoped Rifle → **weapon-230-m42c-scoped-rifle** [P2] | promu, plaque provisoire |
| Aliens: Colonial Marines | M4RA Battle Rifle [P2] ; NSG 23 Assault Rifle [P2] ; MK221 Tactical Shotgun [P2] ; 88 Mod 4 Combat Pistol [P2] ; ID23 Incineration Unit [P2] ; P9 Sonic Harpoon Artillery [P2] ; XM99A Phased Plasma Pulse Rifle [P2] ; M20 Claymore Mine [P2] | RESEARCH_ONLY |
| Aliens: Colonial Marines — DLC | Hicks' Shotgun (legendary) [P2] ; Hudson's Pulse Rifle (legendary) [P2] ; Vasquez's Smartgun (legendary) [P2] ; Gorman's Pistol (legendary) [P2] ; Frost's Flamethrower (legendary) [P2] ; Ripley's M41A/M240 combo (DLC) [P2] | RESEARCH_ONLY |
| Aliens: Dark Descent | M41AE3 Heavy Pulse Rifle [P2] ; M39-U Submachine Gun → **weapon-222-m39-u-submachine-gun** [P2] ; XM99A1 Phased Plasma Pulse Rifle → **weapon-223-xm99a1-phased-plasma-pulse-rifle** [P2] ; Lacrima A20 Carbine [P2] | promotion partielle, plaque provisoire |
| Aliens: Fireteam Elite | M41A3 Burst Rifle [P1] ; L36 Halberd [P1] ; Kramer Assault Rifle [P1] ; M42A2 Scout Rifle [P1] ; Twilight V.4 DMR [P1] ; M42A3 Sniper Rifle → **weapon-224-m42a3-sniper-rifle** [P1] ; X46 Ballista Flechette Rifle [P1] ; X43 Barrage Flechette SMG [P1] ; DT-57 Medved [P1] ; Heirloom Standoff [P1] ; M37A3 Pump Shotgun [P1] ; Armat M10 Auto Pistol [P1] ; Type 78 Burst Pistol [P1] ; Kramer .50 Magnum [P1] ; Hyperdyne Twinhammer [P1] ; Type 95 Combat Pistol (≈ weapon-190-type-95-combat-pistol) [P1] ; M41E4 Heavy Pulse Rifle [P0] ; M95 Grenade Launcher [P1] | promotion partielle, plaque provisoire |
| Aliens: Fireteam Elite 2 — DLC/bonus | Ripley's Hive Exterminator Rifle [P1] ; Rain's Jackson's Star Pulse Rifle [P1] | RESEARCH_ONLY |
| Aliens: Fireteam Elite 2 — Patch 2026 | Mondo Heat 9000 [P0] | RESEARCH_ONLY |
| Aliens: Fireteam Elite 2 (2026) | L56A3 Smartgun [P0] ; M12A1 Rocket Launcher [P0] ; DB-48 Daittyo Heavy Rifle [P0] ; HNT-1 El Alamein Revolver Rifle [P0] ; BD-03 Djinn Personal Railgun [P0] ; Type 111 Directed Particle Emitter [P0] ; EDS-93 Zadak Plasma Discharger Mk.2 [P0] ; SMB-94 Zephyr Plasma Emitter [P0] ; Type 21 Tactical Shotgun Mk.2 [P0] ; BD-55 Jokkh Burst Shotgun [P1] ; Type 200 Cryo Gun [P1] ; F44AR Pulse Rifle [P1] ; BD-16 Begho [P1] | RESEARCH_ONLY |
| AliensRL | M4A5 Compact Pistol [P2] ; MK88 Combat Pistol [P2] ; M3A Submachine Gun [P2] ; M12 Beretta SMG [P2] | RESEARCH_ONLY |
| AVP (2004) | Predator Shuriken [P2] | RESEARCH_ONLY |
| AVP: Requiem (2007) | Predator Remote Mines [P2] ; Predator Plasma Pistol (Wolf) [P2] ; Predator Whip (Wolf) [P2] | RESEARCH_ONLY |
| AVP2: Primal Hunt | Energy Flechette (Primal Hunt) [P2] | RESEARCH_ONLY |
| Comics Dark Horse / Marvel | Unidentified comic marine sidearm [P2] | RESEARCH_ONLY |
| Predator (1987) | Shoulder Plasmacaster [P2] | RESEARCH_ONLY |
| Predator 2 (1990) | Predator Wristgun [P2] ; Predator Speargun [P2] ; Predator Netgun [P2] ; Predator Sword [P2] | RESEARCH_ONLY |
| Predators (2010) | Predator Axe [P2] | RESEARCH_ONLY |
| Prey (2022) | Predator Wrist Shield [P2] ; Predator Bow / Bolt Caster [P2] ; Predator Laser Discs [P2] | RESEARCH_ONLY |
| Prometheus (2012) | ES-7 Supernova Shockgun → **weapon-209-es-7-supernova-shockgun** [P2] ; Flammenwerfer 3 → **weapon-210-prometheus-flamethrower** [P2] | promu, plaque provisoire |
| The Predator (2018) | Predator Kujhad [P2] ; Predator Killer Suit [P2] | RESEARCH_ONLY |

Dossiers d’identification V170 (non achetables) :

| Dossier | Titre | Œuvre | Alimentation | Comparaison |
| --- | --- | --- | --- | --- |
| proposed-db-48-daittyo-heavy-rifle | DB-48 Daittyo Heavy Rifle | Aliens: Fireteam Elite 2 | unverified | — |
| proposed-l56a3-smartgun | L56A3 Smartgun | Aliens: Fireteam Elite 2 | belt-unverified | — |
| comparison-m41a2-afe2 | M41A2 Pulse Rifle — AFE2 appearance | Aliens: Fireteam Elite 2 | box-unverified | weapon-002-m41a2-pulse-rifle |
| proposed-hnt-1-el-alamein-revolver-rifle | HNT-1 El Alamein Revolver Rifle | Aliens: Fireteam Elite 2 | cylinder-unverified | — |
| proposed-bd-03-djinn-personal-railgun | BD-03 Djinn Personal Railgun | Aliens: Fireteam Elite 2 | charge-unverified | — |
| proposed-type-111-directed-particle-emitter | Type 111 Directed Particle Emitter | Aliens: Fireteam Elite 2 | cell-unverified | — |
| proposed-eds-93-zadak-plasma-discharger-mk-2 | EDS-93 Zadak Plasma Discharger Mk.2 | Aliens: Fireteam Elite 2 | cell-unverified | — |
| proposed-smb-94-zephyr-plasma-emitter | SMB-94 Zephyr Plasma Emitter | Aliens: Fireteam Elite 2 | cell-unverified | — |
| proposed-m12a1-rocket-launcher | M12A1 Rocket Launcher | Aliens: Fireteam Elite 2 | rocket-unverified | — |
| comparison-ocap91-afe2 | OCAP-91 Volcan — AFE2 appearance | Aliens: Fireteam Elite 2 | tank-unverified | weapon-147-ocap-91-volcan |
| proposed-type-21-tactical-shotgun-mk-2 | Type 21 Tactical Shotgun Mk.2 | Aliens: Fireteam Elite 2 | shell-unverified | — |
| comparison-x1-fireball-afe2 | X1 Fireball — AFE2 appearance | Aliens: Fireteam Elite 2 | projectile-unverified | weapon-171-x1-fireball |
| proposed-mondo-heat-9000 | Mondo Heat 9000 | Aliens: Fireteam Elite 2 — Patch 2026 | heat-and-cryo-augment-unverified | — |
| proposed-model-37-12-gauge-pump-action | Shotgun — Sevastopol | Alien: Isolation | tube-unverified | — |
| proposed-sevastopol-flamethrower | Flamethrower — Sevastopol | Alien: Isolation | tank-unverified | — |
| proposed-dv-303-bolt-gun | Bolt Gun — Sevastopol | Alien: Isolation | single-unverified | — |
| comparison-isolation-revolver | Revolver — Sevastopol | Alien: Isolation | cylinder-unverified | weapon-021-357-magnum-revolver |
| comparison-isolation-stun-baton | Stun Baton — Sevastopol | Alien: Isolation | energy-unverified | weapon-033-stun-baton |
| proposed-m41e4-heavy-pulse-rifle | M41E4 Heavy Pulse Rifle | Aliens: Fireteam Elite | unverified | — |

Médias demandés par le propriétaire, état de la couverture au 23 novembre 2026 :

| Œuvre | Au catalogue | Reste |
| --- | --- | --- |
| *Alien* (1979) | fusil-harpon (024) ; lot B : lance-flammes, aiguillon électrique, pistolet laser du Nostromo (197–199) | — |
| *Aliens* (1986, édition spéciale comprise) | M41A, M56, M240, VP70, M40, sentinelle UA 571-C, fusil de Hicks (194) ; lot B : pistolet de Vasquez (200) | lance-grenades U1 natif sous le M41A (T106) ; combinaison M41A + M240 de Ripley (T107) |
| *Alien 3* | M41A noir des commandos = `weapon-001` | armes de fortune des détenus [À DÉFINIR] |
| *Alien Resurrection* | lot B : 8 armes (201–208) | baïonnette du Lacrima 99 (accessoire, pas une arme autonome) |
| *Prometheus* | ES-4 (020) ; lot B : ES-7 Supernova (209), lance-flammes (210) | « Storm Rifle » : non recoupé [À VÉRIFIER] |
| *Alien: Covenant* | hache (031) ; lot B : 5 armes (211–215) | « CR-553 Carbine » du suivi : désignation non recoupée (peut désigner le F90) |
| *Alien: Romulus* | F44AA (017) | aucune autre arme identifiée |
| *Alien: Earth* | lot B : 5 armes (217–221) | identité du fusil bullpup de Prodigy ; porteurs du Steyr AUG et du KRISS Vector |
| *Alien: Isolation* | revolver, bolt gun, bâton, cutter, fusil et lance-flammes (195, 196) | cocktail Molotov, bombe artisanale, mine IEM, grenade aveuglante : classe « engin lancé » à créer ; page Fandom en HTTP 402 |
| *Aliens: Dark Descent* | lot B : M39-U, XM99A1, M42A3 (222–224) | Lacrima A20 Carbine (fin de page tronquée), mine GEM-80 (classe « mine » à créer) |
| *Aliens vs Predator* (2010) | lot B : 6 armes (225–230) | — (armes des marines) |
| *Aliens versus Predator 2* (2001) | M6B (010), couteau (032) ; lot B : 5 armes (231–235) | exosquelette et tourelles (véhicules, hors arsenal portatif) |
| *Aliens: Colonial Marines* (+ DLC) | M37A2, M39, M4A3, M5 | 8 + 6 dossiers : liste StrategyWiki en HTTP 403, non relue |
| *Aliens: Fireteam Elite* / *Pathogen* | 32 armes (147–177, 190) | 17 dossiers : liste StrategyWiki en HTTP 403, non relue |
| *Aliens: Fireteam Elite 2* | — | 16 dossiers (captures de pré-lancement, sources de l’éditeur non relues) |
| *Alien: Rogue Incursion* | — | une critique (AIPT) cite un fusil automatique, un fusil à pompe et un revolver **sans désignation** : rien à inscrire tant qu’un nom n’est pas sourcé |
| *Alien RPG* (Free League) | M42A, AK-4047 | 5 dossiers : page produit seulement, aucune fiche d’arme consultée |
| Comics (Dark Horse / Marvel), romans (Titan), *Colonial Marines Technical Manual* (1995) | — | aucune source au niveau de l’arme n’a été consultée ; le manuel lui-même non plus (synthèses secondaires seulement) |

Classes **exclues** de ce lot, avec la raison :

- armes des Predators (*Predator*, *AVP*, *Prey*, *Extinction*, harpon, filet et
  pistolet plasma d’*AvP2*) : la demande porte sur les armes humaines ; 34 dossiers
  restent `RESEARCH_ONLY` ;
- *AliensRL* (4 dossiers) : jeu de fans, hors franchise ;
- armes de véhicules, tourelles fixes, exosquelettes : hors arsenal portatif ;
- mines et engins posés ou lancés : aucune classe de jeu correspondante (l’action
  de grenade V130 n’est admise que pour le M40 par identifiant exact).

## Vérifications exécutées

- `node --test scripts/verify-weapon-arsenal-v188.mjs` (dans `npm run test:weapons`) :
  intégrité du catalogue (178 identifiants historiques intacts, 3 ajouts en fin),
  table source = CSV, profil pour chaque arme, politique d’alimentation (seuls les
  quatre M41A détachables), tube (pompe, rechargement interrompu), lanceur
  (capacité 1, total conservé, traînée, explosion), barillet/bande/réservoir
  (conservation à l’achèvement et à l’interruption), sauvegardes (reprise,
  alimentation falsifiée, ancienne sauvegarde), désactivation, VFX/audio/emplacement.
- `scripts/qa-arsenal-v188.mjs` (Chromium, port déclaré) : 20 armes du lot A
  tirées avec la touche F tenue et rechargées avec R dans une mission réelle,
  munitions conservées, 0 erreur de page et de console (fixtures et injections
  déclarées en tête du script).

Lot B (23 novembre 2026) :

- `node --test scripts/verify-weapon-franchise-v188.mjs` (dans `npm run test:weapons`) :
  38 entrées en fin de catalogue, numéros réservés, aucun art emprunté, registre
  à trois statuts (une capacité n’est « documentée » qu’avec sa source), textes
  FR/EN, plaque provisoire en primitives Canvas et achat par les fonctions de
  la sauvegarde, pont natif des 16 bases hors lot A (conservation à
  l’achèvement et à l’interruption), **chaque arme du lot B tirée et rechargée
  dans une mission** (munitions dépensées = tirs acceptés, rechargement
  conservatif), chargeur physique et ramassage du VP70 (A6), citation des
  900 coups/min (A9).
- `scripts/qa-arsenal-franchise-v188.mjs` (Chromium, port déclaré) : plaque
  provisoire des 38 armes dans l’armurerie, achat et dotation de la première par
  les vrais boutons, déploiement, puis 38 armes tirées (touche F tenue) et
  rechargées (R) en mission réelle, munitions conservées, 0 erreur de page et de
  console (fixtures et injections déclarées en tête du script).
- `scripts/qa-dev-tools-v188.mjs range-arsenal` : le stand de tir liste et tire
  les 20 armes du lot A et les 38 du lot B.

## Reste à faire (précis)

1. Plaques natives (images admises) des armes 194–235 : la plaque provisoire
   dessinée n’est pas un art terminé ; puis admission V121/V122.
2. Animations natives : course de pompe, ouverture du barillet, changement de
   bande, de réservoir et de cellule, chambrage de roquette (le rig V125 garde
   la pose de rechargement partagée ; les armes sans plaque n’ont pas de pose).
3. Chargeurs physiques : M4A3 et F44AA sans preuve propre au modèle (décision
   A6 ci-dessus) ; autres armes « box » inchangées. Les armes du lot B restent
   sur le transfert numérique V77 quand leur chargeur n’est pas documenté.
4. Alimentation « single » du Bolt Gun et du harpon sonique (capacité 1 =
   changement d’équilibrage), arc et fusil-harpon (réserve récupérable V131).
5. **T106 — lance-grenades U1 natif sous le M41A.** Sources réunies : Royal
   Armouries (30 mm à pompe, superposé) ; liste AvPGalaxy de *Dark Descent*
   (« U1 Grenade Launcher », à pompe, 4 coups — secondaire, valeur de jeu
   vidéo). Le contrat pur V174 existe (tube, pompe, rechargement, sauvegarde).
   Non raccordé : il faut une commande de tir secondaire (réglages des
   commandes, modifiés par un lot parallèle), un affichage du second compteur
   et une reprise de mission — à faire en un lot dédié.
6. **T107 — combinaison M41A + M240 de Ripley** : dépend du même tir secondaire
   (deux alimentations dans une arme) ; non ajoutée plutôt que livrée à moitié.
7. Modes documentés non implémentés sur les armes du lot B (colonne « à
   définir » du registre) : lance-grenades du F90 et du M41A/2, modes fusil et
   grenade du Draco, visée automatique du M59/B, quatre grenades du M-92, tir
   des deux canons du ZX-76, balles perforantes du M-4A4, coup par coup du VP78.
8. Familles reportées avec leurs sources : *Fireteam Elite* (17), *Colonial
   Marines* (14), *Fireteam Elite 2* (16), *Alien RPG* (5), engins d’*Isolation*
   (4), Lacrima A20 et GEM-80 de *Dark Descent*, *Extinction* (MP9, batterie de
   missiles), comics, romans et *Technical Manual* — voir le tableau des œuvres.
9. Sons propres à chaque arme (aujourd’hui indices partagés), sprites d’impact
   et de douilles dédiés.
10. Coop : le pont suit le second joueur, non couvert par les parcours Chromium.
11. Questions propriétaire : voir `docs/development/QUESTIONS_PROPRIETAIRE_V188.md`
    (sections arsenal des 22 et 23 novembre 2026).
