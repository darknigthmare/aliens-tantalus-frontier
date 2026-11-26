# AVP (2004) — inventaire des présences et des manquants

**Base examinée : `b0df1877a058f0818f96437fdfdea3f21ba7f415`**, branche cumulative `claude/nifty-shannon-qpy1hl`. Cet inventaire complète la bible AVP existante ; il distingue présence de code, représentation scénique, documentation et qualification visuelle. Il ne déclare aucune fidélité 1:1 atteinte.

## Résultats mesurés dans les sources

| Mesure | Résultat |
| --- | --- |
| Salles | 44 : 43 navigables et vessel, épilogue non navigable |
| Connexions | 104 faces de passage / 52 liaisons réciproques |
| Campagne | 19 chapitres, 17 opérations |
| Documentation | 188 notices du carnet et 250 références de fidélité |
| Illustrations embarquées | 145 SVG ; aucune de ces images n’est ici certifiée 1:1 |
| Occurrences scéniques de v0.11 | 11 occurrences d’acteurs et 57 occurrences de props, pas autant d’objets uniques |
| Terrain | 6 matériaux et 24 zones |
| Qualification des salles | 23 lieux/fonctions du film adaptés (épilogue compris), 21 raccords ou annexes de gameplay originaux |

[Sources éditables](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/b0df1877a058f0818f96437fdfdea3f21ba7f415/scripts/dlc/avp-2004/README.md) · [Catalogue historique](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/b0df1877a058f0818f96437fdfdea3f21ba7f415/scripts/dlc/avp-2004/web/fidelity-catalog.js) · [Données de fidélité](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/b0df1877a058f0818f96437fdfdea3f21ba7f415/scripts/dlc/avp-2004/web/fidelity-data.js).

## Ce que les statuts disent réellement

| Statut | Fiches | Portée |
| --- | --- | --- |
| ACTIF | 35 | Acteur, équipement ou mécanique déclaré actif ; toutes les armes ne sont pas utilisables par Lex. |
| SCENE | 113 | Représentation scénique ou condensée, pas nécessairement pièce autonome ou animation complète. |
| LIEU | 19 | Lieu ou famille de lieu adapté, sans plan métrique 1:1. |
| ABSENT | 19 | Pas de représentation physique vérifiée dans cette livraison. |
| A_VERIFIER | 15 | Présence canon, identité ou variante à résoudre. |
| DOCUMENT | 7 | Mention documentaire sans pièce ou mécanisme indépendant validé. |
| HORS_CAMPAGNE | 42 | Scène Unrated, supprimée ou production conservée séparément du parcours cinéma. |

236 fiches portent encore « Inventaire utilisateur ; statut film à confronter à une source ou un plan précis. » Les 14 autres donnent une référence générale aux costumes/accastillages. Les URL historiques sont 176 fois la même page générale AVPGalaxy, 36 fois sa page de scènes supprimées, 26 fois IMDb et 12 fois IMFDB. Le champ sourceClaim contient 202 mentions « Confirmé à l’écran » : il s’agit de métadonnées héritées, pas d’une vérification nouvelle. Le JSON les marque `sourceClaimIsLegacyUnverifiedMetadata:true`, `verifiedCanonThisAudit:false` et `fidelity1to1Certified:false`.


### Correction de qualification géographique

Les identifiants `AVP2004-024` et `AVP2004-187` sont conservés. Leur étiquette historique « Italie » ne constitue pas une localisation admise. La [source secondaire S24, section « Our Leading Man’s Money Problems… », paragraphe « The Film »](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) situe Sebastian à **Teotihuacan, au Mexique**. Le raccord au plan/carton du film reste à consigner. Aucun nouveau lieu italien n’est proposé sur la base du catalogue hérité. Le JSON conserve le texte historique et lui adjoint ce conflit de source.

## Les huit catégories demandées

| Catégorie | État observé et manque à traiter |
| --- | --- |
| Personnages | 43 fiches Personnage et 28 fiches biologie. Lex, Sebastian, Weyland, Miller, Verheiden, Scar, Celtic, Chopper, Grid, la Reine et l’Ancien ont des représentations ; secondaires absents, variantes et visages restent à qualifier. Les deux compagnons sont Sebastian et Scar. |
| Lieux | Recrutement non reconstitué ; le lieu italien des fiches024/187 est un libellé hérité non validé. La source secondaire S24 situe Sebastian à Teotihuacan, au Mexique ; raccord au plan/carton à relever. Découverte satellitaire résumée ; 1904 et flashback ancien séparés. Les 21 annexes de gameplay ne deviennent pas des décors attestés par leur simple nom. |
| Armes | 22 fiches, toutes ACTIF ou SCENE. Le manque porte sur les formes, variantes, attaches, effets et scènes réellement couverts. Un prop posé n’est pas une arme jouable. |
| Props / équipement | 68 fiches Équipement, avec autres props dans les lieux/biologie. Bodycam, lampe exacte et rations documentaires ; kit médical Yautja et biomask de l’Ancien incertains ; plusieurs variantes partagent une seule image. |
| Véhicules | Hélicoptère et Snowcat scéniques ; motoneiges à vérifier. Modèle, livrée, portières, chenilles/rotors et échelle restent à comparer. Le lien maru/landing est un transport abrégé. |
| Vaisseaux / navires | Piper Maru et vaisseau Yautja présents par architecture/scènes Canvas sans sprite autonome de coque. Équipages et vaisseau ancien absents ; appareil cérémoniel distinct non établi. |
| Terrain | 6 familles de matériaux, 24 zones marquées original-gameplay. Les textures, conditions de neige/glace/eau et échelles de répétition demandent des sources propres à chaque lieu. |
| Planète | Aucune fiche planète ni image planétaire autonome dans le registre250. Ajouter une fiche Terre et ses lieux par montage ; ne pas inventer planète Yautja, trajet interplanétaire ou import de LV-426/LV-223. |

## Absents, références incertaines et documentation

