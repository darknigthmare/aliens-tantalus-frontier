# Aliens (1986) — bible de production complémentaire V119

Ce document reprend les huit domaines demandés : **personnages, lieux, armes et équipements, props, véhicules, vaisseaux, terrains et planètes**. Il décrit les fichiers et les raccords présents dans cette branche, puis les manquants identifiés. Le [JSON associé](bible.json) conserve les inventaires détaillés, les placements, les identifiants, les liaisons et les références pour les prochaines passes.

La base inspectée est le commit `5ec98a99ea1bfea30159f11ab1a698b0106ae9de`, complété localement par V119. **147 PNG distincts sont présents : 123 en V116, 7 en V117, 11 en V118 et 6 en V119.** Les six nouvelles images correspondent à sept corps de mobilier existants. La simulation reste `114.0.0-rc.1`, avec le schéma de sauvegarde 114 ; V119 désigne ici la présentation. Aucun numéro de publication globale ou déploiement n’est déduit de ce suffixe.

La fidélité exacte au film reste à vérifier. Chaque nouvelle entrée conserve `filmFidelityValidated: false`. Les distances, collisions, ressources et profils d’armes du jeu sont des choix de simulation. Une image de pose unique, une carte du codex et un sélecteur de rendu ont chacun une portée différente ; les résultats effectivement obtenus et les contrôles restant à exécuter sont distingués dans le rapport QA et la PR.

## 1. État mesuré du contenu

| Domaine | Présent dans les sources | Travail encore ouvert |
| --- | --- | --- |
| Personnages | 16 profils humains ; 48 images attente / marche / interaction ; 6 variantes ; 12 images de créatures | Cycles complets, variantes liées à la chronologie, quatre poses précédemment refusées, boss royal |
| Lieux | 25 salles ; 28 fiches de lieux dont 20 reliées à une salle ; 20 liaisons / 40 seuils ; 25 portes internes | 8 fiches sans salle, raccords narratifs entre groupes, verticaux et séquences du film |
| Armes / équipements | 8 profils d’armes ; 7 images partagées entre ces profils ; 24 fiches d’équipement | Gestes et attaches spécifiques ; objets encore au catalogue ; effets détaillés |
| Props | 135 placements / 27 types ; choix raster résolu dans les deux états de collecte inspectés ; 6 images de mobilier V119 / 7 corps | Autres volumes de mobilier, interactions propres aux objets, cohérence visuelle à l’échelle du jeu |
| Véhicules | M577, P-5000 et tracteur industriel documentés ; PNG présents | Conduite, portage de charge, montée/descente et duel final |
| Vaisseaux | Intérieurs du Sulaco, cabine UD-4L, deux vues extérieures UD-4L ; fiches Narcissus / Derelict | Extérieurs reliés aux scènes, vol, transports, lieux absents |
| Terrains | 17 familles de scènes avec sols et fonds natifs | Textures dédiées, parallaxe, grandes étendues et continuité du relief |
| Planètes | LV-426 cité comme contexte des zones ; salles Gateway dans le prologue | Vue orbitale, cartes de surface et transitions ; aucun sprite planétaire dédié dans ce lot |

Les 202 solides comprennent aussi les cloisons, retours de seuils et supports. Le chiffre ne désigne donc pas 202 meubles ni 202 sprites manquants. Les 135 placements de props proviennent des exports de scènes ; la résolution de leurs sélecteurs est une inspection de code avec les états « avant collecte » et « après les collectes listées ». Elle ne constitue pas une observation exhaustive de chaque objet en jeu.

## 2. Personnages, créatures et continuité

### Profils humains

| Profil | Tenue déclarée | Rôle réellement défini | Présence |
| --- | --- | --- | --- |
| Ellen Ripley (`ripley`) | flight-blue | Ripley contrôlée | Équipe partagée / état d’inspection |
| Dwayne Hicks (`hicks`) | marine-heart | Membre mobile de l’équipe | Équipe partagée / état d’inspection |
| William Hudson (`hudson`) | marine-louise | Membre mobile de l’équipe | Équipe partagée / état d’inspection |
| Rebecca « Newt » Jorden (`newt`) | child-grey | Membre mobile de l’équipe | Équipe partagée / état d’inspection |
| Bishop (`bishop`) | synthetic-grey | PNJ immobile d’inspection | v114-sulaco-mess |
| Jenette Vasquez (`vasquez`) | smartgun-red | PNJ immobile d’inspection | v114-sulaco-armory |
| Mark Drake (`drake`) | smartgun-cap | PNJ immobile d’inspection | v114-sulaco-armory |
| Al Apone (`apone`) | marine-sergeant | PNJ immobile d’inspection | v114-sulaco-mess |
| Scott Gorman (`gorman`) | officer | PNJ immobile d’inspection | v114-sulaco-mess |
| Carter Burke (`burke`) | civilian-brown | PNJ immobile d’inspection | v114-gateway-inquiry |
| Colette Ferro (`ferro`) | pilot | PNJ immobile d’inspection | v114-dropship |
| Daniel Spunkmeyer (`spunkmeyer`) | pilot-crew | PNJ immobile d’inspection | v114-dropship |
| Cynthia Dietrich (`dietrich`) | marine-medic | PNJ immobile d’inspection | v114-sulaco-armory |
| Ricco Frost (`frost`) | marine | PNJ immobile d’inspection | v114-sulaco-cryo |
| Trevor Crowe (`crowe`) | marine | PNJ immobile d’inspection | v114-sulaco-cryo |
| Tim Wierzbowski (`wierzbowski`) | marine | PNJ immobile d’inspection | v114-sulaco-cryo |

