# Alien: Earth — bible de contenu et suivi V12

Mise à jour du 26 novembre 2026. Cette bible décrit le module effectivement récupéré, les ressources produites et leurs usages réels. Les plans, dialogues et paramètres ludiques restent une adaptation ; aucune certification globale de fidélité 1:1 n’est attribuée.

## État de cette révision

La base V11 vérifiée est conservée sous `modules/alien-earth/v12` avec ses 180 fichiers historiques et un reçu de provenance. La version source reste 11.0.0 et le schéma de sauvegarde reste 11. La présentation V12 ajoute l’entrée depuis le Tantalus, le retour vers le titre hôte, le chargeur raster et quinze PNG individuels.

Les huit premières images de la PR78 sont conservées. Sept images sont ajoutées : Wendy, Kirsh, Curly, Nibs, une applique avec ses états allumé/éteint et une pipette. Une pose isolée ne constitue pas une animation complète. Trois nouvelles silhouettes — Kirsh, Curly, Nibs — sont actuellement utilisées par le catalogue : leur costume ou leur absence de PNJ talk empêche de revendiquer leur apparition dans la campagne actuelle.

Les signatures PNG, dimensions, alpha et empreintes sont contrôlées. Le parcours Chromium de la base à 8 images a passé 13 contrôles ; la validation finale des15 ressources est encore en cours. Les résultats définitifs seront consignés dans `qa/browser-report.json` et `qa/test-report.json`.

## 1. Ressources réellement présentes

| Ressource | Surface raccordée | Périmètre |
| --- | --- | --- |
| MCS-X | Monde et catalogue | Fusil autonome, profil droit. Aucun autre armement remplacé. |
| Species 19 — adulte | Monde | Profil tick adulte uniquement. Une pose ; animation non générée. |
| Joe / Hermit — MCS-X, attente | Monde et catalogue | Joe immobile, MCS-X, sans casque. Fusil inclus dans le PNG ; aucun doublon. Exclure déplacement, accroupissement, conduit bas, portage et costume de chapitre d’index 6. |
| Zoo — cylindre de confinement | Monde | R18-0 et R18-4 uniquement, trois cylindres sur support continu ; conserver l’emprise physique. |
| Zoo — console murale | Monde | R18-wall1 et R18-wall3 uniquement. Support mural original y210–267 ; pas de substitution de R18-1 au premier plan. |
| Zoo — table de laboratoire | Monde | R18-island seulement, largeur 195, profondeur 52, hauteur 75. Le bas de la table n’est pas intégralement visible dans la référence. |
| Zoo — meuble à vitrages dépolis | Monde | Décor mural R18, centré à x450 et posé à y300 ; hors panneau de nom, portes et volumes de collision. |
| Arthur — état sain, attente | Monde et catalogue | Arthur sain immobile uniquement. Le portrait ne documente pas entièrement le pantalon et les chaussures. Exclure explicitement eye_host. |
| Wendy — tenue de sauvetage | Monde et catalogue | C03/index 2 seulement, idle debout et mains libres ; joueur et aperçu. Les actions et le massicot gardent leur rendu animé. |
| Kirsh — tenue grise | Catalogue | Catalogue et sélecteur idle sain sans arme. Aucune tâche talk ne fait apparaître ce sprite comme PNJ dans la campagne actuelle. |
| Curly — tenue de sauvetage | Catalogue | Catalogue C03/index 2, idle mains libres. La tâche talk existante est en R21/C06 : ce costume C03 ne la remplace pas. |
| Nibs — tenue de sauvetage | Catalogue | Catalogue C03/index 2, idle mains libres. Aucun PNJ talk ou survivant Nibs présent dans les données actuelles. |
| Zoo — applique allumée à deux bandes | Aperçu de référence | Référence visuelle et aperçu de validation. Le sélecteur alimenté est prêt, mais R18 reste intrinsèquement hors tension. |
| Zoo — applique éteinte à deux bandes | Monde | État réellement utilisé sur R18-wall0, R18-wall2 et R18-wall4, sans modifier alimentation ni collisions. |
| Zoo — pipette et support | Monde | Décoration posée sur R18-island lorsque la table raster est dessinée ; aucun nouveau volume de collision. |

Les pixels des PNG finaux sont conservés tels que fournis par l’outil. Les corrections de l’applique et de la pipette ont été réalisées par génération ciblée et figurent dans `generation-ledger.json`. Les découpes de rendu et pivots sont des paramètres Canvas, sans retouche des fichiers.

Les sources visuelles sont décrites dans [references.md](references.md). Les photographies FX/D23, portraits et concepts Wētā sont distingués. Les faces cachées, changements de pose, bouts de chaussures coupés et détails illisibles restent des adaptations signalées.