| ID | Élément | Statut | Manque ou réserve actuelle |
| --- | --- | --- | --- |
| AVP2004-011 | Stone | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-012 | Sven | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-013 | Juan Ramirez | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-014 | Mikkel | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-015 | Bass | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-017 | Quinn's assistant / drilling crew member | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-018 | Piper Maru captain | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-019 | Piper Maru crew | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-024 | Italian archaeologists at dig site — intitulé hérité non validé | ABSENT | Aucun groupe physique vérifié. L’étiquette Italie contredit la localisation Teotihuacan/Mexique donnée par S24 ; ne pas produire une Italie nouvelle. |
| AVP2004-031 | Ancient Predator leader | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-032 | Ancient Predator hunters | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-033 | Predator mothership crew | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-035 | Scar Predator acid-burned | A_VERIFIER | État de Scar brûlé et traitement : contrôler le plan et ne pas mélanger les épisodes. |
| AVP2004-037 | Celtic Predator unmasked | A_VERIFIER | Celtic sans masque : non validé ; la version du jeu conserve son biomask. |
| AVP2004-054 | Chestburster | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-055 | Adult Alien inner jaw | DOCUMENT | Mâchoire interne non animée séparément. Les dents du dessin ne prouvent pas cette attaque. |
| AVP2004-066 | Ancient xenomorph horde | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-075 | Elder biomask | A_VERIFIER | Une pièce ADI décrite par Propstore est un casque de Scar redécoré pour exposition. Cela ne prouve pas son port à l’écran ; l’Ancien est ici sans masque. |
| AVP2004-076 | Ancient Predator biomask | A_VERIFIER | Masques du flashback non reconstruits. Ne pas les assimiler aux trois jeunes chasseurs. |
| AVP2004-089 | Cloaking device | DOCUMENT | Camouflage, vision thermique et vision xénomorphe restent documentés, non simulés dans le point de vue de Lex. |
| AVP2004-090 | Thermal vision mode | DOCUMENT | Camouflage, vision thermique et vision xénomorphe restent documentés, non simulés dans le point de vue de Lex. |
| AVP2004-091 | Alien vision mode | DOCUMENT | Camouflage, vision thermique et vision xénomorphe restent documentés, non simulés dans le point de vue de Lex. |
| AVP2004-092 | Predator medical kit | A_VERIFIER | Kit, fluide bleu et agrafeuse : présence dans AVP 2004 à contrôler sur une image précise ; ne pas importer automatiquement des autres films Predator/AVPR. |
| AVP2004-093 | Blue medical fluid / coagulant | A_VERIFIER | Kit, fluide bleu et agrafeuse : présence dans AVP 2004 à contrôler sur une image précise ; ne pas importer automatiquement des autres films Predator/AVPR. |
| AVP2004-094 | Medical stapler / surgical tool | A_VERIFIER | Kit, fluide bleu et agrafeuse : présence dans AVP 2004 à contrôler sur une image précise ; ne pas importer automatiquement des autres films Predator/AVPR. |
| AVP2004-095 | Ritual marking knife | A_VERIFIER | Fonction précise à confronter à un plan : ne pas confondre un fragment de doigt xénomorphe et une arme rituelle. |
| AVP2004-116 | Expedition snowmobiles | A_VERIFIER | Motoneiges : variante exacte et présence dans le montage à confirmer avant de prétendre une intégration fidèle. |
| AVP2004-117 | Thermal drill rig | A_VERIFIER | Correction : le tunnel est déjà ouvert à l’arrivée ; le matériel humain ne le creuse pas. Désignation « foreuse thermique » et assemblage précis du catalogue à vérifier. |
| AVP2004-118 | Drill-head assembly | A_VERIFIER | Correction : le tunnel est déjà ouvert à l’arrivée ; le matériel humain ne le creuse pas. Désignation « foreuse thermique » et assemblage précis du catalogue à vérifier. |
| AVP2004-121 | Predator ancient spacecraft | ABSENT | Vaisseau du flashback ancien non reconstruit. Ce n’est pas la plateforme de la Reine (ID 124). |
| AVP2004-122 | Predator ceremonial recovery craft | A_VERIFIER | Véhicule de récupération distinct du vaisseau principal : identité autonome non établie. Ne pas inventer un appareil supplémentaire. |
| AVP2004-132 | Handheld flashlight | DOCUMENT | Éclairage général conservé, mais lampe de poche exacte non identifiée comme objet autonome. Non comptée comme nouvelle lampe physique. |
| AVP2004-144 | Body camera / helmet camera | DOCUMENT | Caméra portée à contrôler sur le costume ; les caméras exposées sur la table sont portatives et ne suffisent pas à valider une bodycam. |
| AVP2004-146 | Thermal drill control console | A_VERIFIER | Correction : le tunnel est déjà ouvert à l’arrivée ; le matériel humain ne le creuse pas. Désignation « foreuse thermique » et assemblage précis du catalogue à vérifier. |
| AVP2004-147 | Drill operator protective gear | A_VERIFIER | Silhouette de Quinn ajoutée. Modèle précis de la tenue de forage non certifié. |
| AVP2004-164 | Expedition food and ration packs | DOCUMENT | Rations citées dans le catalogue ; aucun sachet précisément identifié et indépendant n’est ajouté à cette livraison. |
| AVP2004-185 | 1904 whaling station massacre | A_VERIFIER | Le prologue 1904 appartient au périmètre Unrated ; ne pas le déclarer dans le montage cinéma. |
| AVP2004-187 | Expedition recruitment montage | ABSENT | Recrutement non reconstitué. L’Italie mentionnée dans l’implémentation historique est non validée ; S24 indique Teotihuacan au Mexique pour Sebastian. Aucune porte fictive vers la pyramide. |
| AVP2004-189 | Predators recover the plasmacasters | ABSENT | Pas de représentation physique vérifiée dans cette livraison. |
| AVP2004-201 | Ancient human sacrifice flashback | ABSENT | Événement seulement évoqué ou absent ; pas reconstitué en séquence complète. |
| AVP2004-213 | Quinn drilling accident / shaft incident | ABSENT | Événement seulement évoqué ou absent ; pas reconstitué en séquence complète. |

## Réutilisations d’images qui ne prouvent pas plusieurs variantes

