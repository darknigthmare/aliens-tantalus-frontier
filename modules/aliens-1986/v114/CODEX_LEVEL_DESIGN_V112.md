# CODEX LEVEL DESIGN — ALIENS V112 / Baliser le repli

Suite autonome V111. Deux lieux et trois raccords nouveaux. Cinq objectifs locaux conservés ; aucune fusion aux 64 salles natives.

## Règles de conception

### 01 — Étendre un trajet sans allonger la liste des objectifs

V112 conserve les huit lieux hérités et ajoute l’atelier optique puis la coursive des conduites. Dix inspections, neuf lieux de l’opération, onze liaisons réciproques et cinq objectifs locaux. Deux nouveaux contacts sont catalogués dans la dérivation. Aucun objectif obligatoire nouveau : la collecte des balises et ce trajet restent facultatifs.

### 02 — Un stock est un objet du niveau

Chaque réserve a un identifiant, une emprise métallique au sol, un point de travail, une portée et une quantité finie. La desserte bloque corps et balles. L’interaction ignore uniquement son propre support dans le rayon de travail, jamais les cloisons ou les autres meubles. Les scellés prennent 1,05 seconde à ouvrir ; les réserves ne sont créditées qu’au bout du geste.

### 03 — Conservation exacte des ressources

Les trois stocks apportent trois lots personnels, deux trousses et une cartouche pour sentinelle. Inventaire restant + ressources dépensées doit toujours correspondre à la somme des stocks effectivement ouverts. Aucun objet n’est gagné à l’entrée d’une pièce, à l’inspection suivante ou au chargement. Une caisse déjà récupérée reste ouverte et vide.

### 04 — Soigner un acteur présent

Le soin dure 1,6 seconde, exige un allié vivant et proche, et rend au maximum 30 PV, sans dépasser 100. Il consomme une trousse seulement à son achèvement. Newt peut être soignée une fois recrutée ; elle ne reçoit pas d’arme. Aucun soin ne ressuscite un acteur, ne répare une tourelle ou ne cible un équipier dans une autre pièce.

### 05 — Ravitailler ne signifie pas recharger gratuitement

Un lot personnel donne 18 cartouches en 0,85 seconde, avec plafond de 96. Une cartouche de sentinelle ajoute 40 coups en 1,35 seconde, plafond de 120. Le transfert n’a lieu que si un manque existe et si l’objet de réserve correspondant est réellement disponible. La sentinelle conserve ses tirs à ligne dégagée et n’a aucun rechargement automatique.

### 06 — Le travail reste exposé

Marcher, tirer, quitter la portée, subir un impact ou changer les données de la cible interrompt le geste. Le joueur et la cible ne doivent pas se déplacer ou tirer pendant l’assistance ; seul l’allié aidé est momentanément immobilisé, pas le reste de l’escouade. Un nouvel ordre à cet allié annule le soin. Les contacts continuent de simuler leurs attaques ; la pause seule suspend globalement le temps.

### 07 — Reprendre au milieu d’un soin

L’export contient durée, temps effectué, positions de départ, santé et munitions observées. L’import vérifie ces données contre l’état physique restauré et reprend en pause. Un fichier ne peut pas revendiquer une cible absente, modifier une durée, accorder des ressources inexpliquées ou soigner pendant le chargement. L’action interrompue ne consomme pas sa trousse.

### 08 — Une sirène attire, elle ne crée pas de menace

La commande de diagnostic demande 0,65 seconde, émet pendant 8 secondes et impose un délai total de 20 secondes avant réactivation. Les impulsions suivent le système sonore V108 : chemins libres, atténuation aux passages et limite de deux liaisons. Aucun Xéno n’est créé, tué ou téléporté par le diagnostic. Les contacts encore vivants peuvent chercher le dernier son et entrer par un seuil réellement accessible.

### 09 — Placer correctement la source sonore

Le point de commande peut appartenir au meuble ; l’émetteur de son doit être hors de son volume obstrué. Dans la réserve, la commande est à (1214, 238), l’émetteur à (1170, 238). Un émetteur enfoui dans le cabinet empêchait initialement la propagation par chemin : la géométrie a été corrigée, pas le filtre acoustique contourné.

### 10 — Fermer n’est plus une garantie illimitée

Un sas fermé continue à couper corps, vue et tirs. Un Warrior ne peut le forcer que s’il possède un souvenir valable situé au-delà, ne trouve pas de route ouverte et a réellement atteint la face du battant. Une porte fermée reste inconnue comme cible lorsqu’aucun indice ne guide la créature : pas d’omniscience ni de vague créée par la fermeture.

### 11 — Conserver la menace et les pertes

Treize ennemis et une sentinelle existent dans le catalogue. Douze contacts appartiennent au réseau des neuf lieux de l’opération ; le Sulaco reste isolé en inspection. Une créature qui traverse conserve son identité, sa vie et sa piste. Quitter une pièce ne retire pas un ennemi de la condition de défense. V112 ne fait apparaître aucun contact lors d’un lancer.

### 12 — Respecter le vocabulaire des lieux

La galerie utilise métal bleuté, rideau de fret, palettes, tracteur stationné et portiques. La réserve utilise comptoir médical, casiers, batteries et diagnostic ambre. Leur plan ne doit pas être copié sans fonction : le passage central ouvre une ligne de tir, les grandes masses offrent un contournement et les stocks sont placés après l’exposition, pas sur le point d’arrivée.

### 13 — Un appui graphique doit correspondre à un appui physique

Le tracteur est ancré au volume parked-tug, sans dessin posé artificiellement au-dessus d’une autre caisse. Les chariots de secours et de munitions utilisent leur bodyId. Le moniteur de réserve et la caisse sur palette ont une élévation explicite reliée à leur support. Les objets proches ne dérivent pas avec la caméra ; la parallaxe est réservée aux éléments lointains.

### 14 — Rendre lisible sans cacher le combat

La silhouette, les pieds, le volume de tir et l’emprise au sol utilisent les mêmes coordonnées. Les premiers plans proches sont atténués s’ils cachent un allié, mais conservent leurs collisions. Les scellés ouverts montrent un couvercle et un contenu vide ; la sirène montre un cycle puis un délai. Les textures et personnages sont encore procéduraux, pas des sprites finalisés.

### 15 — Protéger le terrain sur petit écran

Le HUD, le détecteur, les réserves, le génie et les ordres restent hors canvas. À moins de 460 pixels de haut en paysage, Réserves et Génie partagent un emplacement avec deux boutons de commutation ; O/U/J exposent le bon volet. En portrait, les bandes restent accessibles. La carte ne montre aucune identité, position ou santé ennemie. Les formats testés sont émulés, pas des téléphones certifiés.

### 16 — Migrer V109 sans cadeaux