Les seize profils possèdent chacun un PNG `idle-right`, un `walk-right` et un `interact-right`. Ripley est le seul joueur contrôlé du registre local ; Hicks, Hudson et Newt utilisent le registre d’équipe. Les douze autres personnages sont placés dans des tableaux d’inspection avec une vitesse nulle. Leur image de marche ou d’interaction est disponible au catalogue, mais leur rôle actuel ne l’exerce pas automatiquement. Les poses d’interaction du sélecteur V116 sont déclenchées par une action du joueur.

La variante `ripley-gateway` est sélectionnée dans les scènes Gateway. `bishop-damaged`, `gorman-wounded`, `newt-drain`, `ripley-hive-rescue` et `ripley-loader` sont présents au catalogue mais ne sont pas choisis par les branches de sélection examinées. Les mettre en jeu exige un état narratif ou de personnage explicite. Les PNG ne suffisent pas à attribuer une blessure, un équipement ou un rôle de combat à une autre étape.

Les silhouettes et accessoires déclarés dans la fiche de fidélité restent les intentions à vérifier : Ripley en combinaison gris-bleu ; Hicks avec son armure personnalisée et son fusil secondaire ; Hudson avec son équipement de technicien ; Newt avec Casey et sans arme ; Bishop en tenue de synthétique ; Vasquez et Drake avec leur équipement de smartgunner ; Ferro et Spunkmeyer en tenue de vol. Les détails de marquage, visages, attaches et proportions demandent une comparaison directe aux références propres à chaque tenue.

### Créatures

| Famille | Images présentes | Présence de départ | Manquant |
| --- | --- | --- | --- |
| Warrior | attente, attaque, défaite | 10 acteurs déclarés dans les salles | Marche absente après refus antérieur ; cycles complets et transitions |
| Facehugger | attente, marche | 3 acteurs déclarés | Attaque et défaite absentes après refus antérieur ; cycles complets |
| Reine | attente, marche, attaque, défaite | Aucun acteur royal défini dans les 25 salles | Boss, comportements, scène et état final à créer |
| Chestburster | attente | Aucun acteur de ce rôle défini | Émergence, mouvement, rencontres et mise en scène à développer |
| Œufs | œuf fermé, œuf ouvert, groupe d’œufs | Groupe d’œufs de la nurserie en décor | Éclosion, occupation et déclenchement à relier au gameplay |

La nurserie dispose désormais de sélections raster pour les œufs et l’ovipositeur, bien que le texte historique de `fidelity-v114.mjs` mentionne encore leur présentation procédurale. Cette bible tient compte du sélecteur V116 plus récent. Le boss de la Reine demeure absent de la simulation de cette branche.

### Règles de continuité à préserver

- **Gateway :** Aucune section armée dans la convalescence.
- **Sulaco / première descente :** Newt est rencontrée à Hadley, pas dans le réveil initial de la section.
- **Retour dans la ruche :** Ripley descend seule chercher Newt ; Hicks blessé et Bishop restent associés à l’extraction, pas compagnons tireurs dans la nurserie.
- **Sulaco final :** Hicks est blessé, Bishop endommagé ; aucun trio de Marines ne couvre le duel du loader.

**Quatre demandes restent sans fichier et n’ont pas été relancées en V119 :** `hicks-wounded`, `warrior-walk-right`, `facehugger-attack-right`, `facehugger-death-right`. Une pose statique de marche ne remplace pas un cycle complet. Aucun cycle complet d’animation ni identité visuelle 1:1 n’est certifié dans ce complément.

Sources : [modules/aliens-1986/v114/src/fidelity-v114.mjs](../../../modules/aliens-1986/v114/src/fidelity-v114.mjs) ; [modules/aliens-1986/v114/src/operation-v114.mjs](../../../modules/aliens-1986/v114/src/operation-v114.mjs) ; [modules/aliens-1986/v116/raster-renderer-v116.mjs](../../../modules/aliens-1986/v116/raster-renderer-v116.mjs).

## 3. Lieux, portes et connexions

### Les 25 salles exportées

