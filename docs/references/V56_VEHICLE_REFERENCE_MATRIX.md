# V56 — Matrice WEB de référence des 31 châssis de véhicules sans art

Audit daté du 22 août 2026, fondé sur les 31 entrées vehicle dont runtimeState vaut missing dans docs/ASSET_RUNTIME_INVENTORY_V55.json.

Cette matrice est un garde-fou de lore et de direction artistique. Elle ne contient ni asset officiel ni autorisation de copier un asset. Toute future image doit être un bitmap original au projet : aucune copie, trace, photobash, extraction, vectorisation ou repeinture d’un photogramme, d’une photo de prop, d’un concept art, d’une illustration de livre, d’une texture de jeu ou d’un logo.

## Statuts

- **CANON_REFERENCE** : le châssis exact, ou sa famille explicitement documentée, existe dans une œuvre Alien publiée. Une référence de famille ne suffit pas à inventer une variante.
- **PROJECT_ADAPTATION** : le châssis runtime exact n’est pas attesté, mais adapte un véhicule, objet, constructeur, faction, lieu ou concept de production documenté. Il doit rester annoncé comme adaptation.
- **PROJECT_ORIGINAL** : aucune correspondance externe fiable n’a été trouvée pour ce châssis exact. Son identité visuelle et ses marquages appartiennent au projet.

Répartition : **11 CANON_REFERENCE**, **13 PROJECT_ADAPTATION**, **7 PROJECT_ORIGINAL**.

## Contrat visuel commun obligatoire

- Vue de gameplay strictement latérale, véhicule orienté vers la droite, projection orthographique ou quasi orthographique. Lacet maximal : 8°, uniquement pour révéler une profondeur fonctionnelle. Aucun cadrage cinématique en trois-quarts, plongée, contre-plongée ou fisheye.
- Véhicule complet, non rogné, sur alpha transparent avec marge respirante. Tous les contacts reposent sur un même niveau de sol, de rail ou d’eau.
- Les ouvrants, le cockpit, les sièges et/ou l’opérateur doivent rendre l’échelle humaine évidente au zoom de jeu.
- Éclairage simple venant du haut-gauche, masses lisibles, sans décor, sol, plaque d’ombre, reflet, fumée, UI, watermark ni texte non diégétique.
- Marquages seulement s’ils sont cohérents avec l’époque et la faction. Les numéros de série doivent être nouveaux. Aucun logo copié.
- Interdiction de fusionner des familles, d’ajouter arbitrairement roues, ailes ou armes, ou de lisser le rétrofuturisme industriel en supercar/jet contemporain.

## Vue synthétique

| # | ID inventaire | Statut | Décision immédiate |
|---:|---|---|---|
| 1 | vehicle-003-m570-armored-personnel-carrier | CANON_REFERENCE, identités publiées en conflit | Bloqué : choisir M570 ATT ou M570 Series APC, jamais un hybride |
| 2 | vehicle-005-m40-ridgeway-tank | CANON_REFERENCE | Renommer Heavy Tank, équipage 2–3 |
| 3 | vehicle-006-m292-combat-buggy | CANON_REFERENCE, conflit d’identité | P0 : M292 Self-Propelled Artillery, équipage 6, jamais un buggy |
| 4 | vehicle-008-combat-power-loader | PROJECT_ADAPTATION | Variante militarisée du langage P-5000 |
| 5 | vehicle-010-ud-4b-dropship | CANON_REFERENCE | UD-4B initial, 2 + 8, non armé en standard |
| 6 | vehicle-011-ad-19cd-dropship | CANON_REFERENCE | Bloqué : choisir AD-19C ou D Bearcat |
| 7 | vehicle-012-ua-571-remote-sentry-carrier | PROJECT_ADAPTATION | UA 571-C est le canon sentry, pas le porteur |
| 8 | vehicle-013-uscss-nostromo-shuttle | CANON_REFERENCE | Renommer Narcissus, équipage standard 3 |
| 9 | vehicle-014-uscss-covenant-lander | CANON_REFERENCE | Renommer Lander One, 2 + 10 |
| 10 | vehicle-015-uscss-prometheus-rover | CANON_REFERENCE | Renommer RT Series/RT01, jusqu’à 20 passagers |
| 11 | vehicle-016-atv-survey-rover | CANON_REFERENCE | Renommer NR-9/EUV01, 2 places |
| 12 | vehicle-017-seegson-maintenance-tram | PROJECT_ADAPTATION | Conversion maintenance inspirée de Towerlink |
| 13 | vehicle-018-acheron-colony-tractor | CANON_REFERENCE | Renommer Daihotai Tractor, 5+ places |
| 14 | vehicle-019-submersible-survey-skiff | CANON_REFERENCE | Renommer EVA-7C Pressure Pod, 2 + 4 |
| 15 | vehicle-020-ceto-patrol-boat | PROJECT_ORIGINAL | Retirer la provenance licensed-continuity |
| 16 | vehicle-021-tantalus-command-skiff | PROJECT_ORIGINAL | Châssis et marques Tantalus originaux |
| 17 | vehicle-022-echo-9-recon-bike | PROJECT_ORIGINAL | Ne pas confondre avec le XT-37 |
| 18 | vehicle-023-crucible-caravan-crawler | PROJECT_ADAPTATION | Nom inspiré d’un jeu annulé, châssis original |
| 19 | vehicle-024-neuro-xeno-transport-rig | PROJECT_ORIGINAL | Continuité de projet |
| 20 | vehicle-025-uscm-assault-gunship | PROJECT_ADAPTATION | Choisir UD-4C/UD-22 ou assumer un modèle projet |
| 21 | vehicle-026-orbital-lifeboat | PROJECT_ADAPTATION | Choisir Type 337 à 5 places ou garder 12 en original |
| 22 | vehicle-027-colony-cargo-lifter | PROJECT_ADAPTATION | Choisir WY-37B ou assumer le générique projet |
| 23 | vehicle-028-weyland-yutani-executive-shuttle | PROJECT_ADAPTATION | Seule mention exacte trouvée : draft Gibson non produit |
| 24 | vehicle-029-upp-combat-aerodyne | PROJECT_ADAPTATION | Ne pas fusionner Aerodyne, Mi-220 et Accipiter |
| 25 | vehicle-030-hyperdyne-synthetic-carrier | PROJECT_ADAPTATION | Société attestée, châssis non attesté |
| 26 | vehicle-031-mining-bore-crawler | PROJECT_ORIGINAL | Châssis minier propre au projet |
| 27 | vehicle-032-atmospheric-processor-elevator | PROJECT_ADAPTATION | Infrastructure guidée, pas véhicule autonome |
| 28 | vehicle-033-maglev-personnel-car | PROJECT_ADAPTATION | Towerlink attesté, maglev non vérifié |
| 29 | vehicle-034-ice-driller | PROJECT_ORIGINAL | Le forage glaciaire AVP n’atteste pas ce véhicule |
| 30 | vehicle-035-reef-hydrofoil | PROJECT_ORIGINAL | Continuité océanique du projet |
| 31 | vehicle-036-ripper-siege-loader | PROJECT_ADAPTATION | Grammaire loader canon, Ripper propre au projet |