Le validateur V109 doit d’abord accepter la partie source. Les pièces, membres, vies, chargeurs, stocks et objectifs restent identiques. Les nouvelles structures commencent intactes, la réserve de plaques à zéro et la pression ennemie sans préparation en cours. Une visite de maintenance antérieure ne vaut pas collecte de renforts. V108 et V107 passent par leurs vrais validateurs ; V106 reste une inspection.

### 17 — Recette d’un lieu et de son seuil

Vérifier les deux faces avec les gabarits, corps et tirs, fermer devant la piste d’un contact, interrompre une soudure, observer un impact annoncé, reconstruire uniquement à seuil libre, recharger à mi-geste puis finir le repli. Les images seules ne prouvent pas la géométrie. Le raccord aux 64 salles Tantalus exige leurs sources exactes et une recette dédiée.

### 18 — Un battant commun à deux pièces

Les onze liaisons ont chacune une structure unique : intégrité 100, renfort de 0 à 72, état de brèche et compte d’impacts. Les vingt-deux volumes de seuil sont dérivés de ces états partagés. Operations–Atelier et Coursive–Infirmerie commencent fermés ; Atelier–Coursive commence ouvert. La rupture agit sur les deux faces pour corps, vue, tirs, chemins et franchissements.

### 19 — Trois plaques, réellement récupérées

La caisse service-crate est sur la table cable-rack de maintenance. Son point est (837,314), avec 82 unités de portée ; l’approche utilisée par le pilote est (793,314). Seul son support peut être ignoré dans le rayon d’interaction. E prépare la collecte pendant 1,1 seconde, puis crédite exactement trois plaques. Le couvercle reste ouvert et la caisse vide au retour.

### 20 — Souder bloque aussi le joueur

O demande un sas fermé, intact et sans renfort. Après 1,8 seconde immobile, une plaque est dépensée et fournit 72 points de protection. R ne peut pas rouvrir ce sas soudé. Un deuxième renfort est refusé ; cette action n’empile pas les plaques pour créer un mur infini.

### 21 — Découper est un engagement

U découpe le renfort pendant 1,4 seconde puis ouvre le sas. Il ne demande pas de nouvelle plaque et n’en restitue pas. Le renfort et la collision restent en place jusqu’à la fin. Un déplacement, tir ou impact annule la découpe ; le groupe doit toujours effectuer son franchissement normal.

### 22 — Réparer seulement un seuil libre

J reconstitue un battant endommagé ou arraché pendant 2,2 secondes. Il consomme une plaque à la fin, remet 100 d’intégrité, supprime tout renfort résiduel et ferme le sas. Les deux faces et les réservations de franchissement sont testées au début et avant achèvement. Aucun acteur ne peut être enfermé dans le nouveau volume.

### 23 — Pression physique, pas une horloge de destruction

Seuls les Warriors préparent la brèche ; les Facehuggers ne percent pas les battants. Le Warrior atteint sa face de travail, annonce 0,8 seconde, frappe pour 28, puis récupère 0,7 seconde. Le renfort absorbe les chocs avant l’intégrité. À pleine résistance et sans réparation, il faut quatre impacts sans renfort et sept avec une plaque entière. Ces comptes ne sont pas des secondes de survie garanties.

### 24 — Interrompre sans ressources fantômes

Bouger, tirer, perdre des PV, perdre la portée ou subir une variation de structure annule le geste. Aucun débit n’a lieu avant la fin. La pause fige temps et IA ; elle n’accomplit pas le travail. Une préparation ancienne est abandonnée si son sas s’ouvre ou est reconstitué : un coup engagé contre un ancien panneau ne touche pas magiquement le nouveau.

### 25 — Une brèche doit rester visible et franchissable

Le rendu lit les mêmes états : croix soudée, rayures sur les battants touchés, montants déformés et débris non bloquants après rupture. Un battant arraché ne se referme pas avec R ; J est requis. Aucun sprite de porte intacte ni collision invisible ne doit rester devant un passage bréché. Les portes intérieures narratives et le final du Sulaco sont exclus de ce système.

### 26 — Reprendre une pression sans la réinitialiser

Schéma 110 : intégrité et renfort, source des plaques, total dépensé, gestes et attaques préparées sont validés avant toute mutation. Une reprise reste en pause. L’ennemi conserve sa résidence, sa vie et la piste qui justifie l’attaque. Les propres coups du frappeur ne remplacent pas sa mémoire par un son qu’il vient de produire ; les autres contacts peuvent néanmoins les entendre.

### 27 — Un seul circuit, pas deux vérités

Le booléen worlds[room].circuits.service commande les lampes déjà présentes. Il n’existe pas de deuxième registre de lumière qui divergerait au chargement. Le relais réseau de mission n’est pas ce circuit. Couper un service n’ouvre ni ne ferme un sas et ne valide aucun objectif.

### 28 — Manœuvrer à portée réelle

K ou E au contrôle prépare 0,95 seconde avant inversion. La portée, la visibilité du pupitre, la position initiale et la vie sont contrôlées pendant le geste. Marche, tir, coup reçu ou variation du circuit l’interrompent ; K à nouveau annule. La pause ne termine pas l’action.

### 29 — Le cône doit utiliser les cloisons du jeu

La torche L est orientée à la souris ou au sens de marche. Portée 520 unités, demi-angle 0,32 radian, reconnaissance de cible éclairée au-delà du seuil 0,24. Les rayons de rendu et le test de lumière interrogent les mêmes volumes opaques. Les rayons restent dans les limites physiques de la pièce.

### 30 — La torche n’est pas une cape d’invisibilité

Le porteur d’une torche allumée est éclairé près de sa source, même s’il pointe à l’opposé du contact. Un ennemi avec une ligne de vue peut donc le reconnaître. Une lampe éteinte n’efface ni une piste, ni un son récent, ni le désir de forcer un sas.

### 31 — Le noir réduit la reconnaissance, pas les collisions

Dans une pièce sans service, un contact géométriquement visible reste reconnaissable à 120 unités ou moins. Au-delà, la silhouette doit être éclairée. La même règle s’applique aux Marines en couverture, à la sentinelle et aux Xénos. Corps, balles et portes gardent leurs portées et leurs collisions.

### 32 — Le verre n’est pas un mur opaque

Une vitre déclarée transparente laisse passer la vue et la lumière, tout en bloquant corps et projectiles selon ses propriétés. Éteindre l’éclairage ne doit pas rendre les balles perméables au verre. Le faisceau n’est pas un projectile destructeur.

### 33 — Le feu et le travail exposent

Un flash de tir illumine brièvement les alentours pendant 0,18 seconde, rayon maximal 170. Le chalumeau illumine une zone de 105 unités pendant les travaux de sas. Ces sources respectent l’occlusion dans le calcul de reconnaissance. Le rendu lumineux reste une approximation 2D stylisée, pas une illumination globale photoréaliste.