| Identifiant | Lieu | Famille | Accès actuel |
| --- | --- | --- | --- |
| v106-hadley | Hadley’s Hope | colony | Opération locale + inspection |
| v106-medlab | Infirmerie | medical | Opération locale + inspection |
| v106-sentry | Couloir des sentinelles | sentry | Opération locale + inspection |
| v106-sulaco | Hangar du Sulaco | hangar | Inspection séparée |
| v107-operations | Operations | operations | Opération locale + inspection |
| v107-service | Relais de maintenance | service | Opération locale + inspection |
| v109-logistics | Galerie logistique | logistics | Opération locale + inspection |
| v109-reserve | Réserve technique | reserve | Opération locale + inspection |
| v112-workshop | Atelier optique | workshop | Opération locale + inspection |
| v112-conduit | Coursive des conduites | conduit | Opération locale + inspection |
| v114-gateway-medical | Gateway · chambre médicale | medical | Inspection séparée |
| v114-gateway-inquiry | Gateway · commission | gateway | Inspection séparée |
| v114-sulaco-cryo | Sulaco · cryostase | sulaco | Inspection séparée |
| v114-sulaco-mess | Sulaco · mess et briefing | sulaco | Inspection séparée |
| v114-sulaco-armory | Sulaco · préparation USCM | armory | Inspection séparée |
| v114-sulaco-cargo | Sulaco · hangar de préparation | sulaco | Inspection séparée |
| v114-dropship | UD-4L · cabine | cockpit | Inspection séparée |
| v114-apc | M577 · compartiment de commandement | cockpit | Inspection séparée |
| v114-colony-mess | Hadley · réfectoire | colony | Opération locale + inspection |
| v114-colony-drain | Hadley · puits de drainage | conduit | Opération locale + inspection |
| v114-processor-entry | Processeur · accès industriel | processor | Inspection séparée |
| v114-processor-gallery | Processeur · galerie | processor | Inspection séparée |
| v114-hive-cocoons | Processeur · cocons | hive | Inspection séparée |
| v114-queen-nursery | Nurserie · chambre de ponte | hive | Inspection séparée |
| v114-landing-pad | LV-426 · plateforme d’extraction | exterior | Inspection séparée |

La liste `OPERATION_ROOMS` contient **11 salles**. Le graphe complet forme **8 composantes** : le bloc local de Hadley (11), le hangar final du Sulaco (1), Gateway (2), le groupe de préparation du Sulaco (4), la cabine du dropship (1), l’habitacle du M577 (1), le processeur et la ruche (4), puis la plateforme d’extraction (1). Ces groupes représentent les séparations présentes dans les données. Ils ne forment pas une campagne chronologique continue.

### Liaisons existantes

| Liaison | Salle A | Salle B | Admissibilité |
| --- | --- | --- | --- |
| residential-ops | v106-hadley | v107-operations | Opération locale |
| ops-service | v107-operations | v107-service | Opération locale |
| ops-medlab | v107-operations | v106-medlab | Opération locale |
| ops-sentry | v107-operations | v106-sentry | Opération locale |
| medical-service | v107-service | v106-medlab | Opération locale |
| ops-logistics | v107-operations | v109-logistics | Opération locale |
| logistics-reserve | v109-logistics | v109-reserve | Opération locale |
| reserve-service | v109-reserve | v107-service | Opération locale |
| ops-optics | v107-operations | v112-workshop | Opération locale |
| optics-conduit | v112-workshop | v112-conduit | Opération locale |
| conduit-medical | v112-conduit | v106-medlab | Opération locale |
| gateway-inquiry | v114-gateway-medical | v114-gateway-inquiry | Inspection historique |
| sulaco-wakeup | v114-sulaco-cryo | v114-sulaco-mess | Inspection historique |
| sulaco-loadout | v114-sulaco-mess | v114-sulaco-armory | Inspection historique |
| sulaco-bay | v114-sulaco-armory | v114-sulaco-cargo | Inspection historique |
| processor-walk | v114-processor-entry | v114-processor-gallery | Inspection historique |
| processor-hive | v114-processor-gallery | v114-hive-cocoons | Inspection historique |
| hive-nursery | v114-hive-cocoons | v114-queen-nursery | Inspection historique |
| residential-mess | v106-hadley | v114-colony-mess | Opération locale |
| medical-drain | v106-medlab | v114-colony-drain | Opération locale |

Chaque liaison a deux seuils et des points d’arrivée. Les 40 entrées de vestibule décrivent leurs retours architecturaux. Les 25 portes internes restent les objets physiques de V114. Le complément mobilier ne change ni les dimensions de passage, ni les commandes, ni les points d’arrivée. Une vérification du graphe et de ses jambages doit être complétée par un parcours avec collisions, regroupement de l’équipe, retour et sauvegarde/reprise.

### Lieux encore sans salle dans le registre de fidélité