## Matrice détaillée

### 01 — M570 Armored Personnel Carrier

**Statut : CANON_REFERENCE, identités publiées en conflit. Art bloqué.** La continuité issue du technical manual distingue un M570 All-Terrain Transport/prime mover du M577. Le core Alien RPG emploie au contraire M570 Series APC et précise que le M577 est son modèle standard. Le nom APC actuel combiné à seats=8 hybride ces deux branches.

Sources : [Free League — Alien RPG officiel](https://freeleaguepublishing.com/games/alien/), [Xenopedia — M577 Armored Personnel Carrier](https://avp.fandom.com/wiki/M577_Armored_Personnel_Carrier), [Xenopedia — M570 All-Terrain Transport](https://avp.fandom.com/wiki/M570_All-Terrain_Transport), [Xenopedia — équipement USCM](https://avp.fandom.com/wiki/List_of_USCM_weapons_and_equipment).

- **Silhouette :** branche Series APC : coin blindé quatre roues très bas avec armement principal coulissant/escamotable ; branche ATT : prime mover/cargo distinct du M577, dont la silhouette propre doit être sécurisée avant art.
- **Proportions :** Series APC : environ 9,2 m et 13 passagers publiés ; ATT : ne pas importer dimensions/proportions M577. Les 8 places actuelles ne prouvent pas la branche Series APC.
- **Latéral/metroidvania :** profil droit orthographique, contacts sur un datum ; poste conducteur, accès/cargo, roulement et échelle humaine lisibles. Le prime mover ATT ne doit pas lire comme un second APC de combat.
- **Marquages :** stencils militaires USCM/UA sobres, numéro de coque original ; aucun nose art copié.
- **Interdits :** aucun hybride nom/capacité ATT + silhouette Series APC, aucun deuxième M577, aucun train de roulement ou armement inventé sous étiquette canon.
- **Correction requise :** choisir M570 ATT et re-sourcer sa géométrie/capacité, ou M570 Series APC à 13 passagers avec configuration d’armes non-M577 documentée, ou fusionner/supprimer le slot.

### 02 — M40 Ridgeway Tank

**Statut : CANON_REFERENCE.** Le nom complet est M40 Ridgeway Heavy Tank ; équipage publié 2–3, et non 4.

Sources : [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/), [Xenopedia — M40 Ridgeway Heavy Tank](https://avp.fandom.com/wiki/M40_Ridgeway_Heavy_Tank).

- **Silhouette :** lourd châssis chenillé, tourelle importante plutôt arrière, canon rayé de 115 mm dominant, système défensif secondaire.
- **Proportions :** environ 9,77 m ; masse large et basse, tourelle plus petite que la caisse mais nettement distincte d’un APC.
- **Latéral/metroidvania :** profil droit strict, chenilles complètes, canon presque horizontal ; train de chenille, anneau de tourelle, canon et trappe lisibles.
- **Marquages :** langage USCM/US Army, numéro tactique original.
- **Interdits :** pas de M577 à chenilles ; pas de silhouette M40-E sous le nom M40 ; pas de canon double ou railgun fantaisiste.
- **Correction requise :** renommer Heavy Tank et passer l’équipage à 2–3.

### 03 — M292 Combat Buggy

**Statut : CANON_REFERENCE avec conflit d’identité P0. Art bloqué.** M292 est une artillerie automotrice chenillée d’environ 38 tonnes, 11,1 m, équipage 6 et obusier de 158 mm, jamais un buggy. M292A2 désigne la variante avec CIWS laser.

Sources : [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/), [Xenopedia — M292 Self-Propelled Artillery](https://avp.fandom.com/wiki/M292_Self-Propelled_Artillery), [Xenopedia — USCM Corps Ordnance](https://avp.fandom.com/wiki/USCM_Corps_Ordnance).

- **Silhouette :** longue artillerie chenillée blindée dominée par un obusier de 158 mm, volume protégé pour six ; CIWS laser de toit uniquement sur A2.
- **Proportions :** environ 11,1 m/38 tonnes ; l’obusier surplombe et dépasse fortement la caisse, aucun arceau ouvert.
- **Latéral/metroidvania :** profil droit orthographique, chenille complète, canon en position de déplacement basse ; canon, train de roulement, trappes et machinerie arrière lisibles.
- **Marquages :** stencils d’unité d’artillerie USCM, numéro original ; aucun numéro de course.
- **Interdits :** buggy, moto, arceau, quatre roues légères ou seats=3 absolument interdits ; équipage canonique 6.
- **Correction requise :** renommer/redessiner en M292 Self-Propelled Artillery, équipage 6 ; n’utiliser M292A2 qu’avec son CIWS laser. Sinon donner au buggy une nouvelle désignation projet.

### 04 — Combat Power Loader

**Statut : PROJECT_ADAPTATION.** Le P-5000 Powered Work Loader est attesté ; Combat Power Loader n’est pas un nom de modèle canon stable.

Sources : [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens), [Xenopedia — P-5000 Powered Work Loader](https://avp.fandom.com/wiki/P-5000_Powered_Work_Loader), [Xenopedia — Exosuit](https://avp.fandom.com/wiki/Exosuit).

- **Silhouette :** cadre anthropomorphe ouvert à un pilote, jambes bipèdes, cage haute et longs bras hydrauliques.
- **Proportions :** pilote visible au centre ; bras plus longs/lourds que le corps ; pieds larges et stables.
- **Latéral/metroidvania :** profil droit, deux pieds sur un sol commun, bras abaissés ; pilote, cage, articulations, pinces et pieds séparés visuellement.
- **Marquages :** sécurité industrielle et retrofit USCM discret, numéros originaux.
- **Interdits :** pas d’armure humanoïde fermée, de copie ligne pour ligne du loader d’Aliens, ni de mécha anime.
- **Correction requise :** provenance adaptation ; pour un exact canon, renommer P-5000 et retirer l’armement non attesté.

### 05 — UD-4B Dropship

**Statut : CANON_REFERENCE.** Modèle de production initial Cheyenne : 8 passagers plus équipage de vol, non armé en standard, incapable de transporter un M577.

Sources : [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/), [Xenopedia — UD-4B production model](https://avp.fandom.com/wiki/UD-4B_production_model), [Xenopedia — famille UD-4 Cheyenne](https://avp.fandom.com/wiki/UD-4_%22Cheyenne%22_Dropship).

- **Silhouette :** Cheyenne compact, cockpit émoussé, nacelles hautes, fuselage court, train visible, sans canon de nez standard.
- **Proportions :** environ 24,8 m dans la référence RPG, plus court et plus propre que les variantes ultérieures ; cabine de 8 passagers.
- **Latéral/metroidvania :** profil droit posé/en vol, sans V frontal ; cockpit, porte, nacelles et train bien séparés.
- **Marquages :** livrée UA Northridge/USCM ancienne ou civile-paramilitaire documentée, code de queue original.
- **Interdits :** pas de canon de nez, d’arrays secondaires ni de soute M577 empruntés aux UD-4 plus tardifs.
- **Correction requise :** expliciter 2 membres d’équipage + 8 passagers et conserver l’identité UD-4B.

### 06 — AD-19CD Dropship

**Statut : CANON_REFERENCE, variante non résolue. Art bloqué.** La désignation correcte est AD-19C/D Bearcat VTOL Strikeship. C reçoit 2 membres d’équipage, D en reçoit 4 ; des paniers medivac optionnels pour 6 blessés ne créent pas un dropship de 12 places.

Sources : [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/), [Xenopedia — AD-19 Bearcat Strikeship](https://avp.fandom.com/wiki/AD-19_%22Bearcat%22_Strikeship), [Xenopedia — équipement USCM](https://avp.fandom.com/wiki/List_of_USCM_weapons_and_equipment).

- **Silhouette :** strikeship VTOL très compact d’environ 8,8 m, deux turbofans, nez armé court, cabine serrée.
- **Proportions :** empreinte de chasseur et non de transport ; paniers medivac clairement externes si présents.
- **Latéral/metroidvania :** profil droit posé/en vol stationnaire ; cockpit, deux fans, train, canon et éventuel panier lisibles.
- **Marquages :** unité aérienne USCM et numéro original.
- **Interdits :** aucun allongement douze places, aucune fusion C/D, aucune silhouette de Cheyenne.
- **Correction requise :** choisir AD-19C ou AD-19D, renommer VTOL Strikeship, capacité 2 ou 4 ; gérer les blessés séparément.

### 07 — UA-571 Remote Sentry Carrier

**Statut : PROJECT_ADAPTATION.** UA 571-C nomme le canon sentry sur trépied, pas un véhicule.

Sources : [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens), [Xenopedia — UA 571-C Automated Sentry Gun](https://avp.fandom.com/wiki/UA_571-C_Automated_Sentry_Gun), [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/).

- **Silhouette :** petit porteur utilitaire bas avec UA 571-C reconnaissable et détachable, trépied replié, cradle et bloc énergie/munitions.
- **Proportions :** le sentry garde l’échelle d’un équipement portable ; le porteur ne devient jamais APC ou char.
- **Latéral/metroidvania :** profil droit au sol ; mobilité, cradle, trépied et canon séparés.
- **Marquages :** logistique USCM et numéro de retrofit projet ; aucun numéro UA officiel pour le châssis.
- **Interdits :** ne pas appeler le porteur UA 571-C, transformer le sentry en tourelle de char ou l’enfermer dans une caisse.
- **Correction requise :** nom propre au porteur et provenance PROJECT_ADAPTATION.

### 08 — USCSS Nostromo Shuttle

**Statut : CANON_REFERENCE.** Le véhicule s’appelle Narcissus : lifeboat du Nostromo, Lockmart Starcub modifié, équipage standard de 3 et 2 capsules de stase.

Sources : [20th Century Studios — Alien](https://www.20thcenturystudios.com/movies/alien), [Xenopedia — Narcissus](https://avp.fandom.com/wiki/Narcissus), [Xenopedia — USCSS Nostromo](https://avp.fandom.com/wiki/USCSS_Nostromo).

- **Silhouette :** lifeboat large et aplati, cabine centrale, deux tunnels de poussée avant, quatre arrière, train tricycle repliable.
- **Proportions :** environ 21,3 × 16,2 × 7 m ; clairement large, non fuselé comme un chasseur.
- **Latéral/metroidvania :** profil droit en vol ou posé ; cockpit, volume de survie, propulseurs, interface d’amarrage et train lisibles.
- **Marquages :** Narcissus/1809-E1 recréés proprement si nécessaires, jamais tracés sur le modèle filmé.
- **Interdits :** pas de navette sept places, pas de nom USCSS Nostromo porté par la navette, pas de copie de miniature/texture.
- **Correction requise :** renommer Narcissus — Nostromo lifeboat ; sièges 3, capsules de stase 2 séparées.

### 09 — USCSS Covenant Lander

**Statut : CANON_REFERENCE.** Nom correct : Lander One, Class E Lander-Type Drop Shuttle ; 1 pilote, 1 copilote et 10 passagers.

Sources : [20th Century Studios — Alien: Covenant](https://www.20thcenturystudios.com/movies/alien-covenant), [Xenopedia — Lander One](https://avp.fandom.com/wiki/Lander_One), [Xenopedia — USCSS Covenant](https://avp.fandom.com/wiki/USCSS_Covenant).

- **Silhouette :** grand drop shuttle utilitaire, cabine large, train lourd, machinerie dorsale/latérale et accès de chargement.
- **Proportions :** environ 38 m ; volume douze personnes, nettement plus grand que Narcissus ou Bearcat.
- **Latéral/metroidvania :** profil droit posé, train complet ; cockpit, module passagers, moteurs, jambes et rampe distincts.
- **Marquages :** langage mission Covenant/Weyland-Yutani cohérent, série originale.
- **Interdits :** pas de petite navette huit places, pas de nom USCSS Covenant pour le lander, pas de gunship.
- **Correction requise :** renommer Lander One et passer à 12 au total, 2 + 10.

### 10 — USCSS Prometheus Rover

**Statut : CANON_REFERENCE.** Nom exact : RT Series Group Transport, aussi appelé Rover/RT01. Le module personnel fermé accueille jusqu’à 20 passagers plus conducteur ; une variante ouverte transporte le NR-9.

Sources : [20th Century Studios — Prometheus](https://www.20thcenturystudios.com/movies/prometheus), [Xenopedia — RT Series Group Transport](https://avp.fandom.com/wiki/RT_Series_Group_Transport), [IMCDb — prop Prometheus](https://www.imcdb.org/v521752.html).

- **Silhouette :** énorme transport fermé allongé à huit roues, quatre visibles par côté, cabine industrielle haute et extrémités émoussées.
- **Proportions :** long empattement et vaste baie de personnel dominants ; l’échelle conducteur doit le faire lire comme bus/APC lourd.
- **Latéral/metroidvania :** profil droit strict, quatre roues visibles ; vitrage conducteur, portes, baie longue et équipement de toit lisibles.
- **Marquages :** Weyland Corp d’expédition et série RT originale.
- **Interdits :** pas de SUV six places, pas de mélange variante fermée/plateau NR-9, pas de réemploi M577.
- **Correction requise :** renommer RT Series/RT01, capacité conducteur + jusqu’à 20 passagers, sélectionner fermé ou plateau.

### 11 — ATV Survey Rover

**Statut : CANON_REFERENCE.** Nom exact : NR-9 Series All Terrain Vehicle, aussi EUV01/ATV NR6 ; deux occupants dos à dos, pas quatre.

Sources : [20th Century Studios — Prometheus](https://www.20thcenturystudios.com/movies/prometheus), [Xenopedia — NR-9 Series ATV](https://avp.fandom.com/wiki/NR-9_Series_All_Terrain_Vehicle), [Xenopedia — RT Series Group Transport](https://avp.fandom.com/wiki/RT_Series_Group_Transport).

- **Silhouette :** micro-ATV ouvert avec deux occupants dos à dos, cage et quatre unités roue/ceinture tri-bogie distinctives.
- **Proportions :** environ 3,2 m ; les corps humains dominent visuellement.
- **Latéral/metroidvania :** profil droit, quatre contacts alignés ; cage, deux sièges, commandes et roulement atypique lisibles.
- **Marquages :** Weyland survey minimal, numéro original.
- **Interdits :** pas de seconde rangée, pneus ordinaires, chenilles de char ni cabine fermée.
- **Correction requise :** renommer NR-9/EUV01 et passer à 2 places.

### 12 — Seegson Maintenance Tram

**Statut : PROJECT_ADAPTATION.** Towerlink est le transport passagers en tubes pressurisés de Sevastopol ; aucun modèle exact Maintenance Tram n’a été trouvé.

Sources : [SEGA — Alien: Isolation officiel](https://alienisolation.sega.jp/), [Xenopedia — Towerlink](https://avp.fandom.com/wiki/Towerlink), [Xenopedia — Sevastopol Station](https://avp.fandom.com/wiki/Sevastopol_Station).

- **Silhouette :** voiture Towerlink courte convertie en service, bouts émoussés, accès latéral, rangements et coupleurs maintenance.
- **Proportions :** enveloppe de voiture passagers mais volume sacrifié aux outils ; jamais locomotive.
- **Latéral/metroidvania :** profil droit sur un seul guide ; cabine, portes, panneaux, coupleur et enveloppe du tube lisibles.
- **Marquages :** Seegson/Towerlink maintenance, barres de danger, numéro original.
- **Interdits :** pas de modèle canon revendiqué, pas de technologie maglev affirmée, pas de métro terrestre.
- **Correction requise :** provenance adaptation, différencier nettement du véhicule passagers et revalider 20 places.

### 13 — Acheron Colony Tractor

**Statut : CANON_REFERENCE.** Nom exact : Daihotai Tractor/Colony Tractor ; grosse machine huit roues à cabine suspendue, cinq occupants ou plus.

Sources : [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens), [Xenopedia — Daihotai Tractor](https://avp.fandom.com/wiki/Daihotai_Tractor), [Xenopedia — Hadley’s Hope](https://avp.fandom.com/wiki/Hadley%27s_Hope).

- **Silhouette :** large rover huit roues sur quatre bogies jumelés articulés, cabine centrale haute, remorquage et projecteurs.
- **Proportions :** environ 6,6 m mais très large ; cabine au-dessus/entre les bogies, cinq personnes ou plus.
- **Latéral/metroidvania :** profil droit, quatre roues visibles ; bogies, cabine étanche, porte, treuil et feux lisibles.
- **Marquages :** utilitaire colonial usé, numéro de service original.
- **Interdits :** pas de version six roues si la cible est le film, pas de tracteur agricole, pas de caisse M577.
- **Correction requise :** renommer Daihotai Tractor et passer de 3 à au moins 5 places.

### 14 — Submersible Survey Skiff

**Statut : CANON_REFERENCE.** Correspondance exacte : Weyland EVA-7C Series Pressure Pod, environ 8 m, 2 membres d’équipage + 4 passagers.

Sources : [Free League — Building Better Worlds](https://freeleaguepublishing.com/shop/alien-rpg-2/building-better-worlds/), [Xenopedia — Weyland EVA-7C Series Pressure Pod](https://avp.fandom.com/wiki/Weyland_EVA-7C_Series_Pressure_Pod).

- **Silhouette :** pod pressurisé compact et arrondi, clusters de propulseurs, pods d’airlock/stockage, manipulateurs et outils de fouille.
- **Proportions :** dense et pod-like, jamais coque longue de bateau ; volume 2 + 4.
- **Latéral/metroidvania :** profil droit immergé sans décor ; coque, contrôle, airlock, propulseurs et bras distincts.
- **Marquages :** risques/profondeur Weyland, numéro neuf.
- **Interdits :** pas de skiff ouvert, hydrofoil, kiosque de sous-marin ni torpilles.
- **Correction requise :** renommer EVA-7C Pressure Pod, conserver 6 en les détaillant 2 + 4, famille submersible si possible.

### 15 — Ceto Patrol Boat

**Statut : PROJECT_ORIGINAL.** Aucun Ceto Alien fiable ni patrol boat exact n’a été trouvé ; l’étiquette actuelle licensed-continuity est injustifiée.

Sources externes exactes : aucune.

- **Silhouette :** patrouilleur huit places bas et robuste, wheelhouse fermé, proue blindée peu profonde, défenses latérales, propulsion arrière et marche d’abordage.
- **Proportions :** bateau de travail compact, wheelhouse au tiers central, zones de pont avant/arrière lisibles.
- **Latéral/metroidvania :** profil droit sur ligne d’eau droite et alpha, sans vague ; proue, cabine, accès, rail et propulsion lisibles.
- **Marquages :** autorité maritime Ceto entièrement créée pour le projet.
- **Interdits :** aucun statut canon/licencié, aucune livrée de coast guard réelle, aucun yacht ou missile boat.
- **Correction requise :** provenance PROJECT_ORIGINAL et définition de Ceto dans le lore projet.

### 16 — Tantalus Command Skiff

**Statut : PROJECT_ORIGINAL.** Tantalus est la continuité du projet ; aucun châssis externe exact.

Sources externes exactes : aucune.

- **Silhouette :** VTOL commandement six places compact, cockpit blindé, courte cabine ops, deux unités de sustentation, patins et mât capteurs.
- **Proportions :** volume six places sans atteindre le dropship ; capteurs visuellement prioritaires sur les armes.
- **Latéral/metroidvania :** profil droit posé/en vol stationnaire ; cockpit, porte, lift units, appuis et mât lisibles.
- **Marquages :** insigne, bande de commandement et série Tantalus propres au projet.
- **Interdits :** aucune revendication USCM canon, aucun clone Cheyenne/Bearcat/Lander, aucune surcharge d’armes.
- **Correction requise :** provenance PROJECT_ORIGINAL.

### 17 — Echo-9 Recon Bike

**Statut : PROJECT_ORIGINAL.** Echo-9 est une désignation projet ; ne pas la confondre avec le XT-37 Stinger documenté.

Sources externes exactes : aucune.

- **Silhouette :** moto reconnaissance tandem deux places, carénage frontal protecteur, rack arrière, suspension longue et deux roues principales.
- **Proportions :** échelle moto imposée par les pilotes, corps étroit et long empattement.
- **Latéral/metroidvania :** profil droit, roues sur un datum, direction neutre ; sièges, commandes, suspension, roues et capteur lisibles.
- **Marquages :** bande Echo-9 et série originales.
- **Interdits :** pas de nom XT-37, antigravité, troisième roue, cabine voiture ou marque moto réelle.
- **Correction requise :** provenance PROJECT_ORIGINAL et définition Echo-9 projet.

### 18 — Crucible Caravan Crawler

**Statut : PROJECT_ADAPTATION.** Aliens: Crucible est un jeu Obsidian/SEGA annulé ; aucun Caravan Crawler n’y a été vérifié. Le nom adapte un concept de production non canon, le châssis reste original.

Sources : [Xenopedia — Aliens: Crucible](https://avp.fandom.com/wiki/Aliens%3A_Crucible), [GameSpot — confirmation de l’annulation](https://www.gamespot.com/articles/obsidian-sega-confirm-aliens-rpg-no-longer-in-development/1100-6212665/), [Unseen64 — archive de production](https://www.unseen64.net/2009/10/02/aliens-rpg-crucible-x360ps3-cancelled/).

- **Silhouette :** long crawler survie dix places, module habitable segmenté, multiples bogies bas, fret de toit et systèmes externes réparables.
- **Proportions :** longueur caravane/volume de vie dominants, basse vitesse, porte humaine et stockage lisibles.
- **Latéral/metroidvania :** profil droit, bogies alignés ; porte, cabine, joints, toit, échelle et tracks comme repères.
- **Marquages :** survivants Crucible entièrement projet, sans logo Obsidian/SEGA.
- **Interdits :** ne jamais prétendre que ce véhicule figurait dans Crucible, ne copier aucun leak/concept, ne pas en faire un M577/MBT.
- **Correction requise :** provenance adaptation non canon et mention explicite du châssis original.

### 19 — Neuro-Xeno Transport Rig

**Statut : PROJECT_ORIGINAL.** Neuro-Xeno et ce véhicule relèvent du projet.

Sources externes exactes : aucune.

- **Silhouette :** tracteur de confinement cinq places, cabine scellée, capsule spécimen centrale isolée, module arrière de survie/énergie et larges chenilles.
- **Proportions :** capsule au centre mais plus petite que l’ensemble ; cabine équipage sans volume de troop carrier.
- **Latéral/metroidvania :** profil droit, tracks et capsule complets ; porte, capsule, échelle, conduites et module arrière lisibles.
- **Marquages :** quarantaine, classe de danger, code Neuro-Xeno et série propres au projet.
- **Interdits :** aucune société canon revendiquée, aucune copie de cage d’Alien Resurrection ou autre franchise, aucun spécimen exposé.
- **Correction requise :** provenance PROJECT_ORIGINAL.

### 20 — USCM Assault Gunship

**Statut : PROJECT_ADAPTATION, modèle non résolu. Art bloqué.** Assault Gunship est un rôle générique. Des options nommées existent, dont UD-4C et UD-22 ; il faut en choisir une ou assumer un châssis projet.

Sources : [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/), [Xenopedia — UD-4 Cheyenne](https://avp.fandom.com/wiki/UD-4_%22Cheyenne%22_Dropship), [Xenopedia — équipement USCM](https://avp.fandom.com/wiki/List_of_USCM_weapons_and_equipment).

- **Silhouette :** si original, VTOL blindé compact avec cockpit, propulsion, courte cabine et hardpoints bornés ; si UD-4C, préserver la lignée Cheyenne.
- **Proportions :** armes subordonnées à l’aéronef ; huit places exigent une vraie cabine.
- **Latéral/metroidvania :** profil droit posé/en stationnaire ; cockpit, cabine, train, propulsion et armes séparés.
- **Marquages :** escadron USCM et queue originale ; désignation exacte seulement après choix.
- **Interdits :** aucun châssis inventé vendu comme canon, aucun mélange Bearcat/Cheyenne/Krokodil, aucun armement hors modèle.
- **Correction requise :** choisir un modèle et ses capacités, ou garder PROJECT_ADAPTATION.

### 21 — Orbital Lifeboat

**Statut : PROJECT_ADAPTATION, modèle non résolu.** Le Type 337 EEV d’Alien 3 est asymétrique et transporte 5 personnes, pas 12. Les 12 places imposent un lifeboat original plus grand.

Sources : [20th Century Studios — Alien 3](https://www.20thcenturystudios.com/movies/alien-3), [Xenopedia — Type 337 EEV](https://avp.fandom.com/wiki/Type_337_EEV), [Xenopedia — EEV Unit 2650](https://avp.fandom.com/wiki/EEV_Unit_2650).

- **Silhouette :** Type 337 : forme L asymétrique, volume cryotubes et collier d’amarrage ; projet 12 places : plus grand mais toujours matériel d’urgence émoussé.
- **Proportions :** Type 337 autour de 13,2 m et 5 personnes ; les 12 places doivent ajouter du volume réel.
- **Latéral/metroidvania :** profil droit spatial ; trappe, collier, volume cabine/cryo, thrusters et récupération lisibles.
- **Marquages :** secours très contrasté et unité originale.
- **Interdits :** aucun Type 337 douze places, aucune navette de luxe/chasseur, aucune symétrisation si Type 337.
- **Correction requise :** choisir Type 337/5 ou adaptation projet/12.

### 22 — Colony Cargo Lifter

**Statut : PROJECT_ADAPTATION.** Le canon proche est le WY-37B Cargo Lifter Sled. Le générique actuel ne devient exact canon qu’avec ce nom et sa structure ouverte.

Sources : [20th Century Studios — Alien: Covenant](https://www.20thcenturystudios.com/movies/alien-covenant), [Xenopedia — WY-37B cargo lifter sled](https://avp.fandom.com/wiki/WY-37B_cargo_lifter_sled), [Free League — Building Better Worlds](https://freeleaguepublishing.com/shop/alien-rpg-2/building-better-worlds/).

- **Silhouette :** vaste sled ouvert, plateforme/rampe, quatre moteurs de sustentation, petit poste opérateur et éventuelle grue/pince.
- **Proportions :** pont cargo dominant, environ 33,7 m replié ; opérateur minuscule face au fret.
- **Latéral/metroidvania :** profil droit posé/en vol, rampe explicitement ouverte ou fermée ; poste, rampe, pont, moteurs, arrimages et grue lisibles.
- **Marquages :** cargo colonial/Weyland-Yutani et numéro neuf.
- **Interdits :** pas de cabine passagers fermée, missiles, ailes de chasseur ni faux WY-37B sans sled.
- **Correction requise :** choisir WY-37B ou adaptation générique ; revalider les 3 places opérateur.

### 23 — Weyland-Yutani Executive Shuttle

**Statut : PROJECT_ADAPTATION.** Aucun châssis publié exact vérifié. La seule expression précise trouvée apparaît dans le draft Alien III de William Gibson, non produit et non canon.

Sources : [20th Century Studios — Alien 3 publié](https://www.20thcenturystudios.com/movies/alien-3), [AVP Galaxy — draft Gibson janvier 1988, non canon](https://www.avpgalaxy.net/files/scripts/alien-3-william-gibson-1988-01.pdf), [Xenopedia — Weyland-Yutani Corporation](https://avp.fandom.com/wiki/Weyland-Yutani_Corporation).

- **Silhouette :** navette corporate originale dix places, cabine exécutive fermée, nez d’amarrage, moteurs jumelés, train robuste et accès service.
- **Proportions :** volume réel dix places ; raffinement par discipline des panneaux, jamais jet privé trop fin.
- **Latéral/metroidvania :** profil droit posé/spatial ; cockpit, porte, dock, moteurs et train lisibles.
- **Marquages :** Weyland-Yutani cohérent et immatriculation originale.
- **Interdits :** ne jamais présenter le draft comme canon, inventer un modèle officiel ou copier un jet/navette externe.
- **Correction requise :** provenance adaptation avec note non canon obligatoire.

### 24 — UPP Combat Aerodyne

**Statut : PROJECT_ADAPTATION, modèle non résolu.** Aucun UPP Combat Aerodyne exact. Aerodyne désigne un gyrocar VTOL léger distinct à 5 passagers publiés ; l’UPP possède Mi-220 Krokodil et UPP-DS3 Accipiter, à ne pas fusionner.

Sources : [Free League — Colonial Marines Operations Manual](https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/), [Xenopedia — Aerodyne Light VTOL Automotive Gyrocar](https://avp.fandom.com/wiki/Aerodyne_Light_VTOL_Automotive_Gyrocar), [Xenopedia — Mi-220 Krokodil](https://avp.fandom.com/wiki/Mi-220_Krokodil_Attack_Dropship), [Xenopedia — UPP-DS3 Accipiter](https://avp.fandom.com/wiki/UPP-DS3_Accipiter).

- **Silhouette :** si Aerodyne conservé, VTOL/gyrocar compact à cabine automobile et lift units contenus ; jamais dropship complet.
- **Proportions :** environ 5,2 m et 5 passagers publiés ; seats=6 ne convient que si le champ compte un opérateur plus ces cinq passagers, sans volume Krokodil/Accipiter.
- **Latéral/metroidvania :** profil droit en stationnaire/posé ; cockpit, portes, lift units, appuis, capteurs et armes limitées lisibles.
- **Marquages :** gris/vert UPP, blocs rouges sobres, série originale.
- **Interdits :** aucune fusion Aerodyne/Mi-220/Accipiter, aucun marquage USCM, aucun statut canon sans modèle.
- **Correction requise :** sélectionner un engin UPP nommé ou garder l’adaptation projet ; documenter seats comme total occupants avant de conserver 6.

### 25 — Hyperdyne Synthetic Carrier

**Statut : PROJECT_ADAPTATION.** Hyperdyne est attestée comme société de synthétiques ; aucun carrier exact n’apparaît dans son catalogue documenté.

Sources : [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens), [Xenopedia — Hyperdyne Corporation](https://avp.fandom.com/wiki/Hyperdyne_Corporation), [Xenopedia — produits Hyperdyne](https://avp.fandom.com/wiki/Category:Hyperdyne_products).

- **Silhouette :** transport original de huit unités, racks synthétiques rectangulaires scellés, petite cabine autonome, bras service et roues/chenilles industrielles.
- **Proportions :** volume racks dominant, accès humain toujours lisible.
- **Latéral/metroidvania :** profil droit ; cabine, baies, panneau service, chargement et mobilité comme zones distinctes.
- **Marquages :** grammaire Hyperdyne et numéro flotte original, sans faux badge modèle.
- **Interdits :** aucun produit canon revendiqué, aucun M577 réemployé, aucun corps décoratif exposé.
- **Correction requise :** provenance adaptation, en précisant que seule la société est référencée.

### 26 — Mining Bore Crawler

**Statut : PROJECT_ORIGINAL.** Le minage est courant dans Alien, mais aucun Mining Bore Crawler neuf places exact n’a été localisé.

Sources externes exactes : aucune.

- **Silhouette :** long crawler bas, unique tête de forage frontale, cabine neuf personnes, multiples bogies chenillés, convoyeur de déblais et centrale arrière.
- **Proportions :** diamètre de bore important mais inférieur à la hauteur totale ; place crédible pour cabine et machinerie.
- **Latéral/metroidvania :** profil droit, tête et chenilles complètes ; foreuse, cabine, échelle, convoyeur, tracks et générateur lisibles.
- **Marquages :** consortium minier, danger et série propres au projet.
- **Interdits :** aucun faux modèle canon, aucune copie de tunnelier réel/autre franchise, aucune arme à la place du bore.
- **Correction requise :** provenance PROJECT_ORIGINAL et opérateur projet défini avant livrée.

### 27 — Atmospheric Processor Elevator

**Statut : PROJECT_ADAPTATION.** L’atmosphere processor est canon ; cette cabine trente places ne l’est pas et constitue une infrastructure guidée, non un véhicule autonome.

Sources : [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens), [Xenopedia — Atmosphere Processing Plant](https://avp.fandom.com/wiki/Atmosphere_Processing_Plant), [Xenopedia — Hadley’s Hope](https://avp.fandom.com/wiki/Hadley%27s_Hope).

- **Silhouette :** grande cage/cabine service fermée avec court segment de guide/câble, larges portes et panneaux externes.
- **Proportions :** volume trente personnes/fret, grande hauteur et portes larges ; interfaces de guide obligatoires.
- **Latéral/metroidvania :** élévation latérale orthographique, base sur datum de rail/gaine ; porte, contrôle, câble/guide, trappe et galets lisibles.
- **Marquages :** code de zone, capacité, danger industriel et numéro original.
- **Interdits :** pas de train, hovercraft, cabine volante, modèle canon inventé ou guide omis.
- **Correction requise :** reclasser infrastructure/rail cabin si le schéma le permet et passer en adaptation.

### 28 — Maglev Personnel Car

**Statut : PROJECT_ADAPTATION.** Towerlink et ses voitures sont attestés ; la propulsion maglev ne l’est pas dans les sources trouvées.

Sources : [SEGA — Alien: Isolation officiel](https://alienisolation.sega.jp/), [Xenopedia — Towerlink](https://avp.fandom.com/wiki/Towerlink), [Xenopedia — Sevastopol Station](https://avp.fandom.com/wiki/Sevastopol_Station).

- **Silhouette :** voiture tube pressurisée dix-huit places, bouts émoussés, fenêtres/portes répétées, guide et joints de pression.
- **Proportions :** long volume passagers ; interface inférieure basse et fonctionnelle.
- **Latéral/metroidvania :** profil droit sur guide unique ; portes, fenêtres, coupleur, issue de secours, interface et panneau destination lisibles.
- **Marquages :** opérateur/route et numéro de voiture originaux ; Seegson seulement si l’histoire le confirme.
- **Interdits :** aucun maglev canon affirmé, aucun doublon du tram maintenance, aucun train à grande vitesse contemporain.
- **Correction requise :** renommer Towerlink-style Personnel Car sauf nouvelle preuve ; provenance adaptation.

### 29 — Ice Driller

**Statut : PROJECT_ORIGINAL.** Aucun véhicule Alien exact à cinq places. Le forage dans la glace d’AVP n’atteste pas ce châssis.

Sources externes exactes : aucune.

- **Silhouette :** crawler polaire cinq places, foreuse/tarière chauffée avant, cabine isolée scellée, larges chenilles froid et module thermique arrière.
- **Proportions :** centre de gravité bas ; foret dominant mais inférieur à l’ensemble ; cabine crédible pour cinq.
- **Latéral/metroidvania :** profil droit, tarière et chenilles complètes ; danger foret, porte, balise, tracks, service et échangeur lisibles.
- **Marquages :** survey/minage polaire, froid et série propres au projet.
- **Interdits :** ne jamais relier ce modèle à l’expédition AVP, ne copier aucun rig réel, ne transformer la tarière en arme.
- **Correction requise :** provenance PROJECT_ORIGINAL.

### 30 — Reef Hydrofoil

**Statut : PROJECT_ORIGINAL.** Aucun Reef Hydrofoil Alien exact ; continuité océanique propre au projet.

Sources externes exactes : aucune.

- **Silhouette :** hydrofoil survey cinq places étroit, cockpit avant fermé, coque surélevée, deux struts/foils distincts, propulsion arrière et rack d’échantillons.
- **Proportions :** coque légère et longue, non patrol boat ; foil crédible à l’échelle humaine.
- **Latéral/metroidvania :** profil droit alpha, foils visibles sous une ligne d’eau droite, sans wake ; cockpit, abordage, rack, struts et moteur lisibles.
- **Marquages :** équipe reef et numéro originaux.
- **Interdits :** aucun canon revendiqué, aucune copie commerciale, aucune arme, pod profond ou yacht.
- **Correction requise :** provenance PROJECT_ORIGINAL et opérateur océanique projet défini.

### 31 — Ripper Siege Loader

**Statut : PROJECT_ADAPTATION.** Ripper/ATARAX appartient au projet. Le véhicule peut reprendre la grammaire industrielle lisible du P-5000, mais son blindage et ses outils de siège ne sont pas un modèle publié.

Sources : [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens), [Xenopedia — P-5000 Powered Work Loader](https://avp.fandom.com/wiki/P-5000_Powered_Work_Loader), [Xenopedia — Exosuit](https://avp.fandom.com/wiki/Exosuit).

- **Silhouette :** loader lourd original à un pilote protégé mais visible, jambes bipèdes industrielles, bras démolition surdimensionnés et blindage rapporté laissant lire les joints.
- **Proportions :** pilote échelle centrale ; bras/pieds portent la masse ; plaques posées sur un cadre, pas torse humanoïde.
- **Latéral/metroidvania :** profil droit planté, deux pieds au sol, outils abaissés ; cage, épaules, outils, genoux, pieds et groupe énergie lisibles.
- **Marquages :** code Ripper/ATARAX, danger et série propres au projet.
- **Interdits :** aucun variant P-5000 canon revendiqué, aucune copie de loader/exosuit officiel, aucun power armor/mécha géant.
- **Correction requise :** provenance PROJECT_ADAPTATION et affirmation explicite que Ripper, blindage, outils et marques sont originaux.

## Conflits et corrections à appliquer avant toute production d’art

### P0 — identité/lore

1. **M292 Combat Buggy est faux.** M292 est une artillerie automotrice chenillée de 11,1 m/38 tonnes, équipage 6, à obusier de 158 mm ; A2 ajoute un CIWS laser. Il faut corriger le véhicule ou renommer entièrement le buggy.
2. **M570 est ambigu face au M577.** Les sources plus anciennes distinguent M570 ATT et M577 APC ; le core Alien RPG présente M570 Series APC avec M577 comme modèle standard. Le runtime mélange APC et seats=8. Choisir ATT avec ses propres références, ou Series APC à 13 passagers/configuration non-M577, ou fusionner le slot.
3. **AD-19CD Dropship est faux.** Choisir AD-19C ou AD-19D Bearcat VTOL Strikeship ; capacité respectivement 2 ou 4, pas 12.
4. **Six noms génériques masquent un objet exact :** Nostromo Shuttle → Narcissus ; Covenant Lander → Lander One ; Prometheus Rover → RT Series Group Transport ; ATV Survey Rover → NR-9 ; Acheron Colony Tractor → Daihotai Tractor ; Submersible Survey Skiff → EVA-7C Pressure Pod.
5. **Les provenances actuelles ne sont pas fiables.** Les 31 seeds runtime héritent actuellement d’un traitement licensed-reference ; 13 doivent devenir adaptations et 7 originaux. Ceto, en particulier, ne possède pas de continuité Alien fiable malgré son étiquette licensed-continuity.

### P1 — modèle, capacité ou type

1. M40 : nom complet Heavy Tank, équipage 2–3 au lieu de 4.
2. Narcissus : 3 membres d’équipage et 2 capsules de stase, pas 7 sièges.
3. Lander One : 12 personnes au total, pas 8.
4. RT Series : jusqu’à 20 passagers plus conducteur, pas 6.
5. NR-9 : 2 places, pas 4.
6. Daihotai : au moins 5 places, pas 3.
7. UA 571-C : le numéro appartient au sentry sur trépied, pas au porteur mobile.
8. Towerlink : différencier voiture passagers et conversion maintenance ; ne pas déclarer maglev sans source.
9. USCM Assault Gunship, Orbital Lifeboat, Colony Cargo Lifter et UPP Combat Aerodyne : choisir un modèle canon précis avec sa capacité, ou conserver une adaptation explicitement originale.
10. Executive Shuttle : la mention Gibson est un draft non produit, jamais une preuve canon.
11. Atmosphere Processor Elevator : infrastructure liée à une gaine, pas véhicule autonome.

## Sources et niveau de preuve

Les pages 20th Century Studios, SEGA et Free League servent d’ancrages officiels/primaires. Les fiches Xenopedia servent d’index secondaire documenté vers les œuvres, manuels et sources de production lorsque leurs spécifications ne sont pas publiées sur une page officielle accessible. IMCDb sert seulement de contre-vérification du prop RT. Les sources GameSpot/Unseen64 et le draft Gibson servent uniquement à établir le statut annulé/non produit ; elles ne rendent aucun élément canon.

Le JSON compagnon docs/references/V56_VEHICLE_REFERENCE_MATRIX.json est la version structurée de cette matrice et porte les mêmes 31 décisions.