### 34 — Aucune batterie cachée

La torche est un équipement permanent sans batterie consommable dans cette version. Son arbitrage est la discrétion, pas une nouvelle ressource arbitraire. La coupure locale est gratuite et réversible mais prend du temps. Aucun soin, plaque ou chargeur n’est ajouté par la lumière.

### 35 — Une reprise doit conserver le noir

L’éclairage garde son contrat strict. L’enveloppe V112 inclut aussi les dix mondes et les balises. V111 passe d’abord par son propre validateur : tous ses anciens circuits, acteurs, munitions et ressources restent identiques. Les deux lieux nouveaux commencent hors tension, sans balise offerte. La reprise reste en pause et ne simule pas de temps pendant le chargement.

### 36 — Afficher l’information sans révéler une cible

Les contrôles L/K et l’état éclairé/ombre partagent la bande du détecteur hors terrain. La carte n’interroge pas les souvenirs ennemis. L’aide à la visée ne sélectionne que des contacts déjà observés ; aucune cible cachée ne doit apparaître parce que le curseur passe sur ses coordonnées.

### 37 — Une dérivation avec une fonction et deux extrémités

Operations → Atelier optique → Coursive des conduites → Infirmerie forme une autre voie médicale. Les trois raccords sont réellement réciproques, avec seuil et arrivée propres. Ouvrir les deux extrémités fermées prend le temps normal et laisse passer les contacts ; la dérivation n’est pas un bouton de téléportation.

### 38 — L’atelier : calibrer, stocker, puis laisser circuler

La partition centrale protège deux moitiés distinctes ; l’armoire, les bancs et la baie de calibration servent de supports et de masses de contournement. Le stock n’est pas sur le point d’arrivée : il est placé après la première exposition. La commande de service peut rallumer la pièce mais ne distribue pas les balises.

### 39 — La coursive : conduites et visibilité interrompue

Les échangeurs, pieds de vanne et cabinets organisent un axe coupé par une porte intérieure. La sortie rejoint un seuil de l’infirmerie, hors du lit ouest. Un Facehugger est un contact existant de cette salle, pas une apparition au moment où le joueur allume une source. Tester les gabarits à l’arrivée des deux faces.

### 40 — Un seul coffret et exactement quatre charges

Le coffret beacon-case est posé sur beacon-case-body au sol de l’atelier. Il bloque corps et projectiles, sans boucher la vue par une hauteur fictive. E à portée 76 prépare 1,05 seconde. Créditer quatre charges uniquement à l’achèvement. Le couvercle montre ensuite le fond vide ; revenir, interrompre ou importer ne produit rien de plus.

### 41 — Engager une direction, pas poursuivre le curseur

P prépare un lancer de 0,6 seconde vers un point visé validé au départ. Le personnage baisse son arme et présente l’objet. Marcher, tirer ou perdre des PV interrompt sans débit. Bouger la visée ne déplace pas la destination engagée. La pause fige l’amorçage et la consommation n’a lieu qu’à son terme.

### 42 — Atterrir sur le même sol que les acteurs

Portée maximale 360, distance minimale 28, rayon du disque 4 unités. Le segment de lancer est tracé contre les mêmes volumes de corps/projectiles. Le verre peut laisser voir mais arrête le lancer. Une fermeture intervenant pendant le geste recalcule l’arrivée sans passer à travers le battant. Aucun rebond ni vol balistique continu n’est simulé.

### 43 — Une lumière qui respecte les cloisons

La balise émet localement dans un rayon maximal de 225 unités. Le rendu et la reconnaissance utilisent les volumes opaques et les limites de la pièce. L’intensité décroît avec la distance ; le bord n’est pas intégralement une zone de reconnaissance garantie. Le verre suit ses propriétés de vue, indépendantes des collisions des balles.

### 44 — Le porteur n’est pas le propriétaire de la lumière

Une source éclaire autant un Marine, Newt ou un Xéno selon leur position. La reconnaissance du joueur, de l’escouade, de la sentinelle et des ennemis reçoit la même contribution. Éclairer la zone de repli peut donc faciliter le ciblage hostile. Ne jamais en faire une invisibilité gratuite ou un arrêt de la cognition.

### 45 — Trente-six secondes dans une horloge commune

Chaque balise garde litAt et expiresAt espacés de 36 secondes. Les six dernières secondes réduisent son intensité. L’horloge est celle de l’opération : une pièce non visitée à l’écran vieillit aussi. Pause et import ne consomment pas le temps. Le disque inerte reste au sol après extinction et ne peut pas être récupéré ou rechargé.

### 46 — Un impact bref, pas une sirène ni une vague

L’atterrissage produit un stimulus d’équipement de portée 280, propagé par le système acoustique existant. Il peut influencer une piste, pas hypnotiser une créature. Il ne crée, tue ou déplace aucun acteur. Une source active n’émet pas une boucle de bruit ; pour une diversion prolongée, la commande de diagnostic garde son rôle propre.

### 47 — Ne pas cumuler des sources en projecteur infini

Les contributions lumineuses emploient un maximum, pas une addition arbitraire. Le stock de quatre bornes limite naturellement le travail du renderer et le registre. Aucune source ne traverse entre deux pièces, même si un sas est ouvert ; une transmission lumineuse inter-pièces nécessiterait une nouvelle règle partagée et une recette dédiée.

### 48 — Reprendre sans dupliquer les charges

Schéma 112 : charges + dépenses = quatre seulement après collecte ; nombre de disques = dépenses ; identifiants uniques et ordonnés ; durée exacte et dates dans le temps de l’opération. Rejeter propriétés inconnues, coordonnées dans un support fixe et bilan d’actions incohérent avant mutation. Un battant mobile refermé sur un disque l’occulte sans invalider une ancienne sauvegarde légale. Les huit anciens lieux V111 sont migrés sans cadeaux, les réserves de balises sont vides jusqu’à la collecte.

## Hadley’s Hope