| Fiche | Séquence | Travail à réaliser |
| --- | --- | --- |
| Narcissus / récupération (`narcissus`) | prologue | Sauvetage et navette non joués. |
| Gateway · appartement / entretien (`gateway-apartment`) | prologue | Lieu absent, fiche de référence seulement. |
| Hadley · approche extérieure (`colony-exterior`) | colonie | Approche, route et crash pas encore joués. |
| Operations · plénum / attaque plafond (`ceiling`) | évacuation | Pas de niveau de plafond traversable. |
| Conduits de repli (`ducts`) | évacuation | Ne pas assimiler la coursive originale V112 à ces conduits. |
| Ascenseurs du processeur (`elevator`) | extraction | Pas encore de déplacement vertical jouable. |
| Hadley · vie des colons / famille Jorden (`jorden`) | avant la perte du signal | Séquence distincte, pas de PNJ Jorden ajoutés au repli. |
| Derelict · extérieur / chambre du pilote / œufs (`derelict`) | avant la perte du signal | Lieux absents ; pas de porte magique depuis Operations. |

Les zones présentes conservent aussi des limites de scénario : le puits de drainage ne rejoue pas la capture de Newt ; la galerie du processeur ne possède pas l’ascenseur vertical du film ; la plateforme n’ajoute pas un pilotage ou une extraction chronométrée ; le P-5000 garé reste un décor. La famille Jorden et le Derelict appartiennent à la séquence de l’édition longue. Le couloir des sentinelles garde également cette provenance.

Sources : [modules/aliens-1986/v114/src/operation-scenes-v114.mjs](../../../modules/aliens-1986/v114/src/operation-scenes-v114.mjs) et ses imports V112/V109/V107 ; [modules/aliens-1986/v114/src/fidelity-v114.mjs](../../../modules/aliens-1986/v114/src/fidelity-v114.mjs).

## 4. Armes, équipement et gestes

### Huit profils d’armes

| Profil | Image sélectionnée | Accès actuel | Ressource de simulation |
| --- | --- | --- | --- |
| pulse — M41A · fusil à impulsion | m41a-pulse-rifle | Opération locale / essai armurerie | pulse |
| shotgun — Fusil à pompe · Hicks | hicks-shotgun | Opération locale / essai armurerie | shells |
| flame — M240 · incinerator | m240-incinerator | Opération locale / essai armurerie | fuel |
| smartgun — M56 · smartgun | m56-smartgun | Essai armurerie en inspection | belt |
| pistol — Pistolet USCM | vp70-pistol | Essai armurerie en inspection | pistol |
| launcher — M41A · lance-grenades | m41a-pulse-rifle | Opération locale / essai armurerie | rounds |
| grenade — Grenade USCM | m40-grenade | Essai armurerie en inspection | grenades |
| knife — Couteau de service | combat-knife | Essai armurerie en inspection | Aucune munition |

Le M41A et son lance-grenades partagent la même image d’arme dans V116. Les portées, temps de récupération, dégâts et capacités conservés dans le JSON sont les valeurs d’équilibrage du projet. Le fusil à pompe est attribuable à Hicks ; la caisse de maintenance peut donner le M240 et des munitions de lance-grenades à Ripley. Le râtelier d’essai du Sulaco accorde les autres profils en mode inspection. La fiche historique du lance-grenades le décrit encore comme un essai d’armurerie ; la caisse `service-incinerator` prouve son accès supplémentaire dans l’opération locale.

### Images présentes sans geste ou fonction graphique dédié

| Image / équipement | Fonction actuelle | Raccord encore nécessaire |
| --- | --- | --- |
| `welder` — Soudeur | O / U / J : gestes de génie existants | Sprite isolé sans raccord spécifique au geste |
| `beacon` — Balise lumineuse | P : charges, lancer et lumière existants | Balise déployée dessinée par la couche native ; PNG isolé non utilisé |
| `door-frame` — Cadre de porte | Portes internes et sas physiques existants | Montants natifs conservés ; PNG isolé sans liaison dédiée |
| `bishop-uplink` — Terminal de Bishop | Fiche d’équipement | Pas de commande de liaison distante ni placement dédié du PNG |
| `locator-receiver` — Récepteur de localisation | Fiche de localisation | Pas de système de recherche associé |
| `locator-wrist` — Bracelet de localisation | Fiche de localisation | Pas de système de recherche associé |
| `m314-tracker` — Détecteur M314 | T : impulsion réelle dans la simulation | Interface native ; PNG de l’appareil non attaché à la main |
| `shoulder-lamp` — Lampe d’épaule | L : faisceau et consommation / visibilité natifs | PNG isolé non monté sur un rig dédié |
| `helmet-camera` — Caméra de casque | Décor / fiche | Pas de flux vidéo réel |
| `comms` — Radio de section | Ordres locaux G / H / C / X / N | PNG radio isolé non attaché à un geste |
| `medical-kit` — Matériel de soins | I : soins locaux | Caisse médicale raster et soins existants ; kit isolé non attaché à l’acteur |
| `smartgun-harness` — Harnais M56 | Apparence des smartgunners | Pas de pièce articulée indépendante montée au renderer |
| `smartgun-eyepiece` — Oculaire M56 | Apparence des smartgunners | Pas de pièce indépendante montée au renderer |
| `uscm-armor` — Armure USCM | Apparence des acteurs | Pas de système d’équipement modulaire ajouté par ce lot |
| `uscm-helmet` — Casque USCM | Apparence des acteurs | Pas de système d’équipement modulaire ajouté par ce lot |
| `casey-head` — Tête de Casey | Identité de Newt dans la fiche | Objet isolé sans geste de portage dédié |
| `ripley-m41a-m240-combination-right` — Assemblage M41A / M240 | Image de catalogue | Pas de sélection automatique de cette combinaison dans le renderer V116 |