## 2. Personnages : inventaire complet des 25 références V11

| ID / nom | Apparence documentée dans V11 | PNG / usage | Présence jouable ou talk |
| --- | --- | --- | --- |
| wendy / Wendy | Bras nus, carré sombre à frange ; combinaison grise pendant le sauvetage. | wendy-idle | C01, C03, C04, C06, C08, R32 |
| joe / Joe Hermit | Cheveux bruns ébouriffés, pas de casque permanent ; gilet clair de secours. | joe-mcsx-idle | C02, C07 |
| morrow / Morrow | Peau brune, cheveux courts texturés, barbe ; veste de bord crème WY. | Aucun PNG individuel | C05 |
| kirsh / Kirsh | Cheveux platine courts, col roulé noir, tenue grise. | kirsh-idle — catalogue | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| sylvia / Dame Sylvia | Chevelure courte bouclée asymétrique, veste ivoire et col imprimé. | Aucun PNG individuel | R01 |
| arthur / Arthur Sylvia | Lunettes fines, barbe, veste bleue à liseré orangé. | arthur-idle | R04 |
| curly / Curly | Tresses sombres, frange séparée ; ne réutilise plus le modèle de Wendy. | curly-idle — catalogue | R21 |
| boy / Boy Kavalier | Cheveux bouclés, robe de chambre crème à motifs verts ; pieds nus. | Aucun PNG individuel | R31 |
| nibs / Nibs | Cheveux roux et palette brune distincte. | nibs-idle — catalogue | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| smee / Smee | Silhouette dédiée ; détails fins de la tenue encore à vérifier. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| slightly / Slightly | Cheveux noirs, manches longues ; vêtements distincts. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| tootles / Tootles | Silhouette dédiée ; variantes de scène à compléter. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| siberian / Siberian | Tenue tactique Prodigy ; coiffure et insignes à affiner sur davantage de plans. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| rashidi / Rashidi | Tenue de secours ; armes et équipement exacts par scène à compléter. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| atom / Atom Eins | Conseiller de Boy Kavalier ; tenue et variantes de scène non certifiées. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| yutani / Yutani | Tenue sombre et coiffure attachée ; portrait de registre, pas présence physique ajoutée à Neverland. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| zaveri / Dr. Zaveri | Médecin/scientifique du Maginot ; silhouette de registre dédiée, uniforme de bord stylisé. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| rahim / Rahim | Équipage du Maginot ; silhouette dédiée, détails de scène encore à affiner. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| chibuzo / Chibuzo | Membre d’équipage du Maginot ; tenue de bord stylisée. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| shmuel / Shmuel | Ingénierie du Maginot ; tenue de travail stylisée, pas de visage photoréaliste. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| malachite / Malachite | Technicien de l’engineering bay ; silhouette dédiée. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| clem / Clem | Équipage du Maginot ; profil visuel provisoire, variantes à compléter. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| petrovich / Petrovich | Équipage du Maginot ; profil visuel provisoire. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| teng / Teng | Équipage du Maginot ; profil visuel provisoire. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |
| sullivan / Sullivan | Équipage du Maginot ; profil visuel provisoire. | Aucun PNG individuel | Catalogue / autres fonctions ; aucune tâche talk identifiée |

Les trois personnages jouables sont Wendy, Joe et Morrow. Les six PNG humains concernent Joe, Arthur sain, Wendy, Kirsh, Curly et Nibs. **Dix-neuf références n’ont encore aucun PNG individuel : morrow, sylvia, boy, smee, slightly, tootles, siberian, rashidi, atom, yutani, zaveri, rahim, chibuzo, shmuel, malachite, clem, petrovich, teng, sullivan.**

Wendy grise est admise uniquement en C03/index 2, immobile, debout, sans arme ni action en cours. Le massicot, le portage, les conduits et l’accroupissement conservent les animations existantes. Curly et Nibs ont aussi une garde C03 ; leur fallback animé garde la palette grise dans ce chapitre pour éviter un changement de couleur entre attente et marche. Kirsh conserve un sélecteur idle sain sans arme, mais les tâches qui le nomment dessinent des dispositifs et ne le font pas apparaître comme PNJ talk.

Arthur sain reste distinct d’Arthur infecté (`eye_host`). Joe porte déjà son fusil dans sa pose PNG : un second dessin de MCS-X serait incorrect. Les tenues, vues opposées, interactions, attaques, blessures et animations faciales de chaque personnage restent à couvrir séparément.

Leïla, Tao, Mara et Ivo sont les quatre survivants originaux de l’adaptation, distincts du casting attesté de la série.

## 3. Créatures et hôtes