| Asset partagé | Fiches | Action de qualification |
| --- | --- | --- |
| film-dagger | AVP2004-086 / 111 | Dague Yautja et couteau humain : établir deux références et deux silhouettes si les objets sont distincts. |
| film-combistick | AVP2004-084 / 098 | Combistick et lance offerte par l’Ancien : la provenance d’un prop ne suffit pas à attribuer son usage à un plan. |
| film-samplecase | AVP2004-148 / 167 | Conteneurs de glace et sachets de prélèvement : la mallette commune ne représente pas chaque contenant. |
| generator | AVP2004-117 / 118 / 146 | Machine, tête et console de forage : références à résoudre ; l’expédition trouve le tunnel déjà ouvert. |
| scar-unmasked | AVP2004-034 / 036 / 039 | Sans masque, marqué et mort : états distincts ; une rotation du même dessin n’est pas une recette de chaque état. |
| queen | AVP2004-044 / 064 / 065 | Reine entravée/libre/submergée : chaînes, ovipositeur, poses et animation à qualifier. |
| film-g36c / film-desert-eagle | AVP2004-101/102 et 103/104 | Arme et accessoires attachés : une image ne certifie ni toutes les configurations ni leur propriété. |
| relief | AVP2004-140 / 159 / 249 | Travail reliefs PR74 déjà en cours ; aucune traduction authentifiée de glyphes ne peut être déduite d’une génération. |

## Portes, murs et interconnexions

Le contrôle statique a réellement été exécuté localement sur la base ci-dessus avant l’indisponibilité de l’environnement : fonction `AVP_CORE.blocked`, rayon15 et grille8. Résultat observé : aucune erreur. Les 104 destinations et faces réciproques existent, les niveaux sont cohérents, 43 salles sont reliées à maru sans appliquer les jalons. Les zones d’interaction sont libres et reliées dans chaque salle ; les arrivées safePoint sont libres en hybrid/classic ; la bande y144 est libre partout.

Cette preuve porte sur les collisions statiques et le graphe. Elle ne simule pas les dalles mobiles, les phases, les verrous, les priorités d’interaction ou un parcours clavier/navigateur. Elle ne certifie pas la géométrie du film. Le détail de grille du fichier local initial n’était plus relisible après l’arrêt ; les résultats et paramètres effectivement observés sont conservés dans runtime-inventory.json.

Le rendu accroche les seuils latéraux aux murs de retour, les portes arrière de la station/du navire à des façades, et les accès avant à des retours de galerie. Les liens extérieurs sont des chemins, maru/landing un hélicoptère, et le tunnel un accès par corde. `vessel` reste sans porte : l’épilogue scénique ne doit pas être raccordé artificiellement au graphe.

Recette encore requise : ouverture lisible dans le mur, place pour Lex/Scar, absence de prop recouvrant le seuil, arrivée dégagée, aller-retour, reprise de sauvegarde, occultations et changement de phase de la pyramide. Un champ d’ancrage ne remplace pas l’observation du rendu.

## Matrice des44lieux

| ID | Lieu | Qualification | Liens |
| --- | --- | --- | --- |
| maru | Piper Maru · Pont | Lieu / fonction du film, dimensions adaptées | brief, gear, landing, bridge |
| brief | Salle des cartes | Raccord ou annexe de gameplay original | maru |
| gear | Local d’expédition | Raccord ou annexe de gameplay original | maru |
| landing | Bouvetøya · Zone d’arrivée | Lieu / fonction du film, dimensions adaptées | maru, station |
| station | Station baleinière · Rue centrale | Lieu / fonction du film, dimensions adaptées | landing, office, workshop, infirmary, bore, tanks, engine |
| office | Bureau du contremaître | Raccord ou annexe de gameplay original | station, tower, dormitory |
| workshop | Atelier des baleiniers | Raccord ou annexe de gameplay original | station, mess, cellar |
| bore | Tunnel thermique | Lieu / fonction du film, dimensions adaptées | station, forecourt |
| forecourt | Pyramide · Parvis enfoui | Lieu / fonction du film, dimensions adaptées | bore, vestibule |
| vestibule | Vestibule des trois peuples | Raccord ou annexe de gameplay original | forecourt, sacrifice, pivot, balcony |
| sacrifice | Chambre des sacrifices | Lieu / fonction du film, dimensions adaptées | vestibule, ossuary |
| ossuary | Ossuaire | Lieu / fonction du film, dimensions adaptées | sacrifice, weapons |
| weapons | Chambre des armes | Lieu / fonction du film, dimensions adaptées | ossuary, pivot |
| pivot | Croisée mobile | Lieu / fonction du film, dimensions adaptées | weapons, press, vestibule, weights, shaft |
| press | Couloir de l’étau | Lieu / fonction du film, dimensions adaptées | pivot, duel, weights |
| duel | Salle du filet | Lieu / fonction du film, dimensions adaptées | press, glyphs, cloister |
| glyphs | Galerie du rite | Lieu / fonction du film, dimensions adaptées | duel, refuge, hunter, astrarium |
| refuge | Dernier abri | Raccord ou annexe de gameplay original | glyphs, trophies, balcony |
| hunter | Hall du chasseur | Lieu / fonction du film, dimensions adaptées | glyphs, service |
| service | Passage sous les dalles | Raccord ou annexe de gameplay original | hunter, nursery, incubator |
| nursery | Nurserie | Lieu / fonction du film, dimensions adaptées | service, queenhold, trophies, incubator, gantry, cocoonhall |
| queenhold | Chambre de la Reine | Lieu / fonction du film, dimensions adaptées | nursery, gantry |
| tanks | Cuves de la station | Lieu / fonction du film, dimensions adaptées | station, icebattle |
| icebattle | Bord de la banquise | Lieu / fonction du film, dimensions adaptées | tanks, elder |
| elder | Le jugement des chasseurs | Lieu / fonction du film, dimensions adaptées | icebattle |
| vessel | Vaisseau · Épilogue | Lieu / fonction du film, dimensions adaptées | Épilogue scénique |
| infirmary | Infirmerie de la station | Raccord ou annexe de gameplay original | station |
| trophies | Galerie des trophées | Raccord ou annexe de gameplay original | refuge, nursery |
| engine | Station · Salle des machines | Raccord ou annexe de gameplay original | station, cellar |
| tower | Station · Tour radio | Raccord ou annexe de gameplay original | office |
| weights | Salle des contrepoids | Raccord ou annexe de gameplay original | pivot, press, cloister |
| astrarium | Chambre des cycles | Raccord ou annexe de gameplay original | glyphs |
| incubator | Conduite d’incubation | Raccord ou annexe de gameplay original | service, nursery, drain, eggworks |
| gantry | Passerelle des entraves | Raccord ou annexe de gameplay original | nursery, queenhold, drain |
| dormitory | Station · Dortoir des baleiniers | Raccord ou annexe de gameplay original | office, mess |
| mess | Station · Réfectoire | Raccord ou annexe de gameplay original | dormitory, workshop |
| cellar | Station · Cave des réserves | Raccord ou annexe de gameplay original | engine, workshop |
| balcony | Pyramide · Balcon des bâtisseurs | Raccord ou annexe de gameplay original | refuge, vestibule |
| drain | Pyramide · Drain de la citerne | Raccord ou annexe de gameplay original | incubator, gantry |
| cloister | Pyramide · Galerie des niches | Raccord ou annexe de gameplay original | weights, duel |
| bridge | Piper Maru · Passerelle | Lieu / fonction du film, dimensions adaptées | maru |
| shaft | Pyramide · Puits central | Lieu / fonction du film, dimensions adaptées | pivot |
| eggworks | Pyramide · Distribution des œufs | Lieu / fonction du film, dimensions adaptées | incubator |
| cocoonhall | Pyramide · Salle des cocons | Lieu / fonction du film, dimensions adaptées | nursery |