Les 24 fiches du registre `EQUIPMENT` sont préservées dans le JSON. Leurs statuts historiques sont conservés comme données de provenance ; les colonnes ci-dessus décrivent les raccords constatés dans les sélecteurs actuels. Les effets de tir, trajectoires, flammes, explosions, faisceaux et traces restent ceux de la présentation native. Aucun pack complet de VFX animés ou de projectiles raster nouveaux n’est ajouté en V119.

La sentinelle dispose de **sept directions raster** à partir de quatre images de base et de leurs miroirs. La direction strictement frontale conserve le dessin natif. La demande `sentry-aim-front` a été refusée lors de V118 et n’a pas été relancée ici. Les secteurs de 45° et l’interpolation de l’orientation ne forment pas un cycle d’animation intermédiaire dessiné image par image.

Sources : [modules/aliens-1986/v114/src/arsenal-v114.mjs](../../../modules/aliens-1986/v114/src/arsenal-v114.mjs) ; [modules/aliens-1986/v116/raster-renderer-v116.mjs](../../../modules/aliens-1986/v116/raster-renderer-v116.mjs) ; [modules/aliens-1986/v118/raster-props-v118.mjs](../../../modules/aliens-1986/v118/raster-props-v118.mjs).

## 5. Props et mobilier

### Types de props présents

| Type | Placements déclarés | Exemples de salles |
| --- | --- | --- |
| alarm | 1 | v109-reserve |
| ammo-case | 1 | v114-apc |
| armament-case | 1 | v107-service |
| armor-rack | 1 | v114-sulaco-armory |
| beacon-case | 1 | v112-workshop |
| cargo | 1 | v114-sulaco-cargo |
| cocoon | 2 | v114-hive-cocoons |
| console | 34 | v106-hadley, v106-medlab, v106-sentry, v106-sulaco, v107-operations, v107-service, v109-logistics, v109-reserve, v112-workshop, v112-conduit, v114-gateway-medical, v114-g |
| crate | 4 | v106-sentry, v107-operations, v107-service, v109-logistics |
| cryo | 3 | v114-sulaco-cryo |
| display | 3 | v114-gateway-inquiry, v114-dropship, v114-apc |
| eggs | 1 | v114-queen-nursery |
| grate | 2 | v114-colony-drain, v114-processor-gallery |
| gun-rack | 1 | v114-sulaco-armory |
| knife | 1 | v114-sulaco-mess |
| lamp | 46 | v106-hadley, v106-medlab, v106-sentry, v106-sulaco, v107-operations, v107-service, v109-logistics, v109-reserve, v112-workshop, v112-conduit, v114-gateway-medical, v114-g |
| loader | 2 | v106-sulaco, v114-sulaco-cargo |
| meal | 3 | v114-sulaco-mess, v114-colony-mess |
| ovipositor | 1 | v114-queen-nursery |
| photo | 1 | v114-gateway-medical |
| pillow | 1 | v114-gateway-medical |
| pipe | 15 | v106-hadley, v107-operations, v107-service, v109-logistics, v109-reserve, v112-workshop, v112-conduit, v114-colony-drain, v114-processor-entry, v114-processor-gallery |
| resin | 2 | v114-hive-cocoons, v114-queen-nursery |
| smartgun | 1 | v114-sulaco-armory |
| supply | 3 | v109-logistics, v109-reserve |
| tank | 2 | v106-medlab |
| tug | 1 | v109-logistics |

Le JSON conserve chacun des 135 placements avec `roomId`, `id`, coordonnées, support, élévation et sélections avant/après collecte. Les états des caisses vides ou garnies réutilisent les manifestes V117/V118. Les accessoires de table restent des objets distincts de leurs supports : cette séparation permet de contrôler leur position et leur ordre d’affichage.

### Six nouvelles images et sept corps V119