v106-hadley — DEPTH. Ouvrir le passage et traverser avec l’escouade.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v106-hadley",
      "id": "hadley-to-ops",
      "x": 1360,
      "z": 195,
      "label": "Operations",
      "arrival": {
        "x": 1290,
        "z": 195
      },
      "linkId": "residential-ops",
      "to": {
        "room": "v107-operations",
        "id": "ops-to-hadley",
        "x": 64,
        "z": 195,
        "label": "Bloc résidentiel",
        "arrival": {
          "x": 135,
          "z": 195
        }
      }
    }
  ],
  "solids": [
    {
      "id": "north-wall",
      "x": 610,
      "z": 0,
      "w": 44,
      "d": 138,
      "h": 166
    },
    {
      "id": "south-wall",
      "x": 610,
      "z": 250,
      "w": 44,
      "d": 130,
      "h": 154
    },
    {
      "id": "generator",
      "x": 348,
      "z": 78,
      "w": 100,
      "d": 62,
      "h": 84
    },
    {
      "id": "crate-east",
      "x": 950,
      "z": 253,
      "w": 112,
      "d": 80,
      "h": 63
    },
    {
      "id": "service-rack",
      "x": 1100,
      "z": 40,
      "w": 94,
      "d": 62,
      "h": 130
    }
  ],
  "doors": [
    {
      "id": "service-gate",
      "name": "Porte de service",
      "x": 610,
      "z": 138,
      "w": 44,
      "d": 112,
      "h": 174,
      "reach": 100,
      "initialOpen": false,
      "powered": true,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "service-switch",
      "x": 494,
      "z": 294,
      "circuit": "service",
      "reach": 68
    }
  ],
  "props": [
    {
      "id": "console",
      "x": 493,
      "z": 294,
      "support": "sol de la coursive",
      "type": "console"
    },
    {
      "id": "lamp-west",
      "x": 385,
      "z": 32,
      "support": "mur nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "lamp-east",
      "x": 1050,
      "z": 30,
      "support": "mur nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "pipe",
      "x": 298,
      "z": 18,
      "support": "mur nord",
      "type": "pipe"
    }
  ]
}
```

## Infirmerie

v106-medlab — DEPTH. Sécuriser le passage et garder Newt auprès du groupe.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v106-medlab",
      "id": "medlab-to-ops",
      "x": 68,
      "z": 199,
      "label": "Operations",
      "arrival": {
        "x": 143,
        "z": 199
      },
      "linkId": "ops-medlab",
      "to": {
        "room": "v107-operations",
        "id": "ops-to-medlab",
        "x": 1120,
        "z": 329,
        "label": "Infirmerie",
        "arrival": {
          "x": 1120,
          "z": 235
        }
      }
    },
    {
      "room": "v106-medlab",
      "id": "medlab-to-service",
      "x": 1320,
      "z": 77,
      "label": "Relais de maintenance",
      "arrival": {
        "x": 1314,
        "z": 171
      },
      "linkId": "medical-service",
      "to": {
        "room": "v107-service",
        "id": "service-to-medlab",
        "x": 1346,
        "z": 325,
        "label": "Accès médical de service",
        "arrival": {
          "x": 1236,
          "z": 325
        }
      }
    },
    {
      "room": "v106-medlab",
      "id": "medlab-to-conduit",
      "x": 280,
      "z": 43,
      "label": "Coursive des conduites",
      "arrival": {
        "x": 280,
        "z": 140
      },
      "linkId": "conduit-medical",
      "to": {
        "room": "v112-conduit",
        "id": "conduit-to-medlab",
        "x": 1366,
        "z": 195,
        "label": "Infirmerie",
        "arrival": {
          "x": 1275,
          "z": 195
        }
      }
    }
  ],
  "solids": [
    {
      "id": "glass-north",
      "x": 690,
      "z": 0,
      "w": 30,
      "d": 133,
      "h": 144,
      "material": "glass",
      "blocksSight": false
    },
    {
      "id": "glass-south",
      "x": 690,
      "z": 263,
      "w": 30,
      "d": 117,
      "h": 144,
      "material": "glass",
      "blocksSight": false
    },
    {
      "id": "bed-west",
      "x": 340,
      "z": 67,
      "w": 160,
      "d": 74,
      "h": 42,
      "material": "medical"
    },
    {
      "id": "med-cabinet",
      "x": 905,
      "z": 32,
      "w": 94,
      "d": 83,
      "h": 124,
      "material": "medical"
    },
    {
      "id": "bed-east",
      "x": 1065,
      "z": 257,
      "w": 145,
      "d": 82,
      "h": 42,
      "material": "medical"
    }
  ],
  "doors": [
    {
      "id": "quarantine-gate",
      "name": "Quarantaine",
      "x": 690,
      "z": 133,
      "w": 30,
      "d": 130,
      "h": 161,
      "reach": 108,
      "initialOpen": false,
      "powered": true,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "service-switch",
      "x": 462,
      "z": 305,
      "circuit": "service",
      "reach": 68
    }
  ],
  "props": [
    {
      "id": "med-console",
      "x": 462,
      "z": 305,
      "support": "sol de la baie",
      "type": "console"
    },
    {
      "id": "med-lamp",
      "x": 454,
      "z": 35,
      "support": "rail mural",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "tank-a",
      "x": 1132,
      "z": 54,
      "support": "socle laboratoire",
      "type": "tank"
    },
    {
      "id": "tank-b",
      "x": 1245,
      "z": 54,
      "support": "socle laboratoire",
      "type": "tank"
    }
  ]
}
```

## Couloir des sentinelles