| Profil | Nom | Placements | Nouveau sprite / besoin |
| --- | --- | --- | --- |
| xeno_maginot | Xénomorphe du Maginot | 4 | Canvas conservé ; ressource visuelle dédiée manquante |
| xeno_neverland | Xénomorphe de Neverland | 1 | Canvas conservé ; ressource visuelle dédiée manquante |
| facehugger | Facehugger | 8 | Canvas conservé ; ressource visuelle dédiée manquante |
| tick | Tique · espèce 19 | 11 | species19-adult — adulte concept |
| fly | Mouche | 8 | Canvas conservé ; ressource visuelle dédiée manquante |
| eye_caged | T. Ocellus · l’Œil en observation | 1 | Canvas conservé ; ressource visuelle dédiée manquante |
| eye_host | L’Œil · hôte mobile | 1 | Canvas conservé ; ressource visuelle dédiée manquante |
| orchid | Orchidée · D. Plumbicare | 2 | Canvas conservé ; ressource visuelle dédiée manquante |

Ces huit profils ne correspondent pas à huit espèces : stades, individus et hôtes sont séparés dans le moteur. Species19 est la tique ; T.Ocellus/EyeMidge désigne la même créature ; D.Plumbicare est l’Orchid. `eye_caged` représente l’hôte ovin de R16 et `eye_host` Arthur infecté en R27 : aucune substitution par le parasite libre ou par Arthur sain.

Le seul nouveau PNG de créature couvre l’adulte Species19 d’après un concept officiel Wētā, sans certifier le modèle final à l’écran. Les sept autres profils restent en Canvas. La tentative Xénomorphe précédente a été refusée par l’outil et n’a fourni aucune image. Les overlays d’étourdissement, mousse, confinement et préparation d’attaque sont conservés.

## 4. Chapitres et transferts

| Chapitre | Titre | Personnage | Transfert narratif |
| --- | --- | --- | --- |
| C01 | Une seconde naissance | wendy | Navette vers New Siam |
| C02 | La ville sous la coque | joe | Relève · point de vue de Wendy |
| C03 | Ne me laisse pas ici | wendy | Transfert des survivants vers Neverland |
| C04 | Derrière le verre | wendy | Revoir les événements du Maginot |
| C05 | Avant la chute | morrow | Retour à Neverland |
| C06 | Les voix qu’on efface | wendy | Suivre Joe vers la côte |
| C07 | Au bout des conduits | joe | Retrouver Wendy au complexe |
| C08 | Ceux qui restent | wendy | Rester avec les hybrides |

Les transferts ci-dessus sont des transitions narratives du module. Leur présence ne signifie pas qu’une navette ou un véhicule est pilotable.

## 5. Lieux : 70 salles et leurs connexions