| Image | Salle / corps | Largeur × profondeur × hauteur | Enveloppe projetée |
| --- | --- | --- | --- |
| medlab-bed | v106-medlab / bed-west | 160 × 74 × 42 | 160 × 105.64 |
| medlab-bed | v106-medlab / bed-east | 145 × 82 × 42 | 145 × 112.52 |
| medlab-storage-cabinet | v106-medlab / med-cabinet | 94 × 83 × 124 | 94 × 195.38 |
| reserve-service-locker | v109-reserve / service-locker | 110 × 91 × 128 | 110 × 206.26 |
| operations-storage-rack | v107-operations / ops-rack | 133 × 75 × 126 | 133 × 190.5 |
| sulaco-mess-table | v114-sulaco-mess / v114-sulaco-mess-body-0 | 238 × 85 × 49 | 238 × 122.1 |
| operations-command-table | v107-operations / ops-table | 238 × 93 × 49 | 238 × 128.98 |

La même image de lit est réutilisée sur `bed-west` et `bed-east`, avec une échelle uniforme adaptée à chacun. Le cabinet médical reste associé à son identifiant précis ; son matériau médical commun avec les lits ne suffit pas à autoriser une substitution. Les supports et les collisions gardent leurs dimensions existantes. Les images disposent d’un pivot mesuré au sol ; leur profondeur visible demeure une interprétation à contrôler dans le rendu.

Les trois accessoires ciblés sur les tables sont le plateau-repas et le couteau du mess, puis le terminal d’Operations. La couche V119 les diffère jusqu’au dessin de leur support afin que le plateau de table ne les masque pas. Les identifiants, coordonnées et élévations demeurent ceux des scènes. Le chargement incomplet conserve un repli vers le renderer précédent. Les autres corps, murs et supports continuent d’utiliser leur présentation native.

Les PNG de rangement reprennent les matières et l’éclairage de la console V115. Le lit et les tables restent des adaptations liées aux besoins des scènes, à comparer aux sources de production. L’enveloppe projetée est calculée à partir de la géométrie du jeu : elle n’établit pas les cotes d’un accessoire de tournage.

Source : [modules/aliens-1986/v119/raster-furniture-v119.mjs](../../../modules/aliens-1986/v119/raster-furniture-v119.mjs) ; manifestes [V116](../aliens-1986-sprites-v116/manifest.json), [V117](../aliens-1986-sprites-v117/manifest.json), [V118](../aliens-1986-sprites-v118/manifest.json) et [V119](manifest.json).

## 6. Véhicules

| Véhicule | Fichiers et représentation | Manquants |
| --- | --- | --- |
| M577 APC | m577-apc-right ; v114-apc | conduite; sortie et entrée continues; extérieur du PNG relié à une scène de véhicule |
| Power Loader P-5000 | p5000-right ; v114-sulaco-cargo, v106-sulaco | montée du pilote; pinces et marche contrôlables; duel de la Reine; sas final |
| Tracteur industriel | industrial-tug ; v109-logistics | conduite; chargement / remorque; référence de modèle film identifiée précisément |

Le M577 possède une salle de commandement inspectable et une image extérieure de catalogue. Cette image ne fournit pas encore la conduite. Les props `loader` et `tug` disposent de sélections raster ; leur présence visuelle ne rend pas le P-5000 ou le tracteur pilotable. Le duel final, les gestes de prise, les transitions de cabine et les interactions de fret nécessitent leur propre réalisation.

## 7. Vaisseaux

| Vaisseau | Représentation actuelle | Manquants |
| --- | --- | --- |
| USS Sulaco | Aucun PNG extérieur dédié ; v114-sulaco-cryo, v114-sulaco-mess, v114-sulaco-armory, v114-sulaco-cargo, v106-sulaco | silhouette extérieure; géographie complète des ponts; transport vers LV-426; final jouable relié à la campagne |
| UD-4L dropship | ud4l-flight-right, ud4l-landed-right ; v114-dropship | vol; passage cabine / baie / débarquement; crash; extraction pilotée |
| Narcissus | Aucun PNG extérieur dédié ; aucune salle | extérieur; intérieur; récupération du prologue |
| Vaisseau Derelict | Aucun PNG extérieur dédié ; aucune salle | extérieur; chambre du pilote; soute à œufs; parcours de la famille Jorden |

Le Sulaco possède un groupe de préparation de quatre salles et un hangar final séparé. Le transport vers LV-426 doit être représenté par un déroulé de mission et des transitions de véhicule appropriés. Les raccords actuellement absents ne doivent pas être remplacés par des portes traversables entre vaisseau, surface et station. Les deux images extérieures du UD-4L sont au catalogue ; la cabine inspectable utilise ses propres moniteurs et consoles.

## 8. Terrains, sols et parallaxe