## Matrice exhaustive des250fiches

Les lignes ci-dessous conservent le catalogue historique. Elles ne fusionnent pas les scènes Unrated/supprimées au parcours cinéma. Le JSON porte les descriptions, preuves héritées et références complètes de chacune.

| ID | Catégorie | Élément | Statut | Asset actuel | Rooms / propriétaire |
| --- | --- | --- | --- | --- | --- |
| AVP2004-001 | Personnage | Alexa 'Lex' Woods | ACTIF | lex | maru, station, hunter, elder / Lex |
| AVP2004-002 | Personnage | Sebastian de Rosa | ACTIF | sebastian | forecourt, glyphs / Sebastian |
| AVP2004-003 | Personnage | Charles Bishop Weyland | SCENE | weyland | brief, refuge / Weyland |
| AVP2004-004 | Personnage | Maxwell Stafford | SCENE | stafford | brief, weapons / Stafford |
| AVP2004-005 | Personnage | Graeme Miller | SCENE | miller | gear, station, cocoonhall / Miller |
| AVP2004-006 | Personnage | Mark Verheiden | SCENE | verheiden | weapons, cocoonhall / Verheiden |
| AVP2004-007 | Personnage | Joe Connors | SCENE | connors | station / Connors |
| AVP2004-008 | Personnage | Rusten Quinn | SCENE | quinn | station, bore / Quinn |
| AVP2004-009 | Personnage | Adele Rousseau | SCENE | rousseau | landing, sacrifice / Rousseau |
| AVP2004-010 | Personnage | Thomas Parks | SCENE | parks | landing, sacrifice / Parks |
| AVP2004-011 | Personnage | Stone | ABSENT | — | — / Non affecté |
| AVP2004-012 | Personnage | Sven | ABSENT | — | — / Non affecté |
| AVP2004-013 | Personnage | Juan Ramirez | ABSENT | — | — / Non affecté |
| AVP2004-014 | Personnage | Mikkel | ABSENT | — | — / Non affecté |
| AVP2004-015 | Personnage | Bass | ABSENT | — | — / Non affecté |
| AVP2004-016 | Personnage | Karl | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-017 | Personnage | Quinn's assistant / drilling crew member | ABSENT | — | — / Non affecté |
| AVP2004-018 | Personnage | Piper Maru captain | ABSENT | — | — / Non affecté |
| AVP2004-019 | Personnage | Piper Maru crew | ABSENT | — | — / Non affecté |
| AVP2004-020 | Personnage | Weyland expedition team | SCENE | stafford | brief, landing, sacrifice / Expédition |
| AVP2004-021 | Personnage | 1904 whaling station inhabitants | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-022 | Personnage | 1904 whaling captain / armed survivor | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-023 | Personnage | 1904 woman and child | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-024 | Personnage | Italian archaeologists at dig site — libellé hérité non validé | ABSENT | — | — / Non affecté |
| AVP2004-025 | Personnage | Mexico satellite-control technicians | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-026 | Personnage | Pizza delivery man | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-027 | Personnage | Scar Predator | ACTIF | scar | hunter, service, nursery, icebattle / Scar |
| AVP2004-028 | Personnage | Celtic Predator | SCENE | celtic | duel / Celtic |
| AVP2004-029 | Personnage | Chopper Predator | SCENE | chopper | duel / Chopper |
| AVP2004-030 | Personnage | Elder Predator | SCENE | elder | elder / Ancien |
| AVP2004-031 | Personnage | Ancient Predator leader | ABSENT | — | — / Non affecté |
| AVP2004-032 | Personnage | Ancient Predator hunters | ABSENT | — | — / Non affecté |
| AVP2004-033 | Personnage | Predator mothership crew | ABSENT | — | — / Non affecté |
| AVP2004-034 | Personnage | Scar Predator unmasked | SCENE | scar-unmasked | station, icebattle, elder / Scar |
| AVP2004-035 | Personnage | Scar Predator acid-burned | A_VERIFIER | — | — / Référence |
| AVP2004-036 | Personnage | Scar Predator marked with Alien blood | SCENE | scar-unmasked | station, icebattle, elder / Scar |
| AVP2004-037 | Personnage | Celtic Predator unmasked | A_VERIFIER | — | — / Référence |
| AVP2004-038 | Personnage | Chopper Predator defeated | SCENE | chopper | duel / Chopper |
| AVP2004-039 | Personnage | Scar Predator corpse | SCENE | scar-unmasked | elder, vessel / Scar |
| AVP2004-040 | Personnage | Lex's sister | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-041 | Personnage | Weyland aboard the icebreaker | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-042 | Personnage | Klaus | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-043 | Personnage | Teenagers discussing the heat bloom | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-044 | Xénomorphe / biologie | Alien Queen | ACTIF | queen | queenhold, icebattle / Reine |
| AVP2004-045 | Xénomorphe / biologie | Grid Alien | ACTIF | grid | duel / Grid |
| AVP2004-046 | Xénomorphe / biologie | Pyramid Alien warriors | ACTIF | xeno | press, nursery / Xénomorphes |
| AVP2004-047 | Xénomorphe / biologie | Predalien chestburster | SCENE | film-newborn | vessel / Predalien juvénile |
| AVP2004-048 | Xénomorphe / biologie | Ovomorph egg | ACTIF | eggs | nursery, eggworks / Cycle xénomorphe |
| AVP2004-049 | Xénomorphe / biologie | Ovomorph closed | ACTIF | eggs | nursery, eggworks / Cycle xénomorphe |
| AVP2004-050 | Xénomorphe / biologie | Ovomorph opening | ACTIF | eggs | nursery, eggworks / Cycle xénomorphe |
| AVP2004-051 | Xénomorphe / biologie | Facehugger | ACTIF | facehugger | nursery, service / Xénomorphes |
| AVP2004-052 | Xénomorphe / biologie | Facehugger swarm | ACTIF | facehugger | nursery, service / Xénomorphes |
| AVP2004-053 | Xénomorphe / biologie | Fossilized facehugger specimen | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-054 | Xénomorphe / biologie | Chestburster | ABSENT | — | — / Non affecté |
| AVP2004-055 | Xénomorphe / biologie | Adult Alien inner jaw | DOCUMENT | xeno | — / Xénomorphes |
| AVP2004-056 | Xénomorphe / biologie | Adult Alien tail | ACTIF | xeno | press, nursery / Xénomorphes |
| AVP2004-057 | Xénomorphe / biologie | Alien dorsal tubes | SCENE | xeno | press, nursery / Xénomorphes |
| AVP2004-058 | Xénomorphe / biologie | Alien claws and feet | SCENE | xeno | press, nursery / Xénomorphes |
| AVP2004-059 | Xénomorphe / biologie | Alien acid blood | ACTIF | resin | nursery, service / Xénomorphes |
| AVP2004-060 | Xénomorphe / biologie | Alien hive resin | ACTIF | resin | nursery, service / Xénomorphes |
| AVP2004-061 | Xénomorphe / biologie | Cocooned human host | SCENE | cocoon | cocoonhall, nursery, sacrifice / Hôtes |
| AVP2004-062 | Xénomorphe / biologie | Queen ovipositor and egg sac | SCENE | film-ovipositor | queenhold / Reine |
| AVP2004-063 | Xénomorphe / biologie | Queen chains and restraint wounds | SCENE | film-queen-hoist | queenhold / Reine |
| AVP2004-064 | Xénomorphe / biologie | Queen freed from restraints | ACTIF | queen | queenhold, icebattle / Reine |
| AVP2004-065 | Xénomorphe / biologie | Queen under ice / underwater | ACTIF | queen | queenhold, icebattle / Reine |
| AVP2004-066 | Xénomorphe / biologie | Ancient xenomorph horde | ABSENT | — | — / Non affecté |
| AVP2004-067 | Xénomorphe / biologie | Sacrificial chamber hosts | SCENE | cocoon | cocoonhall, nursery, sacrifice / Hôtes |
| AVP2004-068 | Xénomorphe / biologie | Alien skeleton remains | SCENE | bones | ossuary, trophies / Restes |
| AVP2004-069 | Xénomorphe / biologie | Alien trophy skull | SCENE | bones | ossuary, trophies / Restes |
| AVP2004-070 | Xénomorphe / biologie | Grid Alien severed finger trophy | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-071 | Xénomorphe / biologie | Grid Alien reaches the surface | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-072 | Équipement | Scar biomask | SCENE | scar | hunter, icebattle / Scar |
| AVP2004-073 | Équipement | Celtic biomask | SCENE | celtic | duel / Celtic |
| AVP2004-074 | Équipement | Chopper biomask | SCENE | chopper | duel / Chopper |
| AVP2004-075 | Équipement | Elder biomask | A_VERIFIER | — | — / Ancien |
| AVP2004-076 | Équipement | Ancient Predator biomask | A_VERIFIER | — | — / Yautja anciens |
| AVP2004-077 | Arme | Plasmacaster / shoulder cannon | ACTIF | film-caster | weapons, hunter, nursery / Scar |
| AVP2004-078 | Équipement | Plasmacaster shoulder mount | ACTIF | film-caster | weapons, hunter, nursery / Scar |
| AVP2004-079 | Équipement | Triple-dot laser targeting system | ACTIF | film-caster | weapons, hunter, nursery / Scar |
| AVP2004-080 | Arme | Wrist blades | SCENE | celtic | duel, hunter, elder / Yautja |
| AVP2004-081 | Arme | Chopper extended wrist blades | SCENE | chopper | duel / Chopper |
| AVP2004-082 | Arme | Celtic netgun | SCENE | film-netgun | duel, hunter, elder / Yautja |
| AVP2004-083 | Arme | Netgun projectile mesh | SCENE | net | duel, hunter, elder / Yautja |
| AVP2004-084 | Arme | Combistick | SCENE | film-combistick | duel, hunter, elder / Yautja |
| AVP2004-085 | Arme | Collapsible shuriken | SCENE | film-shuriken | duel, hunter, elder / Yautja |
| AVP2004-086 | Arme | Ceremonial dagger | SCENE | film-dagger | duel, hunter, elder / Yautja |
| AVP2004-087 | Équipement | Self-destruct wrist device | ACTIF | film-wrist-unit | queenhold / Scar |
| AVP2004-088 | Équipement | Wrist computer | ACTIF | film-wrist-unit | queenhold / Scar |
| AVP2004-089 | Équipement | Cloaking device | DOCUMENT | scar | hunter / Yautja |
| AVP2004-090 | Équipement | Thermal vision mode | DOCUMENT | scar | hunter / Yautja |
| AVP2004-091 | Équipement | Alien vision mode | DOCUMENT | scar | hunter / Yautja |
| AVP2004-092 | Équipement | Predator medical kit | A_VERIFIER | — | — / Yautja |
| AVP2004-093 | Équipement | Blue medical fluid / coagulant | A_VERIFIER | — | — / Yautja |
| AVP2004-094 | Équipement | Medical stapler / surgical tool | A_VERIFIER | — | — / Yautja |
| AVP2004-095 | Équipement | Ritual marking knife | A_VERIFIER | — | — / Marquage |
| AVP2004-096 | Équipement | Shoulder-cannon sarcophagus / weapon case | SCENE | sarcophagus | weapons / Pyramide |
| AVP2004-097 | Équipement | Predator trophy necklace | SCENE | elder | duel, hunter, elder / Yautja |
| AVP2004-098 | Équipement | Elder's ceremonial spear gift | SCENE | film-combistick | elder / Ancien → Lex |
| AVP2004-099 | Arme | Alien tail spear | ACTIF | film-tail-spear | hunter, icebattle / Lex |
| AVP2004-100 | Arme | Alien head shield | ACTIF | film-shield | hunter, icebattle / Lex |
| AVP2004-101 | Arme | Heckler & Koch G36C expedition rifle | SCENE | film-g36c | gear, landing, sacrifice, weapons / Sécurité de l’expédition |
| AVP2004-102 | Arme | Modified G36C with optics and lights | SCENE | film-g36c | gear, landing, sacrifice, weapons / Sécurité de l’expédition |
| AVP2004-103 | Arme | IMI Desert Eagle Mark VII | SCENE | film-desert-eagle | gear, weapons, cocoonhall / Sécurité / Miller |
| AVP2004-104 | Arme | Desert Eagle green laser sight | SCENE | film-desert-eagle | gear, weapons, cocoonhall / Sécurité / Miller |
| AVP2004-105 | Arme | Beretta 84FS Cheetah | SCENE | film-beretta | gear / Équipe armée |
| AVP2004-106 | Arme | SPSh-44 flare pistol | SCENE | film-flare-pistol | gear / Expédition |
| AVP2004-107 | Arme | Flare cartridge | SCENE | film-flare-pistol | gear / Expédition |
| AVP2004-108 | Arme | Lex's ice axe | ACTIF | film-iceaxe | gear, station / Lex |
| AVP2004-109 | Arme | Climbing piton gun | ACTIF | film-piton | gear, tanks, icebattle / Lex |
| AVP2004-110 | Arme | Piton cable and anchor | ACTIF | film-piton | gear, tanks, icebattle / Lex |
| AVP2004-111 | Arme | Expedition combat knife | SCENE | film-dagger | gear / Sécurité |
| AVP2004-112 | Arme | Improvised torch / flare | ACTIF | film-flare | gear, nursery / Lex |
| AVP2004-113 | Véhicule / structure | Piper Maru icebreaker | SCENE | — | maru, bridge / Piper Maru |
| AVP2004-114 | Véhicule / structure | Weyland expedition helicopter | SCENE | film-helicopter | maru, landing / Expédition |
| AVP2004-115 | Véhicule / structure | Snowcat tracked vehicle | SCENE | film-snowcat | landing / Expédition |
| AVP2004-116 | Véhicule / structure | Expedition snowmobiles | A_VERIFIER | — | — / Expédition |
| AVP2004-117 | Véhicule / structure | Thermal drill rig | A_VERIFIER | generator | station, bore / Quinn / expédition |
| AVP2004-118 | Véhicule / structure | Drill-head assembly | A_VERIFIER | generator | station, bore / Quinn / expédition |
| AVP2004-119 | Véhicule / structure | Predator mothership | SCENE | — | elder / Yautja |
| AVP2004-120 | Véhicule / structure | Predator drop pods / entry capsules | SCENE | film-drop-pod | landing / Yautja |
| AVP2004-121 | Véhicule / structure | Predator ancient spacecraft | ABSENT | — | — / Yautja anciens |
| AVP2004-122 | Véhicule / structure | Predator ceremonial recovery craft | A_VERIFIER | — | — / Yautja |
| AVP2004-123 | Véhicule / structure | Pyramid elevator / rotating transport chamber | SCENE | film-egg-rail | eggworks, pivot / Pyramide |
| AVP2004-124 | Véhicule / structure | Alien Queen rising platform | SCENE | film-queen-hoist | queenhold / Pyramide |
| AVP2004-125 | Équipement | Weyland arctic expedition parka | SCENE | weyland | brief, refuge / Weyland |
| AVP2004-126 | Équipement | Lex Woods climbing suit | SCENE | lex | maru, station, hunter / Lex |
| AVP2004-127 | Équipement | Sebastian de Rosa expedition clothing | SCENE | sebastian | forecourt, glyphs / Sebastian |
| AVP2004-128 | Équipement | Weyland breathing apparatus | SCENE | weyland | brief, refuge / Weyland |
| AVP2004-129 | Équipement | Weyland inhaler / oxygen device | SCENE | weyland | brief, refuge / Weyland |
| AVP2004-130 | Équipement | Security tactical vest | SCENE | verheiden | landing, weapons / Sécurité |
| AVP2004-131 | Équipement | Headlamp | ACTIF | lex | gear, nursery / Lex |
| AVP2004-132 | Équipement | Handheld flashlight | DOCUMENT | — | — / Expédition |
| AVP2004-133 | Équipement | Climbing harness | ACTIF | lex | gear, bore / Lex |
| AVP2004-134 | Équipement | Climbing rope | ACTIF | rope | bore / Lex / équipe |
| AVP2004-135 | Équipement | Carabiners and pitons | SCENE | anchor | gear, bore / Lex / équipe |
| AVP2004-136 | Équipement | Satellite thermal-imaging display | SCENE | thermalmap | brief, bridge / Expédition |
| AVP2004-137 | Équipement | Portable archaeological scanner | SCENE | film-scanner | brief, gear / Scientifiques |
| AVP2004-138 | Équipement | Chemical analysis kit | SCENE | film-analysis-kit | gear / Miller |
| AVP2004-139 | Équipement | Field notebook and archaeological notes | SCENE | film-notebook | brief, glyphs / Sebastian |
| AVP2004-140 | Équipement | Pyramid map and translated glyphs | SCENE | relief | glyphs / Sebastian |
| AVP2004-141 | Équipement | Expedition radio headset | SCENE | film-headset | gear, bridge / Équipe |
| AVP2004-142 | Équipement | Piper Maru communications console | SCENE | film-radio-console | brief, bridge / Équipe / navire |
| AVP2004-143 | Équipement | Portable video camera | SCENE | film-video | gear / Équipe |
| AVP2004-144 | Équipement | Body camera / helmet camera | DOCUMENT | — | — / Expédition |
| AVP2004-145 | Équipement | Medical first-aid kit | ACTIF | medkit | infirmary, gear / Équipe / Lex |
| AVP2004-146 | Équipement | Thermal drill control console | A_VERIFIER | generator | station, bore / Quinn / expédition |
| AVP2004-147 | Équipement | Drill operator protective gear | A_VERIFIER | — | — / Quinn |
| AVP2004-148 | Équipement | Ice sample containers | SCENE | film-samplecase | gear / Miller |
| AVP2004-149 | Équipement | Satellite phone | SCENE | film-satphone | bridge / Navire / expédition |
| AVP2004-150 | Équipement | Expedition backpacks | SCENE | gear | gear / Expédition |
| AVP2004-151 | Équipement | Portable flares | ACTIF | film-flare | gear, nursery / Lex |
| AVP2004-152 | Équipement | Emergency beacon | SCENE | film-beacon | landing / Expédition |
| AVP2004-153 | Équipement | Weyland Industries ID badges | SCENE | stafford | brief, landing / Expédition |
| AVP2004-154 | Équipement | Pyramid stone pressure plates | ACTIF | slab | pivot, press / Pyramide |
| AVP2004-155 | Équipement | Sacrificial restraint table | SCENE | altar | sacrifice / Pyramide |
| AVP2004-156 | Équipement | Egg delivery rails and cradles | SCENE | film-egg-rail | eggworks / Pyramide |
| AVP2004-157 | Équipement | Predator weapon pedestal | SCENE | sarcophagus | weapons / Pyramide |
| AVP2004-158 | Équipement | Ancient calendar dial | ACTIF | calendar | astrarium / Pyramide |
| AVP2004-159 | Équipement | Hieroglyph panels | SCENE | relief | glyphs / Pyramide |
| AVP2004-160 | Équipement | Stone sarcophagi | SCENE | sarcophagus | weapons / Pyramide |
| AVP2004-161 | Équipement | Whaling station tools | SCENE | toolrack | workshop / Baleiniers |
| AVP2004-162 | Équipement | Whaling hooks and chains | SCENE | hook | station, workshop / Baleiniers |
| AVP2004-163 | Équipement | Ice tunnel lighting rig | SCENE | worklamp | bore / Expédition |
| AVP2004-164 | Équipement | Expedition food and ration packs | DOCUMENT | — | — / Expédition |
| AVP2004-165 | Équipement | Cold-weather goggles | SCENE | gear | gear / Expédition |
| AVP2004-166 | Équipement | Gloves and insulated boots | SCENE | lex | station / Expédition |
| AVP2004-167 | Équipement | Archaeological specimen bags | SCENE | film-samplecase | gear / Miller |
| AVP2004-168 | Autre / lieu / scène | Bouvetøya / Bouvet Island | LIEU | — | landing / Décor |
| AVP2004-169 | Autre / lieu / scène | Abandoned whaling station | LIEU | — | station / Décor |
| AVP2004-170 | Autre / lieu / scène | Weyland expedition camp | LIEU | — | landing / Décor |
| AVP2004-171 | Autre / lieu / scène | Thermal borehole | LIEU | — | bore / Décor |
| AVP2004-172 | Autre / lieu / scène | Underground pyramid exterior | LIEU | — | forecourt / Décor |
| AVP2004-173 | Autre / lieu / scène | Pyramid entrance chamber | LIEU | — | vestibule / Décor |
| AVP2004-174 | Autre / lieu / scène | Sacrificial chamber | LIEU | — | sacrifice / Décor |
| AVP2004-175 | Autre / lieu / scène | Queen chamber | LIEU | — | queenhold / Décor |
| AVP2004-176 | Autre / lieu / scène | Egg chamber | LIEU | — | eggworks / Décor |
| AVP2004-177 | Autre / lieu / scène | Predator weapons chamber | LIEU | — | weapons / Décor |
| AVP2004-178 | Autre / lieu / scène | Shifting corridors | LIEU | — | pivot / Décor |
| AVP2004-179 | Autre / lieu / scène | Central shaft | LIEU | — | shaft / Décor |
| AVP2004-180 | Autre / lieu / scène | Ancient hieroglyph hall | LIEU | — | glyphs / Décor |
| AVP2004-181 | Autre / lieu / scène | Predator trophy room / burial area | LIEU | — | trophies / Décor |
| AVP2004-182 | Autre / lieu / scène | Whaling station interior | LIEU | — | office / Décor |
| AVP2004-183 | Autre / lieu / scène | Ice field final battleground | LIEU | — | icebattle / Décor |
| AVP2004-184 | Autre / lieu / scène | Predator mothership interior | SCENE | — | vessel / Décor |
| AVP2004-185 | Autre / lieu / scène | 1904 whaling station massacre | A_VERIFIER | — | — / Référence |
| AVP2004-186 | Autre / lieu / scène | Satellite heat-bloom discovery | SCENE | film-radio-console | brief / Relevés |
| AVP2004-187 | Autre / lieu / scène | Expedition recruitment montage | ABSENT | — | — / Recrutement |
| AVP2004-188 | Autre / lieu / scène | Descent through the borehole | SCENE | — | bore / Récit |
| AVP2004-189 | Autre / lieu / scène | Predators recover the plasmacasters | ABSENT | — | — / Non affecté |
| AVP2004-190 | Autre / lieu / scène | Celtic Predator vs Grid Alien | SCENE | — | duel / Récit |
| AVP2004-191 | Autre / lieu / scène | Chopper Predator ambush | SCENE | — | duel / Récit |
| AVP2004-192 | Autre / lieu / scène | Scar and Lex alliance | SCENE | — | hunter / Récit |
| AVP2004-193 | Autre / lieu / scène | Scar marks himself with acid blood | SCENE | — | hunter / Récit |
| AVP2004-194 | Autre / lieu / scène | Weyland confronts Scar | SCENE | — | refuge / Récit |
| AVP2004-195 | Autre / lieu / scène | Sebastian facehugged | SCENE | — | nursery / Récit |
| AVP2004-196 | Autre / lieu / scène | Queen breaks free | SCENE | — | queenhold / Récit |
| AVP2004-197 | Autre / lieu / scène | Pyramid self-destruction | SCENE | — | forecourt / Récit |
| AVP2004-198 | Autre / lieu / scène | Surface battle with the Queen | SCENE | — | icebattle / Récit |
| AVP2004-199 | Autre / lieu / scène | Lex receives the Elder's spear | SCENE | — | elder / Récit |
| AVP2004-200 | Autre / lieu / scène | Predalien emergence | SCENE | — | vessel / Récit |
| AVP2004-201 | Autre / lieu / scène | Ancient human sacrifice flashback | ABSENT | — | — / Récit |
| AVP2004-202 | Autre / lieu / scène | Predator pyramid construction myth | SCENE | — | glyphs / Récit |
| AVP2004-203 | Autre / lieu / scène | Ancient civilization glyphs | SCENE | — | glyphs / Récit |
| AVP2004-204 | Autre / lieu / scène | Weyland Industries expedition logo | SCENE | — | gear / Récit |
| AVP2004-205 | Autre / lieu / scène | Predator clan symbols | SCENE | — | weapons / Récit |
| AVP2004-206 | Autre / lieu / scène | Alien hive cocoon wall | SCENE | cocoon | cocoonhall, nursery, sacrifice / Hôtes |
| AVP2004-207 | Autre / lieu / scène | Pyramid rotating-block mechanism | SCENE | — | pivot / Récit |
| AVP2004-208 | Autre / lieu / scène | Pyramid countdown cycle | SCENE | — | pivot / Récit |
| AVP2004-209 | Autre / lieu / scène | Ice collapse and Queen submersion | SCENE | — | icebattle / Récit |
| AVP2004-210 | Autre / lieu / scène | Piper Maru deck | LIEU | film-radio-console | maru, bridge / Piper Maru |
| AVP2004-211 | Autre / lieu / scène | Piper Maru bridge | LIEU | film-radio-console | maru, bridge / Piper Maru |
| AVP2004-212 | Autre / lieu / scène | Ice landing zone | LIEU | film-helicopter | maru, landing / Expédition |
| AVP2004-213 | Autre / lieu / scène | Quinn drilling accident / shaft incident | ABSENT | — | — / Récit |
| AVP2004-214 | Autre / lieu / scène | Alien acid melting restraints | SCENE | — | queenhold / Récit |
| AVP2004-215 | Autre / lieu / scène | Lex's final scar/mark | SCENE | — | elder / Récit |
| AVP2004-216 | Autre / lieu / scène | 1904 prologue opening | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-217 | Autre / lieu / scène | Pizza delivery introduction | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-218 | Autre / lieu / scène | Other Mexico / satellite-control extension | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-219 | Autre / lieu / scène | Beakers | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-220 | Autre / lieu / scène | Predators split up | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-221 | Autre / lieu / scène | Doctor line | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-222 | Autre / lieu / scène | Connor death extension | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-223 | Autre / lieu / scène | Making History | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-224 | Autre / lieu / scène | Teenager explanation | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-225 | Autre / lieu / scène | Predator humor beat | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-226 | Autre / lieu / scène | Additional CGI blood | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-227 | Autre / lieu / scène | The Sister | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-228 | Autre / lieu / scène | Weyland on Ice Breaker | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-229 | Autre / lieu / scène | Predators waking up | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-230 | Autre / lieu / scène | Predator ship | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-231 | Autre / lieu / scène | O Sole Mio | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-232 | Autre / lieu / scène | Klaus & Quinn | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-233 | Autre / lieu / scène | Scar turns | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-234 | Autre / lieu / scène | Score One for Beakers | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-235 | Autre / lieu / scène | Miller Gets Caught | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-236 | Autre / lieu / scène | Crawling Facehugger | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-237 | Autre / lieu / scène | Love Scene | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-238 | Autre / lieu / scène | Looking for Targets in Hive | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-239 | Autre / lieu / scène | Sebastian facehugged — alternate/extended | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-240 | Autre / lieu / scène | Grid vs Scar | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-241 | Autre / lieu / scène | Grid reaches surface | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-242 | Autre / lieu / scène | Scar tail spear | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-243 | Autre / lieu / scène | Grid finger trophy | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-244 | Autre / lieu / scène | Scar & Predalien chestburster | HORS_CAMPAGNE | — | — / Non affecté |
| AVP2004-245 | Équipement | Whaling station household props | SCENE | diningtable | dormitory, mess / Baleiniers |
| AVP2004-246 | Équipement | Expedition crates and cases | SCENE | crate | gear, landing / Expédition |
| AVP2004-247 | Équipement | Piper Maru maritime equipment | SCENE | lifering | maru / Navire |
| AVP2004-248 | Équipement | Pyramid stone debris and rubble | SCENE | rubble | forecourt, shaft / Pyramide |
| AVP2004-249 | Équipement | Ancient ritual ornaments | SCENE | relief | trophies / Pyramide |
| AVP2004-250 | Équipement | Expedition medical consumables | ACTIF | medkit | infirmary, gear / Équipe / Lex |