| Salle | Chapitre / niveau | Lieu | Sorties | Props |
| --- | --- | --- | --- | --- |
| R01 | C01 / N0 | Salle de réveil | R02, R34 | 9 |
| R02 | C01 / N0 | Galerie des hybrides | R01, R03, R04, R33, R49, R57, R66 | 16 |
| R03 | C01 / N0 | Cour d’entraînement | R02, R04, R33 | 15 |
| R04 | C01 / N0 | Annexe des souvenirs | R02, R03, R05, R34, R58, R68 | 10 |
| R05 | C02 / N0 | Rue de l’impact | R06, R35 | 14 |
| R06 | C02 / N0 | Brèche du Maginot | R05, R07, R08, R36, R50 | 16 |
| R07 | C02 / N2 | Atrium de la tour | R06, R08, R35 | 16 |
| R08 | C02 / N0 | Cage d’ascenseur | R06, R07, R09, R36 | 10 |
| R09 | C03 / N0 | Couloir des appartements | R10, R37 | 13 |
| R10 | C03 / N1 | Appartement traversant | R09, R11, R12, R38, R51 | 17 |
| R11 | C03 / Tour · niveau logistique | Quai de chargement · conteneur | R10, R12, R37 | 10 |
| R12 | C03 / Tour · niveau logistique | Quai · zone de récupération | R10, R11, R13, R38 | 12 |
| R13 | C04 / N0 | Quai de quarantaine | R14, R39, R69 | 15 |
| R14 | C04 / N0 | Anneau de confinement | R13, R15, R16, R40, R52, R69, R70 | 20 |
| R15 | C04 / N0 | Cabine acoustique | R14, R16, R39 | 9 |
| R16 | C04 / N0 | Vivarium | R14, R15, R17, R40, R70 | 13 |
| R17 | C05 / P2 | Chambre cryogénique étendue | R18, R41, R63 | 11 |
| R18 | C05 / P2 | Le Zoo · échantillons du Maginot | R17, R19, R20, R42, R53, R65 | 18 |
| R19 | C05 / P2 | Coursive d’ingénierie du Maginot | R18, R20, R41, R59, R64, R65 | 15 |
| R20 | C05 / P2 | Chambre d’impact | R18, R19, R21, R42 | 11 |
| R21 | C06 / N0 | Allée des pavillons | R22, R43 | 13 |
| R22 | C06 / N0 | Clinique de transfert | R21, R23, R24, R44, R54 | 13 |
| R23 | C06 / N0 | Laboratoire déserté | R22, R24, R43 | 20 |
| R24 | C06 / N0 | Galerie de maintenance | R22, R23, R25, R44 | 13 |
| R25 | C07 / N0 | Conduits de service | R26, R45 | 15 |
| R26 | C07 / N0 | Sentier de la réserve | R25, R27, R28, R46, R55 | 16 |
| R27 | C07 / N0 | Accès à la plage | R26, R28, R45 | 13 |
| R28 | C07 / N0 | Embarcadère | R26, R27, R29, R46 | 12 |
| R29 | C08 / N0 | Bloc de détention | R30, R47 | 13 |
| R30 | C08 / N0 | Laboratoire central | R29, R31, R32, R48, R56 | 18 |
| R31 | C08 / N0 | Résidence de Kavalier | R30, R32, R47 | 14 |
| R32 | C08 / N0 | Terrasse de Neverland | R30, R31, END, R48 | 13 |
| R33 | C01 / Jardin bas | Serre d’acclimatation | R02, R03 | 12 |
| R34 | C01 / Clinique · annexe | Atelier des prothèses | R01, R04, R49 | 15 |
| R35 | C02 / Rue · passage couvert | Poste de triage | R05, R07 | 14 |
| R36 | C02 / Tour · rez-de-chaussée | Galerie commerciale | R06, R08, R50 | 15 |
| R37 | C03 / Tour · étage des appartements | Buanderie technique | R09, R11 | 12 |
| R38 | C03 / Tour · niveau du toit | Palier des secours | R10, R12, R51 | 16 |
| R39 | C04 / Quarantaine · sous-sol | Station de filtration | R13, R15 | 16 |
| R40 | C04 / Vivarium · galerie haute | Poste d’observation | R14, R16, R52 | 14 |
| R41 | C05 / Maginot · pont de service | Vestiaire de sécurité | R17, R19, R62 | 16 |
| R42 | C05 / Maginot · pont machines | Coursive de refroidissement | R18, R20, R53 | 15 |
| R43 | C06 / Clinique · sous-sol | Archives cliniques | R21, R23 | 13 |
| R44 | C06 / Maintenance · niveau bas | Salle des pompes | R22, R24, R54 | 18 |
| R45 | C07 / Réserve · lisière | Abri des balises | R25, R27 | 14 |
| R46 | C07 / Littoral · bassin technique | Local de la vedette | R26, R28, R55 | 15 |
| R47 | C08 / Confinement · galerie haute | Galerie de surveillance | R29, R31 | 14 |
| R48 | C08 / Résidence · terrasse haute | Jardin suspendu | R30, R32, R56 | 14 |
| R49 | C01 / Galerie de service | Collecteur des jardins | R02, R34 | 14 |
| R50 | C02 / Galerie de service | Gaine du monte-charge | R06, R36 | 14 |
| R51 | C03 / Galerie de service | Vide des canalisations | R10, R38 | 14 |
| R52 | C04 / Galerie de service | Retour du vivarium | R14, R40 | 14 |
| R53 | C05 / Galerie de service | Double fond du Maginot | R18, R42 | 14 |
| R54 | C06 / Galerie de service | Dérivation de la clinique | R22, R44 | 14 |
| R55 | C07 / Galerie de service | Drain du littoral | R26, R46 | 14 |
| R56 | C08 / Galerie de service | Boucle des enceintes | R30, R48 | 14 |
| R57 | C01 / Neverland · pavillon des hybrides | Dortoir des hybrides | R02, R58 | 11 |
| R58 | C01 / Neverland · pavillon des hybrides | Salle commune des hybrides | R57, R04 | 11 |
| R59 | C05 / Maginot · pont habitable | Passerelle du Maginot | R19, R60, R63 | 11 |
| R60 | C05 / Maginot · pont habitable | Réfectoire du Maginot | R59, R61, R64 | 11 |
| R61 | C05 / Maginot · pont habitable | Interface MU/TH/UR | R60, R62 | 11 |
| R62 | C05 / Maginot · pont habitable | Armurerie du Maginot | R61, R41 | 11 |
| R63 | C05 / Maginot · pont médical | Medbay One | R17, R59 | 13 |
| R64 | C05 / Maginot · propulsion | Salle des machines · Engineering Room | R19, R60 | 13 |
| R65 | C05 / Maginot · transport des spécimens | Chambre de confinement du Maginot | R18, R19 | 13 |
| R66 | C01 / Neverland · pavillon principal | Lobby de Neverland | R02, R67 | 13 |
| R67 | C01 / Neverland · pavillon principal | Atrium de Neverland | R66, R68 | 13 |
| R68 | C01 / Neverland · pavillon des hybrides | Salle d’entretien (« Talking Room ») | R67, R04 | 13 |
| R69 | C04 / Neverland · aile médicale | Baie médicale de Neverland | R13, R14 | 13 |
| R70 | C04 / Neverland · laboratoire sécurisé | Laboratoire sécurisé · salle des œufs | R14, R16 | 13 |