v106-sentry — DEPTH. Ouvrir la ligne de tir. Refermer seulement si le passage est libre.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v106-sentry",
      "id": "sentry-to-ops",
      "x": 68,
      "z": 194,
      "label": "Operations",
      "arrival": {
        "x": 144,
        "z": 194
      },
      "linkId": "ops-sentry",
      "to": {
        "room": "v107-operations",
        "id": "ops-to-sentry",
        "x": 1360,
        "z": 195,
        "label": "Ligne de défense",
        "arrival": {
          "x": 1285,
          "z": 195
        }
      }
    }
  ],
  "solids": [
    {
      "id": "bulkhead-north",
      "x": 686,
      "z": 0,
      "w": 46,
      "d": 134,
      "h": 184
    },
    {
      "id": "bulkhead-south",
      "x": 686,
      "z": 254,
      "w": 46,
      "d": 126,
      "h": 184
    },
    {
      "id": "ammo-rack",
      "x": 325,
      "z": 43,
      "w": 88,
      "d": 62,
      "h": 80
    },
    {
      "id": "cover-a",
      "x": 465,
      "z": 86,
      "w": 106,
      "d": 45,
      "h": 52
    },
    {
      "id": "cover-b",
      "x": 475,
      "z": 281,
      "w": 115,
      "d": 45,
      "h": 52
    },
    {
      "id": "east-rack",
      "x": 1074,
      "z": 272,
      "w": 85,
      "d": 70,
      "h": 112
    }
  ],
  "doors": [
    {
      "id": "defense-gate",
      "name": "Cloison de défense",
      "x": 686,
      "z": 134,
      "w": 46,
      "d": 120,
      "h": 180,
      "reach": 110,
      "initialOpen": false,
      "powered": true,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "service-switch",
      "x": 446,
      "z": 313,
      "circuit": "service",
      "reach": 68
    }
  ],
  "props": [
    {
      "id": "sentry-console",
      "x": 446,
      "z": 313,
      "support": "socle arrière",
      "type": "console"
    },
    {
      "id": "ammo-box",
      "x": 405,
      "z": 303,
      "support": "sol de défense",
      "type": "crate"
    },
    {
      "id": "lamp-west",
      "x": 545,
      "z": 27,
      "support": "mur nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "lamp-east",
      "x": 1095,
      "z": 35,
      "support": "mur nord",
      "type": "lamp",
      "circuit": "service"
    }
  ]
}
```

## Hangar du Sulaco

v106-sulaco — DEPTH. Contrôler la coursive sans toucher à la logique du sas final.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [],
  "solids": [
    {
      "id": "cargo-north",
      "x": 615,
      "z": 0,
      "w": 75,
      "d": 131,
      "h": 178
    },
    {
      "id": "cargo-south",
      "x": 615,
      "z": 260,
      "w": 75,
      "d": 120,
      "h": 163
    },
    {
      "id": "cargo-west",
      "x": 330,
      "z": 57,
      "w": 135,
      "d": 75,
      "h": 100
    },
    {
      "id": "cargo-east",
      "x": 936,
      "z": 278,
      "w": 130,
      "d": 75,
      "h": 91
    },
    {
      "id": "loader-stand",
      "x": 1030,
      "z": 44,
      "w": 135,
      "d": 85,
      "h": 150
    }
  ],
  "doors": [
    {
      "id": "cargo-gate",
      "name": "Accès au fret",
      "x": 615,
      "z": 131,
      "w": 75,
      "d": 129,
      "h": 181,
      "reach": 120,
      "initialOpen": false,
      "powered": true,
      "manual": true
    },
    {
      "id": "airlock-critical",
      "name": "Sas extérieur",
      "x": 1370,
      "z": 0,
      "w": 45,
      "d": 380,
      "h": 200,
      "reach": 90,
      "initialOpen": false,
      "powered": true,
      "manual": false,
      "critical": true
    }
  ],
  "controls": [
    {
      "id": "service-switch",
      "x": 505,
      "z": 292,
      "circuit": "service",
      "reach": 72
    }
  ],
  "props": [
    {
      "id": "cargo-console",
      "x": 505,
      "z": 292,
      "support": "sol de la coursive",
      "type": "console"
    },
    {
      "id": "loader",
      "x": 1096,
      "z": 86,
      "support": "plateforme technique",
      "type": "loader"
    },
    {
      "id": "hangar-lamp",
      "x": 412,
      "z": 25,
      "support": "poutre nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "airlock-lamp",
      "x": 1220,
      "z": 24,
      "support": "rail du sas",
      "type": "lamp",
      "circuit": "service"
    }
  ]
}
```

## Operations