| Famille | Intention de surface | Salles |
| --- | --- | --- |
| colony | Dalles et couloirs de la colonie | v106-hadley, v114-colony-mess |
| medical | Surfaces de laboratoire et chambre médicale | v106-medlab, v114-gateway-medical |
| sentry | Couloir de défense | v106-sentry |
| hangar | Pont du hangar final | v106-sulaco |
| operations | Sol et panneaux d’Operations | v107-operations |
| service | Relais et maintenance | v107-service |
| logistics | Galerie et quai logistique | v109-logistics |
| reserve | Réserve et stockage | v109-reserve |
| workshop | Atelier optique | v112-workshop |
| conduit | Coursive et drainage | v112-conduit, v114-colony-drain |
| gateway | Chambre de commission Gateway | v114-gateway-inquiry |
| sulaco | Intérieurs du Sulaco | v114-sulaco-cryo, v114-sulaco-mess, v114-sulaco-cargo |
| armory | Préparation des armes | v114-sulaco-armory |
| cockpit | Intérieurs de véhicules | v114-dropship, v114-apc |
| processor | Galeries du processeur | v114-processor-entry, v114-processor-gallery |
| hive | Ruche et nurserie | v114-hive-cocoons, v114-queen-nursery |
| exterior | Plateforme d’extraction et horizon LV-426 | v114-landing-pad |

Ces familles sont les clés effectives des scènes, et non un inventaire de biomes planétaires complets. Les sols, les murs de fond, les réseaux de conduites et les horizons gardent leurs rendus procéduraux. Le lot V119 apporte du mobilier ; aucun atlas de terrain ou fond de parallaxe indépendant n’y est ajouté.

Pour chaque future texture, conserver la projection et l’échelle de collision, identifier les bords qui doivent se raccorder, tester les répétitions dans les deux axes, puis contrôler le déplacement de caméra et la lisibilité des seuils. Les props déjà générés peuvent enrichir ces surfaces seulement lorsque leur support architectural est défini. Les extérieurs de Hadley, la route du processeur, le relief autour du Derelict et les transitions de plateforme restent des chantiers distincts.

## 9. Planètes et contexte céleste

| Entrée | Présence réelle | À compléter |
| --- | --- | --- |
| LV-426 / Acheron | named-setting-with-local-rooms | vue orbitale dédiée; relief extérieur raccordé; carte de surface documentée; transition orbite / descente / colonie |
| Terre / contexte de Gateway | gateway-room-inspection-only-no-planet-simulation | fiche céleste sourcée distincte de la station; vue extérieure Terre / Gateway; transition du prologue |

LV-426 / Acheron est une lune dans le contexte de l’œuvre. Les salles de colonie et la plateforme d’extraction fournissent une représentation locale. Le registre ne contient aucun sprite de globe, carte orbitale ou simulation de surface planétaire dédié. Les salles Gateway constituent le prologue inspectable ; leur présence ne fournit pas une Terre parcourable. Le champ « planètes » de la bible sert à ranger ce contexte sans inventer un autre monde.

## 10. Manquants et ordre de reprise

Les points suivants s’appuient sur les sources inspectées. Ils ne constituent pas une liste exhaustive de tous les éléments visibles dans chaque plan du film.

1. **Valider le mobilier V119 en contexte.** Comparer les sept placements, les pieds, les marges, les tailles apparentes et les trois accessoires de table ; vérifier les cas de chargement et d’occlusion.
2. **Relier les images d’équipement encore isolées.** Commencer par le soudeur, les balises déployées et les montants, en conservant leurs gestes, durées et volumes existants ; traiter ensuite les attaches des autres appareils.
3. **Compléter les états des acteurs.** Créer des cycles cohérents et relier les variantes narratives aux étapes correspondantes. Conserver le suivi distinct des quatre poses refusées et de la vue frontale de sentinelle.
4. **Construire la continuité des lieux.** Développer les huit fiches sans salle, la verticalité du processeur et les transports entre composantes ; vérifier physiquement chaque arrivée, retour et reprise.
5. **Développer les véhicules et le final.** Ajouter le comportement du P-5000, le boss royal, l’extraction, la conduite et le vol comme fonctionnalités dédiées.
6. **Produire les terrains et extérieurs.** Définir les références, couches et raccords avant d’ajouter les textures et panoramas.

### Récupération des anciens fichiers

Le suivi historique conserve **20 PNG**, **53 documents locaux** et **19 anciennes sources de poses** non récupérés. Les catégories peuvent se recouper ; aucun total additionné n’est publié ici. Les nouvelles générations de V117 et V118 répondent à certains besoins visuels mais ne restituent pas les octets des anciens fichiers. Leur présence ne permet pas de fermer une ligne de récupération historique.

## 11. Sources, provenance et vérification

### Sources de code