Le graphe contient 204 faces de seuil physiques, soit102 connexions bidirectionnelles. Les huit transferts de chapitre sont distincts : les données contiennent donc212 portails au total, dont le dernier mène à END. Les portails détaillés, ancres, positions d’arrivée, conditions, sols et sources figurent dans `inventory.json`. La connectivité est une reconstruction de gameplay ; aucun relevé métrique complet des décors n’a été obtenu. Un lien dans le graphe ne suffit pas à prouver une traversée physique ; les tests et parcours gardent une portée distincte.

Le lot V12 ne change pas les données de collision. Les nouveaux objets R18 gardent leurs supports et emprises. Le panneau de nom du Zoo a été replacé dans une bande libre au-dessus du mobilier après observation réelle du rack qui le masquait.

## 6. Décor : 49 types, 958 placements

| Type logique | Placements | Affectation du lot / reste |
| --- | --- | --- |
| barrier | 13 | Rendu existant ; aucun remplacement global par ce lot. |
| beacon | 1 | Rendu existant ; aucun remplacement global par ce lot. |
| bed | 14 | Rendu existant ; aucun remplacement global par ce lot. |
| bench | 22 | Rendu existant ; aucun remplacement global par ce lot. |
| cabinet | 38 | Rendu existant ; aucun remplacement global par ce lot. |
| cameraConsole-v4 | 8 | Rendu existant ; aucun remplacement global par ce lot. |
| cargo | 15 | Rendu existant ; aucun remplacement global par ce lot. |
| console | 61 | Table R18-island seulement ; pipette décorative sur son plateau. |
| containment-pad-v5 | 17 | Rendu existant ; aucun remplacement global par ce lot. |
| coolant-unit | 3 | Rendu existant ; aucun remplacement global par ce lot. |
| counter | 3 | Rendu existant ; aucun remplacement global par ce lot. |
| cryo | 10 | Cylindres seulement R18-0/R18-4 ; autres cryopodes inchangés. |
| data-stack | 5 | Rendu existant ; aucun remplacement global par ce lot. |
| duct-brake-v7 | 16 | Rendu existant ; aucun remplacement global par ce lot. |
| duct-cable-v7 | 24 | Rendu existant ; aucun remplacement global par ce lot. |
| duct-hatch-v7 | 32 | Rendu existant ; aucun remplacement global par ce lot. |
| duct-motor-v7 | 8 | Rendu existant ; aucun remplacement global par ce lot. |
| duct-rib-v7 | 48 | Rendu existant ; aucun remplacement global par ce lot. |
| filter-bank | 2 | Rendu existant ; aucun remplacement global par ce lot. |
| gate-control | 16 | Rendu existant ; aucun remplacement global par ce lot. |
| hide-niche | 12 | Rendu existant ; aucun remplacement global par ce lot. |
| linen-cart | 1 | Rendu existant ; aucun remplacement global par ce lot. |
| medical-cart | 4 | Rendu existant ; aucun remplacement global par ce lot. |
| outboard | 1 | Rendu existant ; aucun remplacement global par ce lot. |
| pipe | 10 | Rendu existant ; aucun remplacement global par ce lot. |
| planter | 41 | Rendu existant ; aucun remplacement global par ce lot. |
| powercab-v4 | 8 | Rendu existant ; aucun remplacement global par ce lot. |
| rib | 6 | Rendu existant ; aucun remplacement global par ce lot. |
| rock | 4 | Rendu existant ; aucun remplacement global par ce lot. |
| rope-reel | 2 | Rendu existant ; aucun remplacement global par ce lot. |
| scrap-v4 | 16 | Rendu existant ; aucun remplacement global par ce lot. |
| security-camera-v4 | 16 | Rendu existant ; aucun remplacement global par ce lot. |
| service-light-v4 | 48 | Rendu existant ; aucun remplacement global par ce lot. |
| sofa | 15 | Rendu existant ; aucun remplacement global par ce lot. |
| stretcher | 5 | Rendu existant ; aucun remplacement global par ce lot. |
| supply-case | 24 | Rendu existant ; aucun remplacement global par ce lot. |
| tank | 31 | Rendu existant ; aucun remplacement global par ce lot. |
| tool-rack | 4 | Rendu existant ; aucun remplacement global par ce lot. |
| tree | 11 | Rendu existant ; aucun remplacement global par ce lot. |
| valve-post | 9 | Rendu existant ; aucun remplacement global par ce lot. |
| vending | 1 | Rendu existant ; aucun remplacement global par ce lot. |
| wall-light | 164 | Appliques R18-wall0/2/4 seulement ; PNG éteint natif, variante allumée en référence. |
| wall-map | 2 | Rendu existant ; aucun remplacement global par ce lot. |
| wall-panel | 131 | Consoles murales R18-wall1/R18-wall3 seulement. |
| washer | 2 | Rendu existant ; aucun remplacement global par ce lot. |
| water-pump | 4 | Rendu existant ; aucun remplacement global par ce lot. |
| workbench | 15 | Rendu existant ; aucun remplacement global par ce lot. |
| workbench-v4 | 8 | Rendu existant ; aucun remplacement global par ce lot. |
| wreck | 7 | Rendu existant ; aucun remplacement global par ce lot. |