v107-operations — HYBRID. Trouver le relais, récupérer Newt et sécuriser le retour.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v107-operations",
      "id": "ops-to-hadley",
      "x": 64,
      "z": 195,
      "label": "Bloc résidentiel",
      "arrival": {
        "x": 135,
        "z": 195
      },
      "linkId": "residential-ops",
      "to": {
        "room": "v106-hadley",
        "id": "hadley-to-ops",
        "x": 1360,
        "z": 195,
        "label": "Operations",
        "arrival": {
          "x": 1290,
          "z": 195
        }
      }
    },
    {
      "room": "v107-operations",
      "id": "ops-to-service",
      "x": 746,
      "z": 43,
      "label": "Maintenance",
      "arrival": {
        "x": 746,
        "z": 115
      },
      "linkId": "ops-service",
      "to": {
        "room": "v107-service",
        "id": "service-to-ops",
        "x": 68,
        "z": 195,
        "label": "Operations",
        "arrival": {
          "x": 140,
          "z": 195
        }
      }
    },
    {
      "room": "v107-operations",
      "id": "ops-to-medlab",
      "x": 1120,
      "z": 329,
      "label": "Infirmerie",
      "arrival": {
        "x": 1120,
        "z": 235
      },
      "linkId": "ops-medlab",
      "to": {
        "room": "v106-medlab",
        "id": "medlab-to-ops",
        "x": 68,
        "z": 199,
        "label": "Operations",
        "arrival": {
          "x": 143,
          "z": 199
        }
      }
    },
    {
      "room": "v107-operations",
      "id": "ops-to-sentry",
      "x": 1360,
      "z": 195,
      "label": "Ligne de défense",
      "arrival": {
        "x": 1285,
        "z": 195
      },
      "linkId": "ops-sentry",
      "to": {
        "room": "v106-sentry",
        "id": "sentry-to-ops",
        "x": 68,
        "z": 194,
        "label": "Operations",
        "arrival": {
          "x": 144,
          "z": 194
        }
      }
    },
    {
      "room": "v107-operations",
      "id": "ops-to-logistics",
      "x": 164,
      "z": 326,
      "label": "Galerie logistique",
      "arrival": {
        "x": 164,
        "z": 240
      },
      "linkId": "ops-logistics",
      "to": {
        "room": "v109-logistics",
        "id": "logistics-to-ops",
        "x": 64,
        "z": 195,
        "label": "Operations",
        "arrival": {
          "x": 144,
          "z": 195
        }
      }
    },
    {
      "room": "v107-operations",
      "id": "ops-to-optics",
      "x": 286,
      "z": 43,
      "label": "Atelier optique",
      "arrival": {
        "x": 286,
        "z": 135
      },
      "linkId": "ops-optics",
      "to": {
        "room": "v112-workshop",
        "id": "optics-to-ops",
        "x": 64,
        "z": 195,
        "label": "Operations",
        "arrival": {
          "x": 144,
          "z": 195
        }
      }
    }
  ],
  "solids": [
    {
      "id": "ops-table",
      "x": 430,
      "z": 100,
      "w": 238,
      "d": 93,
      "h": 49
    },
    {
      "id": "ops-rack",
      "x": 303,
      "z": 274,
      "w": 133,
      "d": 75,
      "h": 126
    },
    {
      "id": "north-partition",
      "x": 874,
      "z": 0,
      "w": 40,
      "d": 114,
      "h": 166
    },
    {
      "id": "south-partition",
      "x": 874,
      "z": 255,
      "w": 40,
      "d": 125,
      "h": 156
    },
    {
      "id": "ops-display",
      "x": 1054,
      "z": 68,
      "w": 174,
      "d": 71,
      "h": 103
    }
  ],
  "doors": [
    {
      "id": "ops-bulkhead",
      "name": "Cloison Operations",
      "x": 874,
      "z": 114,
      "w": 40,
      "d": 141,
      "h": 174,
      "reach": 108,
      "initialOpen": true,
      "powered": true,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "service-switch",
      "name": "Éclairage du poste",
      "x": 733,
      "z": 307,
      "circuit": "service",
      "reach": 68
    }
  ],
  "props": [
    {
      "id": "ops-screen",
      "x": 570,
      "z": 142,
      "support": "table centrale",
      "supportId": "ops-table",
      "elevation": 49,
      "type": "console"
    },
    {
      "id": "ops-console",
      "x": 733,
      "z": 307,
      "support": "sol de la coursive",
      "type": "console"
    },
    {
      "id": "ops-lamp-west",
      "x": 380,
      "z": 25,
      "support": "rail nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "ops-lamp-east",
      "x": 1186,
      "z": 27,
      "support": "rail nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "ops-pipe",
      "x": 785,
      "z": 18,
      "support": "mur nord",
      "type": "pipe"
    },
    {
      "id": "ammo-bin",
      "x": 346,
      "z": 312,
      "support": "étagère arrière",
      "type": "crate"
    }
  ]
}
```

## Relais de maintenance

v107-service — HYBRID. Rétablir la liaison électrique, puis rejoindre le laboratoire.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v107-service",
      "id": "service-to-ops",
      "x": 68,
      "z": 195,
      "label": "Operations",
      "arrival": {
        "x": 140,
        "z": 195
      },
      "linkId": "ops-service",
      "to": {
        "room": "v107-operations",
        "id": "ops-to-service",
        "x": 746,
        "z": 43,
        "label": "Maintenance",
        "arrival": {
          "x": 746,
          "z": 115
        }
      }
    },
    {
      "room": "v107-service",
      "id": "service-to-medlab",
      "x": 1346,
      "z": 325,
      "label": "Accès médical de service",
      "arrival": {
        "x": 1236,
        "z": 325
      },
      "linkId": "medical-service",
      "to": {
        "room": "v106-medlab",
        "id": "medlab-to-service",
        "x": 1320,
        "z": 77,
        "label": "Relais de maintenance",
        "arrival": {
          "x": 1314,
          "z": 171
        }
      }
    },
    {
      "room": "v107-service",
      "id": "service-to-reserve",
      "x": 1300,
      "z": 43,
      "label": "Réserve technique",
      "arrival": {
        "x": 1300,
        "z": 137
      },
      "linkId": "reserve-service",
      "to": {
        "room": "v109-reserve",
        "id": "reserve-to-service",
        "x": 1328,
        "z": 43,
        "label": "Maintenance",
        "arrival": {
          "x": 1300,
          "z": 137
        }
      }
    }
  ],
  "solids": [
    {
      "id": "service-north",
      "x": 610,
      "z": 0,
      "w": 40,
      "d": 132,
      "h": 190
    },
    {
      "id": "service-south",
      "x": 610,
      "z": 257,
      "w": 40,
      "d": 123,
      "h": 164
    },
    {
      "id": "pump-foundation",
      "x": 275,
      "z": 53,
      "w": 151,
      "d": 98,
      "h": 94
    },
    {
      "id": "transformer-plinth",
      "x": 1000,
      "z": 55,
      "w": 138,
      "d": 90,
      "h": 141
    },
    {
      "id": "cable-rack",
      "x": 828,
      "z": 275,
      "w": 115,
      "d": 72,
      "h": 69
    }
  ],
  "doors": [
    {
      "id": "maintenance-gate",
      "name": "Clapet de maintenance",
      "x": 610,
      "z": 132,
      "w": 40,
      "d": 125,
      "h": 183,
      "reach": 101,
      "initialOpen": false,
      "powered": false,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "relay-switch",
      "name": "Relais Operations",
      "x": 1238,
      "z": 226,
      "circuit": "network",
      "reach": 66
    },
    {
      "id": "service-switch",
      "name": "Éclairage local",
      "x": 464,
      "z": 307,
      "circuit": "service",
      "reach": 58
    }
  ],
  "props": [
    {
      "id": "relay-console",
      "x": 1238,
      "z": 226,
      "support": "pied de l’armoire de relais",
      "type": "console",
      "circuit": "network"
    },
    {
      "id": "service-console",
      "x": 464,
      "z": 307,
      "support": "sol de maintenance",
      "type": "console"
    },
    {
      "id": "pump-pipes",
      "x": 316,
      "z": 40,
      "support": "mur au-dessus du socle de pompage",
      "type": "pipe"
    },
    {
      "id": "service-lamp",
      "x": 702,
      "z": 24,
      "support": "poutre nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "transformer-cable",
      "x": 1058,
      "z": 28,
      "support": "mur au-dessus du transformateur",
      "type": "pipe"
    },
    {
      "id": "service-crate",
      "x": 837,
      "z": 314,
      "support": "table basse de câblage",
      "supportId": "cable-rack",
      "elevation": 69,
      "type": "crate"
    }
  ]
}
```

## Galerie logistique