- [modules/aliens-1986/v114/src/fidelity-v114.mjs](../../../modules/aliens-1986/v114/src/fidelity-v114.mjs)
- [modules/aliens-1986/v114/src/operation-scenes-v114.mjs](../../../modules/aliens-1986/v114/src/operation-scenes-v114.mjs)
- [modules/aliens-1986/v114/src/operation-scenes-v112.mjs](../../../modules/aliens-1986/v114/src/operation-scenes-v112.mjs)
- [modules/aliens-1986/v114/src/operation-scenes-v109.mjs](../../../modules/aliens-1986/v114/src/operation-scenes-v109.mjs)
- [modules/aliens-1986/v114/src/operation-scenes-v107.mjs](../../../modules/aliens-1986/v114/src/operation-scenes-v107.mjs)
- [modules/aliens-1986/v114/src/operation-v114.mjs](../../../modules/aliens-1986/v114/src/operation-v114.mjs)
- [modules/aliens-1986/v114/src/arsenal-v114.mjs](../../../modules/aliens-1986/v114/src/arsenal-v114.mjs)
- [modules/aliens-1986/v114/preview/renderer.mjs](../../../modules/aliens-1986/v114/preview/renderer.mjs)
- [modules/aliens-1986/v114/preview/film-renderer-v114.mjs](../../../modules/aliens-1986/v114/preview/film-renderer-v114.mjs)
- [modules/aliens-1986/v116/raster-renderer-v116.mjs](../../../modules/aliens-1986/v116/raster-renderer-v116.mjs)
- [modules/aliens-1986/v118/raster-props-v118.mjs](../../../modules/aliens-1986/v118/raster-props-v118.mjs)
- [modules/aliens-1986/v119/raster-furniture-v119.mjs](../../../modules/aliens-1986/v119/raster-furniture-v119.mjs)

Les manifestes précédents sont conservés. Le JSON de cette bible contient les empreintes des sources examinées, les 147 entrées d’images, les 25 scènes et tous leurs placements. Les valeurs de dimensions sont celles du jeu. Les identifiants d’acteurs, de portes, de pièces et de supports permettent de poursuivre le chantier sans renommer le contenu historique.

### Références visuelles et franchise

Les [références V116](../aliens-1986-sprites-v116/references.md), [V117](../aliens-1986-sprites-v117/references.md) et [V118](../aliens-1986-sprites-v118/references.md) précisent l’usage des accessoires de production, répliques, figurines sous licence et images déjà générées. Les références de figurines restent des sources secondaires de silhouette.

- [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens) — film, personnages et contexte.
- [Propstore — M41A Pulse Rifle (Aliens)](https://propstore.com/product/aliens-1986/m41a-pulse-rifle/) — silhouette et finition de l’accessoire original.
- [Propstore — Ripley screen-matched flamethrower](https://propstore.com/product/aliens-1986/ellen-ripleys-sigourney-weaver-screen-matched-practical-special-effects-colonial-marine-flamethrower-unit/) — M240, emploi et assemblage avec le M41A.
- [Propstore — M56 Smartgun](https://propstore.com/product/aliens-1986/lot-9-m56-smartgun/) — Vasquez/Drake et harnais articulé.
- [NECA — Aliens Series 1](https://store.necaonline.com/blogs/news/first-look-aliens-series-1-action-figures-in-packaging) — référence secondaire sous licence : Hicks/Hudson, shotgun, tracker, lampe et soudeur.
- [Propstore — Hudson USCM webbing](https://propstore.com/product/aliens-1986/private-hudsons-bill-paxton-uscm-webbing/) — ceinture et sangles d’un accessoire de production.
- [Propstore — Apone screen-matched armour](https://propstore.com/product/aliens-1986/sergeant-apones-al-matthews-screen-matched-u-s-colonial-marines-armor-costume/) — armure, construction et marquages.
- [Propstore — Vasquez smartgun eyepiece](https://propstore.com/product/aliens-1986/lot-7-pvt-vasquezs-jenette-goldstein-screen-matched-m56-smartgun-eye-piece/) — oculaire distinct pour les smartgunners.
- [NECA — 1986 Warrior](https://store.necaonline.com/blogs/news/shipping-now-aliens-1-4-scale-xenomorph-warrior-action-figure) — référence licenciée : silhouette striée et reflets bleus du Warrior.
- [Propstore — Ron Cobb Medlab concept](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-medlab-concept-sketch/) — vocabulaire de construction du Medlab ; concept de production, distances du jeu adaptées.
- [Propstore — Hadley’s Hope colony interior stills](https://propstore.com/product/aliens-1986/stills-of-the-hadleys-hope-colony-interior/) — référence de contexte des décors ; aucune mesure photogrammétrique revendiquée.

La fiche du concept Medlab de Ron Cobb documente un dessin de production. La fiche des intérieurs Hadley décrit une série de photographies de décor. Elles ne fournissent pas, à elles seules, des mesures complètes permettant de certifier le mobilier du jeu à l’identique. Les nouveaux meubles gardent leur statut d’adaptation et doivent être comparés aux références de l’accessoire précis avant toute clôture 1:1.

### Portée de la vérification de cette bible

Les comptages proviennent de l’import des exports de scènes, du registre de fidélité, de l’arsenal, des trois manifestes historiques et des six PNG V119 présents. Les chemins d’images, identifiants et fichiers ont été contrôlés. Les sélections de props ont été évaluées dans deux états de collecte déclarés. **Cette vérification documentaire ne revendique aucun nouveau résultat de parcours, de CI ou de fidélité au film.** Les résultats du renderer V119 et du jeu servi doivent rester rattachés à leurs propres preuves sur le commit final.