Sept PNG couvrent six éléments du laboratoire, avec deux états pour l’applique. Le cabinet reste un décor mural ajouté au fond R18, sans collider ; la pipette reste un détail posé sur la table. Ce lot ne constitue pas un remplacement des 958 placements. Aucun type `cryo` ou `console` n’est remplacé globalement.

La table conserve l’emprise195×52 et hauteur75 de `R18-island`. Les cylindres occupent les racks `R18-0`/`R18-4` avec support continu. Les consoles sont attachées au mur sur `R18-wall1`/`R18-wall3`. Les lumières ciblent `R18-wall0`/`R18-wall2`/`R18-wall4` et utilisent un PNG éteint dans la scène R18, qui reste hors tension. Le cabinet, les panneaux, les portes et les conduits doivent rester séparés visuellement ; leurs positions finales sont vérifiées dans la capture R18.

## 7. Armes et accessoires visuels : 13 lignes de référence

| Référence | État V11 | Besoin restant |
| --- | --- | --- |
| MCS-X · fusil Prodigy | jouable · dotation principale de Joe | Silhouette Steyr AUG modifiée ; mécanique de tir du module, pas reproduction balistique certifiée. |
| Pistolet de bord Maginot · Glock/P80 modifié | jouable · dotation Morrow | Silhouette rapprochée du pistolet observé ; accessoires exacts variant selon les plans. |
| KSG-AL · arc / mousse | jouable · armurerie R62 | Arc limité et mousse sur cible étourdie. Paramètres et prise facultative originaux ; ne reproduit pas toute la scène de capture. |
| Lame de massicot de Wendy | jouable · R58, puis chapitre de sauvetage | Observation puis lame disponible pendant C03 ; corps-à-corps limité, lame perdue après impact acide. Pas de don rétroactif après une migration. |
| Crochet du quai | représenté dans R11 · non maniable | Le combat complet contre le Xénomorphe et la porte du conteneur ne sont pas encore reproduits. |
| Radio / liaison de secours | interaction de récit et transferts | Pas de simulation de fréquences ou voix officielles. |
| Torche | jouable · L | Modèle exact de l’accessoire non certifié. |
| Terminal et tablette | interactions existantes | Interfaces de jeu originales, non reproduites plan par plan. |
| Arme compacte des agents Weyland-Yutani | référence · non jouable | Modèle et dotations de tous les épisodes à relever. |
| Autres armes visibles de la saison | inventaire exhaustif non établi | Ne pas conclure à une présence ou absence de M41A / M56 sans vérification plan par plan. |
| Sondes, sentinelles, pièges, circuits, kits, balises | jouables · inventions de l’adaptation | Ne pas les présenter comme équipement officiel de la série. |
| Maxim 9 modifié · sidearm Prodigy | jouable · secondaire de Joe | Secondaire sélectionnable ; partage encore la réserve abstraite du système d’armes, capacité exacte à raffiner. |
| KRISS Vector · sécurité Prodigy | représenté / registre · non jouable | Présence visuelle référencée ; pas encore distribué au joueur. |

Le MCS-X est la seule nouvelle image d’arme autonome. Les données distinguent armes jouables, armes seulement représentées et familles dont l’inventaire complet reste à établir. Les petits accessoires et marquages ne sont pas certifiés par le seul nom d’un modèle.

## 8. Fonctions et équipements de gameplay : 21 entrées