v109-logistics — HYBRID. Dégager le quai, récupérer une réserve et reconnaître la voie de service.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v109-logistics",
      "id": "logistics-to-ops",
      "x": 64,
      "z": 195,
      "label": "Operations",
      "arrival": {
        "x": 144,
        "z": 195
      },
      "linkId": "ops-logistics",
      "to": {
        "room": "v107-operations",
        "id": "ops-to-logistics",
        "x": 164,
        "z": 326,
        "label": "Galerie logistique",
        "arrival": {
          "x": 164,
          "z": 240
        }
      }
    },
    {
      "room": "v109-logistics",
      "id": "logistics-to-reserve",
      "x": 1366,
      "z": 195,
      "label": "Réserve technique",
      "arrival": {
        "x": 1275,
        "z": 195
      },
      "linkId": "logistics-reserve",
      "to": {
        "room": "v109-reserve",
        "id": "reserve-to-logistics",
        "x": 64,
        "z": 195,
        "label": "Galerie logistique",
        "arrival": {
          "x": 144,
          "z": 195
        }
      }
    }
  ],
  "solids": [
    {
      "id": "freight-north",
      "x": 670,
      "z": 0,
      "w": 38,
      "d": 137,
      "h": 186
    },
    {
      "id": "freight-south",
      "x": 670,
      "z": 253,
      "w": 38,
      "d": 127,
      "h": 175
    },
    {
      "id": "parked-tug",
      "x": 300,
      "z": 56,
      "w": 178,
      "d": 86,
      "h": 92,
      "visual": "tug"
    },
    {
      "id": "pallet-bay",
      "x": 307,
      "z": 282,
      "w": 170,
      "d": 70,
      "h": 68
    },
    {
      "id": "storage-plinth",
      "x": 1030,
      "z": 283,
      "w": 175,
      "d": 58,
      "h": 80
    },
    {
      "id": "north-shelf",
      "x": 1090,
      "z": 52,
      "w": 176,
      "d": 80,
      "h": 118
    },
    {
      "id": "body-log-ammo",
      "x": 1156,
      "z": 203,
      "w": 68,
      "d": 36,
      "h": 43,
      "material": "metal",
      "blocksSight": false,
      "visual": "supply"
    }
  ],
  "doors": [
    {
      "id": "freight-shutter",
      "name": "Rideau du quai",
      "x": 670,
      "z": 137,
      "w": 38,
      "d": 116,
      "h": 182,
      "reach": 100,
      "initialOpen": false,
      "powered": false,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "freight-light",
      "name": "Éclairage du quai",
      "x": 525,
      "z": 224,
      "circuit": "service",
      "reach": 62
    }
  ],
  "props": [
    {
      "id": "tug-cabin",
      "x": 389,
      "z": 99,
      "support": "châssis du tracteur stationné",
      "bodyId": "parked-tug",
      "type": "tug"
    },
    {
      "id": "pallet-crate",
      "x": 385,
      "z": 317,
      "support": "palette du quai",
      "supportId": "pallet-bay",
      "elevation": 68,
      "type": "crate"
    },
    {
      "id": "freight-lamp-a",
      "x": 516,
      "z": 24,
      "support": "portique nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "freight-lamp-b",
      "x": 1031,
      "z": 24,
      "support": "portique nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "sealed-ammo",
      "x": 1190,
      "z": 221,
      "support": "desserte de ravitaillement fixée au sol",
      "type": "supply",
      "stockId": "log-ammo",
      "bodyId": "body-log-ammo"
    },
    {
      "id": "quay-console",
      "x": 525,
      "z": 224,
      "support": "colonne de commande du quai",
      "type": "console"
    },
    {
      "id": "dispatch-sign",
      "x": 944,
      "z": 28,
      "support": "mur de livraison",
      "type": "pipe"
    }
  ]
}
```

## Réserve technique

v109-reserve — HYBRID. Préparer les ressources du groupe ou détourner un contact avec la sirène.

Lieu hérité, catalogue conservé.

```json
{
  "exits": [
    {
      "room": "v109-reserve",
      "id": "reserve-to-logistics",
      "x": 64,
      "z": 195,
      "label": "Galerie logistique",
      "arrival": {
        "x": 144,
        "z": 195
      },
      "linkId": "logistics-reserve",
      "to": {
        "room": "v109-logistics",
        "id": "logistics-to-reserve",
        "x": 1366,
        "z": 195,
        "label": "Réserve technique",
        "arrival": {
          "x": 1275,
          "z": 195
        }
      }
    },
    {
      "room": "v109-reserve",
      "id": "reserve-to-service",
      "x": 1328,
      "z": 43,
      "label": "Maintenance",
      "arrival": {
        "x": 1300,
        "z": 137
      },
      "linkId": "reserve-service",
      "to": {
        "room": "v107-service",
        "id": "service-to-reserve",
        "x": 1300,
        "z": 43,
        "label": "Réserve technique",
        "arrival": {
          "x": 1300,
          "z": 137
        }
      }
    }
  ],
  "solids": [
    {
      "id": "reserve-north",
      "x": 620,
      "z": 0,
      "w": 34,
      "d": 135,
      "h": 179
    },
    {
      "id": "reserve-south",
      "x": 620,
      "z": 254,
      "w": 34,
      "d": 126,
      "h": 162
    },
    {
      "id": "service-locker",
      "x": 286,
      "z": 54,
      "w": 110,
      "d": 91,
      "h": 128
    },
    {
      "id": "battery-stack",
      "x": 280,
      "z": 281,
      "w": 134,
      "d": 67,
      "h": 88
    },
    {
      "id": "medical-counter",
      "x": 835,
      "z": 65,
      "w": 188,
      "d": 90,
      "h": 67
    },
    {
      "id": "reserve-cabinet",
      "x": 967,
      "z": 282,
      "w": 157,
      "d": 67,
      "h": 119
    },
    {
      "id": "body-reserve-sentry",
      "x": 313,
      "z": 198,
      "w": 68,
      "d": 36,
      "h": 43,
      "material": "metal",
      "blocksSight": false,
      "visual": "supply"
    },
    {
      "id": "body-reserve-medical",
      "x": 884,
      "z": 200,
      "w": 68,
      "d": 36,
      "h": 43,
      "material": "metal",
      "blocksSight": false,
      "visual": "supply"
    },
    {
      "id": "body-reserve-alarm",
      "x": 1180,
      "z": 220,
      "w": 68,
      "d": 36,
      "h": 64,
      "material": "metal",
      "blocksSight": false,
      "visual": "alarm"
    }
  ],
  "doors": [
    {
      "id": "reserve-door",
      "name": "Cloison de réserve",
      "x": 620,
      "z": 135,
      "w": 34,
      "d": 119,
      "h": 177,
      "reach": 100,
      "initialOpen": false,
      "powered": false,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "reserve-light",
      "name": "Éclairage réserve",
      "x": 754,
      "z": 293,
      "circuit": "service",
      "reach": 62
    }
  ],
  "props": [
    {
      "id": "sentry-cartridge",
      "x": 347,
      "z": 216,
      "support": "berceau de munitions au sol",
      "type": "supply",
      "stockId": "reserve-sentry",
      "bodyId": "body-reserve-sentry"
    },
    {
      "id": "medical-pack",
      "x": 918,
      "z": 218,
      "support": "chariot de secours fixé au sol",
      "type": "supply",
      "stockId": "reserve-medical",
      "bodyId": "body-reserve-medical"
    },
    {
      "id": "alarm-desk",
      "x": 1214,
      "z": 238,
      "support": "socle du testeur de sirène",
      "type": "alarm",
      "alarmId": "reserve-alarm",
      "bodyId": "body-reserve-alarm"
    },
    {
      "id": "reserve-monitor",
      "x": 922,
      "z": 111,
      "support": "comptoir médical",
      "supportId": "medical-counter",
      "elevation": 67,
      "type": "console"
    },
    {
      "id": "reserve-lamp",
      "x": 1012,
      "z": 24,
      "support": "rail médical nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "reserve-switch",
      "x": 754,
      "z": 293,
      "support": "potelet de commande",
      "type": "console"
    },
    {
      "id": "reserve-conduit",
      "x": 1219,
      "z": 27,
      "support": "mur de distribution",
      "type": "pipe"
    }
  ]
}
```

## Atelier optique

v112-workshop — HYBRID. Reconnaître l’atelier et récupérer le coffret de quatre balises. Le retour principal reste libre.

Nouveau lieu V112, service coupé au départ.

```json
{
  "exits": [
    {
      "room": "v112-workshop",
      "id": "optics-to-ops",
      "x": 64,
      "z": 195,
      "label": "Operations",
      "arrival": {
        "x": 144,
        "z": 195
      },
      "linkId": "ops-optics",
      "to": {
        "room": "v107-operations",
        "id": "ops-to-optics",
        "x": 286,
        "z": 43,
        "label": "Atelier optique",
        "arrival": {
          "x": 286,
          "z": 135
        }
      }
    },
    {
      "room": "v112-workshop",
      "id": "optics-to-conduit",
      "x": 1366,
      "z": 195,
      "label": "Coursive des conduites",
      "arrival": {
        "x": 1275,
        "z": 195
      },
      "linkId": "optics-conduit",
      "to": {
        "room": "v112-conduit",
        "id": "conduit-to-optics",
        "x": 64,
        "z": 195,
        "label": "Atelier optique",
        "arrival": {
          "x": 144,
          "z": 195
        }
      }
    }
  ],
  "solids": [
    {
      "id": "optics-north",
      "x": 682,
      "z": 0,
      "w": 36,
      "d": 134,
      "h": 188
    },
    {
      "id": "optics-south",
      "x": 682,
      "z": 254,
      "w": 36,
      "d": 126,
      "h": 158
    },
    {
      "id": "optics-bench",
      "x": 308,
      "z": 62,
      "w": 184,
      "d": 83,
      "h": 65
    },
    {
      "id": "glass-rack",
      "x": 328,
      "z": 290,
      "w": 164,
      "d": 63,
      "h": 124
    },
    {
      "id": "calibration-bank",
      "x": 990,
      "z": 59,
      "w": 178,
      "d": 82,
      "h": 112
    },
    {
      "id": "optics-cabinet",
      "x": 965,
      "z": 288,
      "w": 136,
      "d": 65,
      "h": 98
    },
    {
      "id": "beacon-case-body",
      "x": 1122,
      "z": 207,
      "w": 68,
      "d": 36,
      "h": 51,
      "material": "metal",
      "blocksSight": false,
      "visual": "beacon-case"
    }
  ],
  "doors": [
    {
      "id": "optics-door",
      "name": "Cloison d’atelier",
      "x": 682,
      "z": 134,
      "w": 36,
      "d": 120,
      "h": 183,
      "reach": 100,
      "initialOpen": false,
      "powered": false,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "optics-switch",
      "name": "Éclairage de l’atelier",
      "x": 542,
      "z": 294,
      "circuit": "service",
      "reach": 64
    }
  ],
  "props": [
    {
      "id": "optics-console",
      "x": 398,
      "z": 103,
      "support": "banc de calibration",
      "supportId": "optics-bench",
      "elevation": 65,
      "type": "console"
    },
    {
      "id": "optics-control",
      "x": 542,
      "z": 294,
      "support": "potelet électrique au sol",
      "type": "console"
    },
    {
      "id": "optics-lamp-a",
      "x": 500,
      "z": 24,
      "support": "rail optique nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "optics-lamp-b",
      "x": 1130,
      "z": 24,
      "support": "rail optique nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "beacon-case",
      "x": 1156,
      "z": 225,
      "support": "coffret de secours posé sur chariot",
      "bodyId": "beacon-case-body",
      "type": "beacon-case"
    },
    {
      "id": "calibration-pipe",
      "x": 1080,
      "z": 24,
      "support": "mur derrière le banc",
      "type": "pipe"
    }
  ]
}
```

## Coursive des conduites

v112-conduit — HYBRID. Contourner les échangeurs et reconnaître le raccord médical. Une balise peut éclairer le prochain couvert.

Nouveau lieu V112, service coupé au départ.

```json
{
  "exits": [
    {
      "room": "v112-conduit",
      "id": "conduit-to-optics",
      "x": 64,
      "z": 195,
      "label": "Atelier optique",
      "arrival": {
        "x": 144,
        "z": 195
      },
      "linkId": "optics-conduit",
      "to": {
        "room": "v112-workshop",
        "id": "optics-to-conduit",
        "x": 1366,
        "z": 195,
        "label": "Coursive des conduites",
        "arrival": {
          "x": 1275,
          "z": 195
        }
      }
    },
    {
      "room": "v112-conduit",
      "id": "conduit-to-medlab",
      "x": 1366,
      "z": 195,
      "label": "Infirmerie",
      "arrival": {
        "x": 1275,
        "z": 195
      },
      "linkId": "conduit-medical",
      "to": {
        "room": "v106-medlab",
        "id": "medlab-to-conduit",
        "x": 280,
        "z": 43,
        "label": "Coursive des conduites",
        "arrival": {
          "x": 280,
          "z": 140
        }
      }
    }
  ],
  "solids": [
    {
      "id": "conduit-north",
      "x": 672,
      "z": 0,
      "w": 36,
      "d": 136,
      "h": 189
    },
    {
      "id": "conduit-south",
      "x": 672,
      "z": 254,
      "w": 36,
      "d": 126,
      "h": 155
    },
    {
      "id": "exchanger-west",
      "x": 316,
      "z": 54,
      "w": 181,
      "d": 84,
      "h": 127
    },
    {
      "id": "valve-plinth",
      "x": 368,
      "z": 286,
      "w": 125,
      "d": 65,
      "h": 73
    },
    {
      "id": "exchanger-east",
      "x": 995,
      "z": 56,
      "w": 194,
      "d": 82,
      "h": 134
    },
    {
      "id": "conduit-south-rack",
      "x": 942,
      "z": 284,
      "w": 160,
      "d": 68,
      "h": 115
    }
  ],
  "doors": [
    {
      "id": "conduit-door",
      "name": "Battant de dérivation",
      "x": 672,
      "z": 136,
      "w": 36,
      "d": 118,
      "h": 181,
      "reach": 100,
      "initialOpen": false,
      "powered": false,
      "manual": true
    }
  ],
  "controls": [
    {
      "id": "conduit-switch",
      "name": "Éclairage de dérivation",
      "x": 550,
      "z": 280,
      "circuit": "service",
      "reach": 64
    }
  ],
  "props": [
    {
      "id": "conduit-control",
      "x": 550,
      "z": 280,
      "support": "colonne de service",
      "type": "console"
    },
    {
      "id": "valve-indicator",
      "x": 431,
      "z": 316,
      "support": "socle de vanne",
      "supportId": "valve-plinth",
      "elevation": 73,
      "type": "console"
    },
    {
      "id": "conduit-lamp-a",
      "x": 306,
      "z": 24,
      "support": "rail de maintenance nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "conduit-lamp-b",
      "x": 1140,
      "z": 24,
      "support": "rail de maintenance nord",
      "type": "lamp",
      "circuit": "service"
    },
    {
      "id": "exchanger-pipe-a",
      "x": 404,
      "z": 25,
      "support": "mur au-dessus de l’échangeur",
      "type": "pipe"
    },
    {
      "id": "exchanger-pipe-b",
      "x": 1089,
      "z": 25,
      "support": "mur au-dessus de l’échangeur",
      "type": "pipe"
    }
  ]
}
```