## Ordre de production proposé

Priorité aux absences et aux variantes réellement distinctes : chestburster standard054, silhouette détaillée Snowcat115, coques Piper Maru113 et vaisseau119, séparation du couteau humain111 et de la dague086, attribution de la lance084/098. Les personnages secondaires ne reçoivent pas un visage générique sans identification. Les lieux de recrutement/flashback gardent une transition narrative et une version explicite.

Les candidats de reliefs159/249 de PR74 restent un chantier distinct ; ils ne sont pas compris dans les145SVG de cette base. La bible de reprise PR68 demandait déjà des PNG individuels par asset/pose, profil latéral2D et directionTantalus, et distinguait candidat → admis → chargé → raccordé → observé. Ces décisions sont conservées.

## Raccord technique à préserver

Le moteur AVP charge actuellement les SVG via assets.js et un HTML autonome reconstruit. Ajouter un PNG dans un dossier ne le charge pas dans le jeu. Toute activation doit passer par le vrai registre/chargeur, le fallback, le build/distribution, les manifestes et les contrôles d’admission, avec une succession de hashes exacte. Conserver le schéma de sauvegarde, les identifiants et les destins narratifs. Aucune conversion vers le moteur natif Tantalus n’est implicitement livrée par ces documents.

Les spécifications individuelles associées précisent les pièces, variantes, propriétaires, phases, animations et critères de recette. Leur existence constitue du travail de production et de documentation ; le raccord runtime et la qualification visuelle restent des étapes distinctes.