| Fonction / outil | Commande | Comportement existant |
| --- | --- | --- |
| Balise sonore | B | Réserve finie. Lance une balise devant vous ; elle s’arrête avant un obstacle et attire les créatures qui ne vous voient pas. Sept secondes, aucune garantie de sécurité. |
| Kit de stabilisation | U | Restaure 40 points d’intégrité. Consommé uniquement si nécessaire. Une charge peut aussi stabiliser un compagnon à terre. |
| Relevé de terrain | N maintenu | Trois secondes d’observation d’une créature visible, à moins de 600 unités. Bouger, être frappé ou perdre la vue annule le relevé en cours. |
| Niche de service | E près de la niche | Dissimule le joueur immobile. Ne protège pas si l’adversaire vous a vu entrer. E ou un déplacement permet de ressortir. |
| Verrou manuel de seuil — X maintenu | X MAINTENU | X tenu : verrouiller ou ouvrir en une seconde. M tenu : réparation unique à trois pièces et 3,5 secondes, y compris après rupture. |
| Écouter à la porte — G maintenu | G MAINTENU | Une seconde et demie immobile près d’une porte. Donne un indice daté sur une présence proche de l’autre face, jamais une carte des créatures. |
| Rassurer — T maintenu | T MAINTENU | Deux secondes près du compagnon le plus tendu. Interrompu en bougeant, par un impact ou par une porte quittée. |
| Ordres locaux — H / Y | H / Y / SAC | H : regrouper les compagnons de la pièce. Y : leur demander d’attendre. Le mode discret est disponible depuis le sac. |
| Pièces détachées | E / ÉTABLI | Quatre pièces par mallette, seize mallettes. Stock maximal : 24. Recettes aux établis ; réparation des verrous avec M. |
| Répartiteur de secteur | E MAINTENU | Deux départs sur trois : Travail, Observation ou Discrétion. Choisissez sur le tableau puis maintenez E 2,5 secondes sur place. |
| Relevé de surveillance | E MAINTENU | Alimentez Surveillance. Choisissez une des deux caméras et maintenez E 1,5 seconde au terminal. Relevé daté et limité au champ. |
| Transport d’un blessé | P MAINTENU | 1,2 seconde près d’une personne à terre. Mains occupées, marche ralentie. P pour déposer ; la balise reçoit les blessés portés. |
| Confinement de terrain | E AU PLATEAU | Deux cartouches au départ, quatre au maximum. Choisissez Rampeurs ou Volants, puis maintenez E deux secondes. Attirez la créature sur le plateau ; le filet se ferme après 0, 8 seconde de présence continue. Appât pendant 45 secondes. Les gros organismes ne sont pas capturables. |
| Étude sous enceinte | E · ÉTUDE / LIBÉRATION | Trois secondes au plateau scellé documentent cette identité une seule fois. Libération manuelle en deux secondes, sans cartouche rendue. Un Xénomorphe libre peut rompre l’enceinte : n’en faites pas un refuge garanti. |
| Deux sondes de mouvement | 1 MAINTENU / 2 | 1 maintenu : pose de 1,5 seconde sur sol libre. 2 : récepteur. E près de la sonde : récupération exposée d’une seconde. 180 secondes d’autonomie, sans recharge gratuite dans le sac. Les mouvements du joueur et des compagnons déclenchent aussi la mesure. |
| Récepteur de proximité | 2 / SAC | Liaison limitée à deux portes intérieures accessibles et déverrouillées. Mesure datée sans nom ni position précise. Les obstacles masquent le capteur ; une absence de mouvement ne prouve pas une pièce sûre. Hors écran, seules les poursuites déjà actives peuvent être observées, le reste est signalé non observé. |
| Entretien et émission des sondes | ÉTABLI / RÉCEPTEUR | Sonde portée : deux pièces et trois secondes à l’établi restaurent 180 secondes, si au moins 20 ont été consommées. Une impulsion distante dans la pièce active coûte 25 secondes d’autonomie et dure quatre secondes. Pas de contrôle sonore des populations hors écran. |
| Grilles de maintenance | E MAINTENU | Deux secondes pour déposer une grille accessible, sans pièce consommée. L’ouverture est partagée entre ses faces et reste ouverte. Réappuyer sur E pour entrer. Passage accroupi automatique, interdit au portage. Les petits organismes peuvent suivre ; pas les adultes par ces grilles étroites. |
| Frein de turbine | E MAINTENU | Cycle de 10 secondes : 5 en marche, 3 de repos, 2 de préalerte avant redémarrage. Le carter en marche bloque tout franchissement. Deux freins accessibles depuis chaque côté ; 2,5 secondes pour l’arrêt permanent. Les pauses figent le cycle. La commande électrique du chapitre ne remplace pas le frein. |
| Carnet d’enquêtes | 3 / JOURNAL / TERMINAL | Associez trois documents réellement récupérés. Au terminal du secteur, maintenez E pour conserver localement en deux secondes ou diffuser en quatre secondes avec Surveillance. La diffusion fait du bruit ; les deux issues sont uniques. |
| Registre des sentinelles | 4 / COMMANDE LOCALE | Huit contrôles optiques alimentés par Surveillance. Deux secondes de détection, six secondes de bruit local. E puis maintien pour isoler ou tester ; F au pied aveugle temporairement. Trois impacts détruisent le détecteur. |

Ces21 entrées décrivent des fonctions et outils, pas21 armes distinctes. Les sondes, sentinelles, circuits, kits et balises comprennent des inventions de l’adaptation ; elles ne doivent pas être présentées comme toutes attestées dans la série.

## 9. Terrains, véhicules, vaisseaux et planète

| Surface | Identifiant | Coefficient de bruit du jeu |
| --- | --- | --- |
| Revêtement souple | quiet | 0.62 |
| Dalles | tile | 1 |
| Caillebotis | grate | 1.45 |
| Éclats de verre | glass | 1.8 |
| Sol humide | wet | 1.25 |
| Terre et végétation | soil | 0.74 |

Les six matériaux ci-dessus ont un effet de bruit dans le jeu. Ils ne constituent pas six packs de textures générés.

| Domaine | Présent | Travail restant |
| --- | --- | --- |
| Maginot | Salles intérieures et connexions jouables | Sprite extérieur complet, vues et animations du vaisseau, confrontation aux plans de tournage |
| Navettes / transferts | Libellés narratifs des chapitres | Modèles visuels sourcés, intérieurs/extérieur si retenus, animation d’embarquement ; aucun pilotage revendiqué |
| Véhicules de secours / bateaux | Références de lieu et props comme moteur hors-bord, cordage | Inventaire visuel des véhicules complets, échelle et usages ; aucun véhicule complet nouveau généré |
| New Siam / Neverland | Décors et parcours reconstruits | Extérieurs complets, raccords spatiaux documentés et variantes de terrain |
| Terre | Cadre narratif de la campagne | Aucune texture planétaire ni carte globale nouvelle produite ; aucune planète supplémentaire inventée dans ce lot |
| Fonds de salle | Rendu Canvas existant | Aucun panorama raster complet nouveau ; couches de parallaxe à produire selon les lieux documentés |

## 10. Manquants prioritaires et critères de clôture

1. Produire les dix-neuf silhouettes sans PNG, en commençant par Morrow, Sylvia et les personnages réellement rencontrés, avec costume et pose compatibles avec leurs scènes.
2. Compléter les animations des six silhouettes générées, notamment déplacements, action et équipement de Wendy/Joe ; ne pas appeler un arrêt sur image une animation terminée.
3. Compléter les sept profils de créatures sans nouvelle image, en distinguant hôtes et stades et en obtenant des références finales lorsque les concepts seuls sont insuffisants.
4. Compléter les armes et accessoires des treize lignes de référence, puis les variantes des 49 types de props ; garder les outils inventés séparés de l’équipement attesté.
5. Documenter véhicules, vaisseau, terrains et extérieurs avant génération ; ne pas remplacer les inconnues par un modèle générique présenté comme canon.
6. Vérifier les portes, supports, arrivées, collisions et changements de costume dans leur contexte réel ; maintenir la séparation entre preuve de données, test de fonctions et parcours navigateur.

Les lacunes V11 conservées dans `inventory.json` comprennent les plans métriques, les pièces secondaires relevées plan par plan, toutes les dotations de fond, les variantes de visage/tenue/blessure, les chorégraphies et la continuité extérieure complète. Ce suivi énumère les manques connus ; il ne prétend pas avoir recensé tous les éléments visibles de chaque épisode.

## 11. Intégration et sauvegardes

L’entrée depuis le menu du Tantalus ouvre le module indépendant à `dlc/alien-earth/v12/index.html`. Le retour hôte est proposé au titre et en pause. L’espace Earth reste `atf.dlc.alien-earth.s1.profile-1`, schéma 11. Il n’y a pas de fusion de ce moteur avec GameEngine natif.

Le garde d’enregistrement empêche un écran de titre Earth non démarré d’écraser une sauvegarde existante. Le lancement hôte arrête seulement le moteur Forge, afin de préserver la session native. Les fichiers publics sont admis explicitement ; les bibles, références et preuves QA restent hors de la distribution jouable.

Voir [CONTINUATION.md](CONTINUATION.md) pour l’état de reconstruction, les commandes et les limites de validation. Les résultats de la base à 8 images ne doivent pas être transférés aux 15 images sans nouvelle exécution.
