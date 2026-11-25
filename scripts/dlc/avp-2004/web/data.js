
globalThis.AVP_DATA = {
  "id": "avp-2004-rite-under-ice",
  "version": "0.5.0",
  "title": "AVP · Sous la glace",
  "subtitle": "Éclairer. Détourner. Refermer le piège.",
  "film": "Alien vs. Predator (2004)",
  "saveKey": "atf.dlc.avp2004.v1",
  "pyramidPeriod": 600,
  "rooms": [
    {
      "id": "maru",
      "name": "Piper Maru · Pont",
      "mode": "DEPTH",
      "biome": "ship",
      "width": 1800,
      "floor": 0,
      "mood": "Le navire craque contre la banquise.",
      "design": "Câbles arrimés, treuil bâbord, accès à la salle des cartes et au local de matériel.",
      "doors": [
        {
          "id": "maru--brief",
          "to": "brief",
          "pair": "brief--maru",
          "x": 520,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Salle des cartes",
          "levelDelta": 0
        },
        {
          "id": "maru--gear",
          "to": "gear",
          "pair": "gear--maru",
          "x": 1150,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Local d’expédition",
          "levelDelta": 0
        },
        {
          "id": "maru--landing",
          "to": "landing",
          "pair": "landing--maru",
          "x": 1695,
          "y": 144,
          "gate": "gear",
          "phases": null,
          "kind": "transport",
          "label": "Bouvetøya · Zone d’arrivée",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "maru-p01",
          "asset": "winch",
          "x": 270,
          "y": 82,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "maru-p02",
          "asset": "rope",
          "x": 860,
          "y": 68,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "maru-p03",
          "asset": "crate",
          "x": 1450,
          "y": 218,
          "scale": 1,
          "solid": 1
        },
        {
          "id": "maru-p04",
          "asset": "pylon",
          "x": 1720,
          "y": 70,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "maru-v2-00",
          "asset": "cablecoil",
          "x": 700,
          "y": 229,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "maru-v2-01",
          "asset": "worklamp",
          "x": 1380,
          "y": 65,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "maru-v2-02",
          "asset": "lifering",
          "x": 350,
          "y": 65,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 216,
          "y": 54.400000000000006,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "maru-p01"
        },
        {
          "x": 1405,
          "y": 195,
          "w": 90,
          "h": 46,
          "prop": "maru-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        0,
        0
      ],
      "sector": "Piper Maru",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Pont du navire",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "brief",
      "name": "Salle des cartes",
      "mode": "SIDE",
      "biome": "ship",
      "width": 1300,
      "floor": 0,
      "mood": "Sous la glace, quelque chose émet de la chaleur.",
      "design": "Table centrale en fond, caisses arrimées à gauche, passage avant libre.",
      "doors": [
        {
          "id": "brief--maru",
          "to": "maru",
          "pair": "maru--brief",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Piper Maru · Pont",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "brief-p01",
          "asset": "maptable",
          "x": 650,
          "y": 85,
          "scale": 1.6,
          "solid": 0
        },
        {
          "id": "brief-p02",
          "asset": "radio",
          "x": 1020,
          "y": 70,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "brief-p03",
          "asset": "bench",
          "x": 300,
          "y": 65,
          "scale": 1.3,
          "solid": 0
        },
        {
          "id": "brief-v2-00",
          "asset": "thermalmap",
          "x": 510,
          "y": 63,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "brief-v2-01",
          "asset": "locker",
          "x": 1150,
          "y": 70,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        1,
        -1
      ],
      "sector": "Piper Maru",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Pont du navire"
    },
    {
      "id": "gear",
      "name": "Local d’expédition",
      "mode": "SIDE",
      "biome": "ship",
      "width": 1300,
      "floor": 0,
      "mood": "Une corde, un piolet. Ce que nous connaissons.",
      "design": "Râtelier et vestiaires adossés à la coque, matériel de descente accessible.",
      "doors": [
        {
          "id": "gear--maru",
          "to": "maru",
          "pair": "maru--gear",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Piper Maru · Pont",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "gear-p01",
          "asset": "crate",
          "x": 320,
          "y": 76,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "gear-p02",
          "asset": "gear",
          "x": 780,
          "y": 74,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "gear-p03",
          "asset": "rope",
          "x": 1060,
          "y": 73,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "gear-v2-00",
          "asset": "toolrack",
          "x": 520,
          "y": 62,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gear-v2-01",
          "asset": "helmet",
          "x": 920,
          "y": 65,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gear-v2-02",
          "asset": "locker",
          "x": 1140,
          "y": 68,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        1,
        1
      ],
      "sector": "Piper Maru",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Pont du navire"
    },
    {
      "id": "landing",
      "name": "Bouvetøya · Zone d’arrivée",
      "mode": "DEPTH",
      "biome": "snow",
      "width": 1900,
      "floor": 0,
      "mood": "Le vent efface déjà nos traces.",
      "design": "Jalons, caisses d’expédition et silhouettes des hangars. Aucun autel ici.",
      "doors": [
        {
          "id": "landing--maru",
          "to": "maru",
          "pair": "maru--landing",
          "x": 105,
          "y": 144,
          "gate": "gear",
          "phases": null,
          "kind": "transport",
          "label": "Piper Maru · Pont",
          "levelDelta": 0
        },
        {
          "id": "landing--station",
          "to": "station",
          "pair": "station--landing",
          "x": 1795,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "landing-p01",
          "asset": "crate",
          "x": 380,
          "y": 70,
          "scale": 1.1,
          "solid": 1
        },
        {
          "id": "landing-p02",
          "asset": "pylon",
          "x": 740,
          "y": 62,
          "scale": 1.1,
          "solid": 0
        },
        {
          "id": "landing-p03",
          "asset": "radio",
          "x": 1260,
          "y": 76,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "landing-p04",
          "asset": "crate",
          "x": 1550,
          "y": 228,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "landing-v2-00",
          "asset": "floodlight",
          "x": 580,
          "y": 65,
          "scale": 1.6,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "landing-v2-01",
          "asset": "sled",
          "x": 970,
          "y": 226,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "landing-v2-02",
          "asset": "cablecoil",
          "x": 1150,
          "y": 65,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 330.5,
          "y": 44.7,
          "w": 99.00000000000001,
          "h": 50.6,
          "prop": "landing-p01"
        },
        {
          "x": 1491.5,
          "y": 198.1,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "landing-p04"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        2,
        0
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Neige tassée. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "station",
      "name": "Station baleinière · Rue centrale",
      "mode": "DEPTH",
      "biome": "snow",
      "width": 2400,
      "floor": 0,
      "mood": "Personne n’a quitté un mot derrière lui.",
      "design": "Hangars visitables au fond, chaudière à droite, passage vers le puits et cuves côté mer.",
      "doors": [
        {
          "id": "station--landing",
          "to": "landing",
          "pair": "landing--station",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Bouvetøya · Zone d’arrivée",
          "levelDelta": 0
        },
        {
          "id": "station--office",
          "to": "office",
          "pair": "office--station",
          "x": 500,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Bureau du contremaître",
          "levelDelta": 0
        },
        {
          "id": "station--workshop",
          "to": "workshop",
          "pair": "workshop--station",
          "x": 1050,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Atelier des baleiniers",
          "levelDelta": 0
        },
        {
          "id": "station--infirmary",
          "to": "infirmary",
          "pair": "infirmary--station",
          "x": 1530,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Infirmerie de la station",
          "levelDelta": 0
        },
        {
          "id": "station--bore",
          "to": "bore",
          "pair": "bore--station",
          "x": 2295,
          "y": 144,
          "gate": "radio",
          "phases": null,
          "kind": "rope",
          "label": "Tunnel thermique",
          "levelDelta": -1
        },
        {
          "id": "station--tanks",
          "to": "tanks",
          "pair": "tanks--station",
          "x": 2110,
          "y": 225,
          "gate": "escaped",
          "phases": null,
          "kind": "door",
          "label": "Cuves de la station",
          "levelDelta": 0
        },
        {
          "id": "station--engine",
          "to": "engine",
          "pair": "engine--station",
          "x": 1770,
          "y": 225,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station · Salle des machines",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "station-p01",
          "asset": "whalebone",
          "x": 350,
          "y": 225,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "station-p02",
          "asset": "generator",
          "x": 850,
          "y": 83,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "station-p03",
          "asset": "rope",
          "x": 1250,
          "y": 229,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "station-p04",
          "asset": "oilcan",
          "x": 1810,
          "y": 65,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "station-p05",
          "asset": "pylon",
          "x": 2270,
          "y": 65,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "station-v2-00",
          "asset": "boiler",
          "x": 700,
          "y": 66,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "station-v2-01",
          "asset": "barrel",
          "x": 1300,
          "y": 68,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "station-v2-02",
          "asset": "sled",
          "x": 1630,
          "y": 232,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "station-v2-03",
          "asset": "floodlight",
          "x": 1980,
          "y": 65,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "station-v2-04",
          "asset": "cablecoil",
          "x": 1160,
          "y": 65,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 287,
          "y": 192.8,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "station-p01"
        },
        {
          "x": 796,
          "y": 55.400000000000006,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "station-p02"
        },
        {
          "x": 1747,
          "y": 32.800000000000004,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "station-p04"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        3,
        0
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant, Neige tassée. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "office",
      "name": "Bureau du contremaître",
      "mode": "SIDE",
      "biome": "timber",
      "width": 1350,
      "floor": 0,
      "mood": "Le calendrier s’est arrêté.",
      "design": "Registre sur bureau, vieux poêle, vitres gelées. Aucun équipement spatial.",
      "doors": [
        {
          "id": "office--station",
          "to": "station",
          "pair": "station--office",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 0
        },
        {
          "id": "office--tower",
          "to": "tower",
          "pair": "tower--office",
          "x": 1190,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Station · Tour radio",
          "levelDelta": 1
        },
        {
          "id": "office--dormitory",
          "to": "dormitory",
          "pair": "dormitory--office",
          "x": 800,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Station · Dortoir des baleiniers",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "office-p01",
          "asset": "maptable",
          "x": 730,
          "y": 68,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "office-p02",
          "asset": "lantern",
          "x": 420,
          "y": 58,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "office-p03",
          "asset": "bench",
          "x": 1020,
          "y": 72,
          "scale": 1.1,
          "solid": 0
        },
        {
          "id": "office-v2-00",
          "asset": "journal",
          "x": 610,
          "y": 66,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "office-v2-01",
          "asset": "coat",
          "x": 1130,
          "y": 60,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "office-v2-02",
          "asset": "frostwindow",
          "x": 840,
          "y": 62,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "office-v3-extra0",
          "asset": "shelf",
          "x": 300,
          "y": 65,
          "scale": 1,
          "solid": false,
          "layer": "structure",
          "purpose": "Meuble qui contient les archives du bureau."
        }
      ],
      "solids": [],
      "collectibles": [
        {
          "id": "log-office",
          "x": 780,
          "y": 144,
          "title": "Un dernier registre",
          "text": "Le registre de la station s’interrompt en 1904. Aucun départ n’est inscrit.",
          "reward": "archive"
        }
      ],
      "sceneOnly": false,
      "map": [
        3,
        -1
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface"
    },
    {
      "id": "workshop",
      "name": "Atelier des baleiniers",
      "mode": "HYBRID",
      "biome": "timber",
      "width": 1600,
      "floor": 0,
      "mood": "La rouille n’a pas emporté les outils.",
      "design": "Établi mural, bobine et crochet de levage, allée centrale dégagée.",
      "doors": [
        {
          "id": "workshop--station",
          "to": "station",
          "pair": "station--workshop",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 0
        },
        {
          "id": "workshop--mess",
          "to": "mess",
          "pair": "mess--workshop",
          "x": 1470,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Station · Réfectoire",
          "levelDelta": 1
        },
        {
          "id": "workshop--cellar",
          "to": "cellar",
          "pair": "cellar--workshop",
          "x": 730,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Station · Cave des réserves",
          "shortcut": "cellar-hatch",
          "unlockFrom": "cellar",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "workshop-p01",
          "asset": "bench",
          "x": 510,
          "y": 68,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "workshop-p02",
          "asset": "rope",
          "x": 970,
          "y": 230,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "workshop-p03",
          "asset": "winch",
          "x": 1280,
          "y": 74,
          "scale": 1,
          "solid": 1
        },
        {
          "id": "workshop-v2-00",
          "asset": "toolrack",
          "x": 690,
          "y": 63,
          "scale": 1.5,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "workshop-v2-01",
          "asset": "hook",
          "x": 1130,
          "y": 63,
          "scale": 1.5,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "workshop-v2-02",
          "asset": "barrel",
          "x": 300,
          "y": 225,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "workshop-v2-03",
          "asset": "cablecoil",
          "x": 1370,
          "y": 225,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "workshop-v3-extra0",
          "asset": "toolrack",
          "x": 1140,
          "y": 55,
          "scale": 1,
          "solid": false,
          "layer": "structure",
          "purpose": "Rangement mural au-dessus du retour de cave."
        }
      ],
      "solids": [
        {
          "x": 447,
          "y": 35.800000000000004,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "workshop-p01"
        },
        {
          "x": 916,
          "y": 202.4,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "workshop-p02"
        },
        {
          "x": 1235,
          "y": 51,
          "w": 90,
          "h": 46,
          "prop": "workshop-p03"
        }
      ],
      "collectibles": [
        {
          "id": "log-workshop",
          "x": 690,
          "y": 144,
          "title": "Le treuil de halage",
          "text": "Le treuil entraînait les carcasses depuis le quai. La chaîne porte encore les mêmes maillons.",
          "reward": "archive"
        }
      ],
      "sceneOnly": false,
      "map": [
        4,
        -1
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "bore",
      "name": "Tunnel thermique",
      "mode": "SIDE",
      "biome": "ice",
      "width": 2000,
      "floor": -1,
      "mood": "Ce tunnel n’a pas été creusé avec nos machines.",
      "design": "Pente suggérée dans la roche, lignes de rappel continues, palier de sécurité.",
      "doors": [
        {
          "id": "bore--station",
          "to": "station",
          "pair": "station--bore",
          "x": 105,
          "y": 144,
          "gate": "radio",
          "phases": null,
          "kind": "rope",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 1
        },
        {
          "id": "bore--forecourt",
          "to": "forecourt",
          "pair": "forecourt--bore",
          "x": 1895,
          "y": 144,
          "gate": "rope",
          "phases": null,
          "kind": "rope",
          "label": "Pyramide · Parvis enfoui",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "bore-p01",
          "asset": "rope",
          "x": 400,
          "y": 58,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "bore-p02",
          "asset": "pylon",
          "x": 730,
          "y": 75,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "bore-p03",
          "asset": "lantern",
          "x": 1100,
          "y": 65,
          "scale": 0.9,
          "solid": 0
        },
        {
          "id": "bore-p04",
          "asset": "rope",
          "x": 1530,
          "y": 64,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "bore-v2-00",
          "asset": "anchor",
          "x": 330,
          "y": 62,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "bore-v2-01",
          "asset": "anchor",
          "x": 1420,
          "y": 62,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "bore-v2-02",
          "asset": "grate",
          "x": 1720,
          "y": 65,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "bore-v2-03",
          "asset": "worklamp",
          "x": 790,
          "y": 62,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        4,
        1
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -1,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Tunnel de descente",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "forecourt",
      "name": "Pyramide · Parvis enfoui",
      "mode": "DEPTH",
      "biome": "pyramid",
      "width": 2300,
      "floor": -2,
      "mood": "La montagne cache une autre montagne.",
      "design": "Façade en gradins, statues monumentales, accès axial. Grande profondeur lisible.",
      "doors": [
        {
          "id": "forecourt--bore",
          "to": "bore",
          "pair": "bore--forecourt",
          "x": 105,
          "y": 144,
          "gate": "rope",
          "phases": null,
          "kind": "rope",
          "label": "Tunnel thermique",
          "levelDelta": 1
        },
        {
          "id": "forecourt--vestibule",
          "to": "vestibule",
          "pair": "vestibule--forecourt",
          "x": 2195,
          "y": 144,
          "gate": "facade",
          "phases": null,
          "kind": "door",
          "label": "Vestibule des trois peuples",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "forecourt-p01",
          "asset": "statue",
          "x": 360,
          "y": 64,
          "scale": 2.1,
          "solid": 1
        },
        {
          "id": "forecourt-p02",
          "asset": "obelisk",
          "x": 950,
          "y": 69,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "forecourt-p03",
          "asset": "statue",
          "x": 1750,
          "y": 67,
          "scale": 2.1,
          "solid": 1
        },
        {
          "id": "forecourt-p04",
          "asset": "rubble",
          "x": 1250,
          "y": 230,
          "scale": 1.1,
          "solid": 1
        },
        {
          "id": "forecourt-v2-00",
          "asset": "tablet",
          "x": 670,
          "y": 65,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "forecourt-v2-01",
          "asset": "braziertall",
          "x": 1500,
          "y": 228,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "forecourt-v2-02",
          "asset": "relief",
          "x": 1980,
          "y": 64,
          "scale": 1.5,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 265.5,
          "y": 15.699999999999996,
          "w": 189,
          "h": 96.60000000000001,
          "prop": "forecourt-p01"
        },
        {
          "x": 891.5,
          "y": 39.099999999999994,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "forecourt-p02"
        },
        {
          "x": 1655.5,
          "y": 18.699999999999996,
          "w": 189,
          "h": 96.60000000000001,
          "prop": "forecourt-p03"
        },
        {
          "x": 1200.5,
          "y": 204.7,
          "w": 99.00000000000001,
          "h": 50.6,
          "prop": "forecourt-p04"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        5,
        1
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "vestibule",
      "name": "Vestibule des trois peuples",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 1650,
      "floor": -2,
      "mood": "Des civilisations différentes. Une même porte.",
      "design": "Pilastres gravés, seuil éclairé et accès de service latéral au labyrinthe.",
      "doors": [
        {
          "id": "vestibule--forecourt",
          "to": "forecourt",
          "pair": "forecourt--vestibule",
          "x": 105,
          "y": 144,
          "gate": "facade",
          "phases": null,
          "kind": "door",
          "label": "Pyramide · Parvis enfoui",
          "levelDelta": 0
        },
        {
          "id": "vestibule--sacrifice",
          "to": "sacrifice",
          "pair": "sacrifice--vestibule",
          "x": 1545,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Chambre des sacrifices",
          "levelDelta": 0
        },
        {
          "id": "vestibule--pivot",
          "to": "pivot",
          "pair": "pivot--vestibule",
          "x": 650,
          "y": 65,
          "gate": "plasma",
          "phases": [
            1,
            2
          ],
          "kind": "stairs",
          "label": "Croisée mobile",
          "levelDelta": -1
        },
        {
          "id": "vestibule--balcony",
          "to": "balcony",
          "pair": "balcony--vestibule",
          "x": 970,
          "y": 65,
          "gate": "ritual",
          "phases": null,
          "kind": "stairs",
          "label": "Pyramide · Balcon des bâtisseurs",
          "shortcut": "balcony-return",
          "unlockFrom": "balcony",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "vestibule-p01",
          "asset": "obelisk",
          "x": 370,
          "y": 67,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "vestibule-p02",
          "asset": "relief",
          "x": 1080,
          "y": 60,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "vestibule-p03",
          "asset": "brazier",
          "x": 1410,
          "y": 74,
          "scale": 0.85,
          "solid": 0
        },
        {
          "id": "vestibule-v2-00",
          "asset": "tablet",
          "x": 870,
          "y": 65,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "vestibule-v2-01",
          "asset": "braziertall",
          "x": 1280,
          "y": 228,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "vestibule-v2-02",
          "asset": "statue",
          "x": 530,
          "y": 227,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 316,
          "y": 39.400000000000006,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "vestibule-p01"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        5,
        2
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2"
    },
    {
      "id": "sacrifice",
      "name": "Chambre des sacrifices",
      "mode": "DEPTH",
      "biome": "temple",
      "width": 1900,
      "floor": -2,
      "mood": "Les tables ne servaient pas aux morts.",
      "design": "Deux rangées de dalles funéraires, percements pour les œufs au fond, axe libre.",
      "doors": [
        {
          "id": "sacrifice--vestibule",
          "to": "vestibule",
          "pair": "vestibule--sacrifice",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Vestibule des trois peuples",
          "levelDelta": 0
        },
        {
          "id": "sacrifice--ossuary",
          "to": "ossuary",
          "pair": "ossuary--sacrifice",
          "x": 1795,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Ossuaire",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "sacrifice-p01",
          "asset": "altar",
          "x": 420,
          "y": 65,
          "scale": 1.35,
          "solid": 1
        },
        {
          "id": "sacrifice-p02",
          "asset": "altar",
          "x": 900,
          "y": 75,
          "scale": 1.35,
          "solid": 1
        },
        {
          "id": "sacrifice-p03",
          "asset": "altar",
          "x": 1420,
          "y": 70,
          "scale": 1.35,
          "solid": 1
        },
        {
          "id": "sacrifice-p04",
          "asset": "altar",
          "x": 675,
          "y": 235,
          "scale": 1.15,
          "solid": 1
        },
        {
          "id": "sacrifice-p05",
          "asset": "altar",
          "x": 1230,
          "y": 230,
          "scale": 1.15,
          "solid": 1
        },
        {
          "id": "sacrifice-v2-00",
          "asset": "eggtrack",
          "x": 610,
          "y": 62,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "sacrifice-v2-01",
          "asset": "eggtrack",
          "x": 1190,
          "y": 62,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "sacrifice-v2-02",
          "asset": "hook",
          "x": 1660,
          "y": 64,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 359.25,
          "y": 33.95,
          "w": 121.50000000000001,
          "h": 62.1,
          "prop": "sacrifice-p01"
        },
        {
          "x": 839.25,
          "y": 43.95,
          "w": 121.50000000000001,
          "h": 62.1,
          "prop": "sacrifice-p02"
        },
        {
          "x": 1359.25,
          "y": 38.95,
          "w": 121.50000000000001,
          "h": 62.1,
          "prop": "sacrifice-p03"
        },
        {
          "x": 623.25,
          "y": 208.55,
          "w": 103.49999999999999,
          "h": 52.9,
          "prop": "sacrifice-p04"
        },
        {
          "x": 1178.25,
          "y": 203.55,
          "w": 103.49999999999999,
          "h": 52.9,
          "prop": "sacrifice-p05"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        6,
        2
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant, Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "ossuary",
      "name": "Ossuaire",
      "mode": "SIDE",
      "biome": "temple",
      "width": 1450,
      "floor": -2,
      "mood": "Les cages thoraciques sont ouvertes de l’intérieur.",
      "design": "Niches à hauteur d’épaule, ossements regroupés en fond et passage étroit.",
      "doors": [
        {
          "id": "ossuary--sacrifice",
          "to": "sacrifice",
          "pair": "sacrifice--ossuary",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Chambre des sacrifices",
          "levelDelta": 0
        },
        {
          "id": "ossuary--weapons",
          "to": "weapons",
          "pair": "weapons--ossuary",
          "x": 1345,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Chambre des armes",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "ossuary-p01",
          "asset": "bones",
          "x": 420,
          "y": 65,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "ossuary-p02",
          "asset": "relief",
          "x": 800,
          "y": 60,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "ossuary-p03",
          "asset": "bones",
          "x": 1130,
          "y": 72,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "ossuary-v2-00",
          "asset": "bones",
          "x": 610,
          "y": 64,
          "scale": 0.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "ossuary-v2-01",
          "asset": "tablet",
          "x": 970,
          "y": 64,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "ossuary-v2-02",
          "asset": "braziertall",
          "x": 1250,
          "y": 64,
          "scale": 0.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [
        {
          "id": "log-ossuary",
          "x": 800,
          "y": 144,
          "title": "De l’intérieur",
          "text": "Les fractures sont dirigées vers l’extérieur. Quelque chose a quitté les corps.",
          "reward": "archive"
        }
      ],
      "sceneOnly": false,
      "map": [
        7,
        2
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2"
    },
    {
      "id": "weapons",
      "name": "Chambre des armes",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 1750,
      "floor": -2,
      "mood": "Trois emplacements. Trois chasseurs.",
      "design": "Sarcophage axial à trois logements, dial au mur et cheminement autour du socle.",
      "doors": [
        {
          "id": "weapons--ossuary",
          "to": "ossuary",
          "pair": "ossuary--weapons",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Ossuaire",
          "levelDelta": 0
        },
        {
          "id": "weapons--pivot",
          "to": "pivot",
          "pair": "pivot--weapons",
          "x": 1645,
          "y": 144,
          "gate": "plasma",
          "phases": null,
          "kind": "stairs",
          "label": "Croisée mobile",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "weapons-p01",
          "asset": "sarcophagus",
          "x": 875,
          "y": 68,
          "scale": 1.8,
          "solid": 1
        },
        {
          "id": "weapons-p02",
          "asset": "obelisk",
          "x": 380,
          "y": 70,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "weapons-p03",
          "asset": "brazier",
          "x": 1370,
          "y": 74,
          "scale": 0.9,
          "solid": 0
        },
        {
          "id": "weapons-v2-00",
          "asset": "calendar",
          "x": 1170,
          "y": 63,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weapons-v2-01",
          "asset": "plasmacase",
          "x": 650,
          "y": 63,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weapons-v2-02",
          "asset": "plasmacase",
          "x": 1050,
          "y": 64,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 794,
          "y": 26.6,
          "w": 162,
          "h": 82.8,
          "prop": "weapons-p01"
        },
        {
          "x": 321.5,
          "y": 40.099999999999994,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "weapons-p02"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        8,
        2
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "pivot",
      "name": "Croisée mobile",
      "mode": "HYBRID",
      "biome": "maze",
      "width": 2050,
      "floor": -3,
      "mood": "Les murs ne se déplacent pas au hasard.",
      "design": "Dalles en translation sur rails distincts; niches latérales et raccourci cyclique signalé.",
      "doors": [
        {
          "id": "pivot--weapons",
          "to": "weapons",
          "pair": "weapons--pivot",
          "x": 105,
          "y": 144,
          "gate": "plasma",
          "phases": null,
          "kind": "stairs",
          "label": "Chambre des armes",
          "levelDelta": 1
        },
        {
          "id": "pivot--press",
          "to": "press",
          "pair": "press--pivot",
          "x": 1945,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Couloir de l’étau",
          "levelDelta": 0
        },
        {
          "id": "pivot--vestibule",
          "to": "vestibule",
          "pair": "vestibule--pivot",
          "x": 620,
          "y": 65,
          "gate": "plasma",
          "phases": [
            1,
            2
          ],
          "kind": "stairs",
          "label": "Vestibule des trois peuples",
          "levelDelta": 1
        },
        {
          "id": "pivot--weights",
          "to": "weights",
          "pair": "weights--pivot",
          "x": 1500,
          "y": 65,
          "gate": "plasma",
          "phases": null,
          "kind": "stairs",
          "label": "Salle des contrepoids",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "pivot-p01",
          "asset": "slab",
          "x": 460,
          "y": 65,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "pivot-p02",
          "asset": "obelisk",
          "x": 1070,
          "y": 75,
          "scale": 1.25,
          "solid": 1
        },
        {
          "id": "pivot-p03",
          "asset": "slab",
          "x": 1610,
          "y": 232,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "pivot-v2-00",
          "asset": "calendar",
          "x": 850,
          "y": 65,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "pivot-v2-01",
          "asset": "counterweight",
          "x": 1800,
          "y": 62,
          "scale": 1.5,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "pivot-v2-02",
          "asset": "grate",
          "x": 1350,
          "y": 225,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 397,
          "y": 32.800000000000004,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "pivot-p01"
        },
        {
          "x": 1013.75,
          "y": 46.25,
          "w": 112.5,
          "h": 57.5,
          "prop": "pivot-p02"
        },
        {
          "x": 1556,
          "y": 204.4,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "pivot-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        8,
        3
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "press",
      "name": "Couloir de l’étau",
      "mode": "SIDE",
      "biome": "maze",
      "width": 1750,
      "floor": -3,
      "mood": "Avancer pendant que la pierre nous le permet.",
      "design": "Parois mobiles au second plan, refuge central et couloir permanent sécurisé.",
      "doors": [
        {
          "id": "press--pivot",
          "to": "pivot",
          "pair": "pivot--press",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Croisée mobile",
          "levelDelta": 0
        },
        {
          "id": "press--duel",
          "to": "duel",
          "pair": "duel--press",
          "x": 1645,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Salle du filet",
          "levelDelta": 0
        },
        {
          "id": "press--weights",
          "to": "weights",
          "pair": "weights--press",
          "x": 630,
          "y": 65,
          "gate": "plasma",
          "phases": null,
          "kind": "stairs",
          "label": "Salle des contrepoids",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "press-p01",
          "asset": "slab",
          "x": 390,
          "y": 62,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "press-p02",
          "asset": "slab",
          "x": 1050,
          "y": 67,
          "scale": 1.3,
          "solid": 0
        },
        {
          "id": "press-p03",
          "asset": "rubble",
          "x": 1430,
          "y": 64,
          "scale": 0.9,
          "solid": 0
        },
        {
          "id": "press-v2-00",
          "asset": "counterweight",
          "x": 680,
          "y": 60,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "press-v2-01",
          "asset": "braziertall",
          "x": 1240,
          "y": 64,
          "scale": 0.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "press-v2-02",
          "asset": "grate",
          "x": 850,
          "y": 65,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        9,
        3
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "duel",
      "name": "Salle du filet",
      "mode": "DEPTH",
      "biome": "temple",
      "width": 2200,
      "floor": -3,
      "mood": "Nous ne sommes ni les chasseurs, ni le prix.",
      "design": "Piliers cassés, filet au sol, aire de duel en fond et trajet de fuite au premier plan.",
      "doors": [
        {
          "id": "duel--press",
          "to": "press",
          "pair": "press--duel",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Couloir de l’étau",
          "levelDelta": 0
        },
        {
          "id": "duel--glyphs",
          "to": "glyphs",
          "pair": "glyphs--duel",
          "x": 2095,
          "y": 144,
          "gate": "duel",
          "phases": null,
          "kind": "door",
          "label": "Galerie du rite",
          "levelDelta": 0
        },
        {
          "id": "duel--cloister",
          "to": "cloister",
          "pair": "cloister--duel",
          "x": 580,
          "y": 65,
          "gate": "cycle",
          "phases": null,
          "kind": "stairs",
          "label": "Pyramide · Galerie des niches",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "duel-p01",
          "asset": "rubble",
          "x": 390,
          "y": 65,
          "scale": 1.6,
          "solid": 1
        },
        {
          "id": "duel-p02",
          "asset": "net",
          "x": 1020,
          "y": 93,
          "scale": 1.2,
          "solid": 0
        },
        {
          "id": "duel-p03",
          "asset": "pillar",
          "x": 1730,
          "y": 74,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "duel-v2-00",
          "asset": "pillar",
          "x": 620,
          "y": 228,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "duel-v2-01",
          "asset": "rubble",
          "x": 1370,
          "y": 226,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "duel-v2-02",
          "asset": "hook",
          "x": 1940,
          "y": 65,
          "scale": 0.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 318,
          "y": 28.199999999999996,
          "w": 144,
          "h": 73.60000000000001,
          "prop": "duel-p01"
        },
        {
          "x": 1667,
          "y": 41.800000000000004,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "duel-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        9,
        4
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "glyphs",
      "name": "Galerie du rite",
      "mode": "SIDE",
      "biome": "temple",
      "width": 1800,
      "floor": -3,
      "mood": "Ce n’est pas un tombeau.",
      "design": "Frise narrative continue, traces de plasma et niche où Sebastian peut lire.",
      "doors": [
        {
          "id": "glyphs--duel",
          "to": "duel",
          "pair": "duel--glyphs",
          "x": 105,
          "y": 144,
          "gate": "duel",
          "phases": null,
          "kind": "door",
          "label": "Salle du filet",
          "levelDelta": 0
        },
        {
          "id": "glyphs--refuge",
          "to": "refuge",
          "pair": "refuge--glyphs",
          "x": 700,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Dernier abri",
          "levelDelta": 0
        },
        {
          "id": "glyphs--hunter",
          "to": "hunter",
          "pair": "hunter--glyphs",
          "x": 1695,
          "y": 144,
          "gate": "weyland",
          "phases": null,
          "kind": "door",
          "label": "Hall du chasseur",
          "levelDelta": 0
        },
        {
          "id": "glyphs--astrarium",
          "to": "astrarium",
          "pair": "astrarium--glyphs",
          "x": 1380,
          "y": 65,
          "gate": "ritual",
          "phases": null,
          "kind": "stairs",
          "label": "Chambre des cycles",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "glyphs-p01",
          "asset": "relief",
          "x": 410,
          "y": 65,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "glyphs-p02",
          "asset": "relief",
          "x": 1050,
          "y": 65,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "glyphs-p03",
          "asset": "brazier",
          "x": 1470,
          "y": 67,
          "scale": 0.85,
          "solid": 0
        },
        {
          "id": "glyphs-v2-00",
          "asset": "tablet",
          "x": 910,
          "y": 63,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "glyphs-v2-01",
          "asset": "calendar",
          "x": 1220,
          "y": 65,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "glyphs-v2-02",
          "asset": "braziertall",
          "x": 1580,
          "y": 65,
          "scale": 0.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "glyphs-v3-extra0",
          "asset": "stonearch",
          "x": 1550,
          "y": 63,
          "scale": 1.3,
          "solid": false,
          "layer": "structure",
          "purpose": "Niche profonde distincte de la frise."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        8,
        4
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "refuge",
      "name": "Dernier abri",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 1400,
      "floor": -3,
      "mood": "Weyland ne pourra plus suivre.",
      "design": "Renfoncement avec appui de pierre, torche humaine et unique accès au couloir.",
      "doors": [
        {
          "id": "refuge--glyphs",
          "to": "glyphs",
          "pair": "glyphs--refuge",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Galerie du rite",
          "levelDelta": 0
        },
        {
          "id": "refuge--trophies",
          "to": "trophies",
          "pair": "trophies--refuge",
          "x": 850,
          "y": 65,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Galerie des trophées",
          "levelDelta": 0
        },
        {
          "id": "refuge--balcony",
          "to": "balcony",
          "pair": "balcony--refuge",
          "x": 1275,
          "y": 144,
          "gate": "ritual",
          "phases": null,
          "kind": "stairs",
          "label": "Pyramide · Balcon des bâtisseurs",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "refuge-p01",
          "asset": "bench",
          "x": 470,
          "y": 70,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "refuge-p02",
          "asset": "lantern",
          "x": 900,
          "y": 64,
          "scale": 1,
          "solid": 0
        },
        {
          "id": "refuge-p03",
          "asset": "rubble",
          "x": 1190,
          "y": 230,
          "scale": 0.85,
          "solid": 1
        },
        {
          "id": "refuge-v2-00",
          "asset": "coat",
          "x": 720,
          "y": 66,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "refuge-v2-01",
          "asset": "worklamp",
          "x": 1040,
          "y": 63,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "refuge-v3-extra0",
          "asset": "stonearch",
          "x": 670,
          "y": 61,
          "scale": 1.4,
          "solid": false,
          "layer": "structure",
          "purpose": "Renfoncement protégeant les affaires laissées derrière."
        }
      ],
      "solids": [
        {
          "x": 416,
          "y": 42.400000000000006,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "refuge-p01"
        },
        {
          "x": 1151.75,
          "y": 210.45,
          "w": 76.5,
          "h": 39.1,
          "prop": "refuge-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        7,
        4
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3"
    },
    {
      "id": "hunter",
      "name": "Hall du chasseur",
      "mode": "DEPTH",
      "biome": "temple",
      "width": 1950,
      "floor": -3,
      "mood": "Rendre ce qui ne nous appartient pas.",
      "design": "Silhouette de Scar en fond, case du canon au centre, espace dégagé pour l’alliance.",
      "doors": [
        {
          "id": "hunter--glyphs",
          "to": "glyphs",
          "pair": "glyphs--hunter",
          "x": 105,
          "y": 144,
          "gate": "weyland",
          "phases": null,
          "kind": "door",
          "label": "Galerie du rite",
          "levelDelta": 0
        },
        {
          "id": "hunter--service",
          "to": "service",
          "pair": "service--hunter",
          "x": 1845,
          "y": 144,
          "gate": "alliance",
          "phases": null,
          "kind": "stairs",
          "label": "Passage sous les dalles",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "hunter-p01",
          "asset": "statue",
          "x": 430,
          "y": 69,
          "scale": 1.7,
          "solid": 1
        },
        {
          "id": "hunter-p02",
          "asset": "plasmacase",
          "x": 900,
          "y": 65,
          "scale": 1.1,
          "solid": 0
        },
        {
          "id": "hunter-p03",
          "asset": "rubble",
          "x": 1490,
          "y": 228,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "hunter-v2-00",
          "asset": "tablet",
          "x": 710,
          "y": 63,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "hunter-v2-01",
          "asset": "braziertall",
          "x": 1700,
          "y": 66,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "hunter-v2-02",
          "asset": "rubble",
          "x": 1170,
          "y": 225,
          "scale": 0.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 353.5,
          "y": 29.9,
          "w": 153,
          "h": 78.2,
          "prop": "hunter-p01"
        },
        {
          "x": 1436,
          "y": 200.4,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "hunter-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        8,
        5
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Gravats instables. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "service",
      "name": "Passage sous les dalles",
      "mode": "SIDE",
      "biome": "hive",
      "width": 1600,
      "floor": -4,
      "mood": "La résine gagne les joints de la pierre.",
      "design": "Conduit bas reliant le hall à la nurserie, résine uniquement autour des points infestés.",
      "doors": [
        {
          "id": "service--hunter",
          "to": "hunter",
          "pair": "hunter--service",
          "x": 105,
          "y": 144,
          "gate": "alliance",
          "phases": null,
          "kind": "stairs",
          "label": "Hall du chasseur",
          "levelDelta": 1
        },
        {
          "id": "service--nursery",
          "to": "nursery",
          "pair": "nursery--service",
          "x": 1495,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Nurserie",
          "levelDelta": 0
        },
        {
          "id": "service--incubator",
          "to": "incubator",
          "pair": "incubator--service",
          "x": 590,
          "y": 65,
          "gate": "alliance",
          "phases": null,
          "kind": "stairs",
          "label": "Conduite d’incubation",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "service-p01",
          "asset": "resin",
          "x": 480,
          "y": 60,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "service-p02",
          "asset": "resin",
          "x": 970,
          "y": 65,
          "scale": 1.8,
          "solid": 0
        },
        {
          "id": "service-p03",
          "asset": "bones",
          "x": 1230,
          "y": 64,
          "scale": 0.9,
          "solid": 0
        },
        {
          "id": "service-v2-00",
          "asset": "grate",
          "x": 720,
          "y": 62,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "service-v2-01",
          "asset": "eggtrack",
          "x": 1430,
          "y": 63,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        9,
        5
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -4,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -4",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Résine adhérente. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "nursery",
      "name": "Nurserie",
      "mode": "DEPTH",
      "biome": "hive",
      "width": 2150,
      "floor": -4,
      "mood": "Ils ne nous ont pas tués. Ils nous gardent.",
      "design": "Cocons au mur, œufs regroupés hors chemin sûr, Sebastian au fond à droite.",
      "doors": [
        {
          "id": "nursery--service",
          "to": "service",
          "pair": "service--nursery",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Passage sous les dalles",
          "levelDelta": 0
        },
        {
          "id": "nursery--queenhold",
          "to": "queenhold",
          "pair": "queenhold--nursery",
          "x": 2045,
          "y": 144,
          "gate": "sebastian",
          "phases": null,
          "kind": "door",
          "label": "Chambre de la Reine",
          "levelDelta": 0
        },
        {
          "id": "nursery--trophies",
          "to": "trophies",
          "pair": "trophies--nursery",
          "x": 600,
          "y": 65,
          "gate": "alliance",
          "phases": [
            0,
            2
          ],
          "kind": "stairs",
          "label": "Galerie des trophées",
          "levelDelta": 1
        },
        {
          "id": "nursery--incubator",
          "to": "incubator",
          "pair": "incubator--nursery",
          "x": 1200,
          "y": 65,
          "gate": "alliance",
          "phases": null,
          "kind": "stairs",
          "label": "Conduite d’incubation",
          "levelDelta": 1
        },
        {
          "id": "nursery--gantry",
          "to": "gantry",
          "pair": "gantry--nursery",
          "x": 1450,
          "y": 65,
          "gate": "sebastian",
          "phases": null,
          "kind": "stairs",
          "label": "Passerelle des entraves",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "nursery-p01",
          "asset": "eggs",
          "x": 390,
          "y": 68,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "nursery-p02",
          "asset": "cocoon",
          "x": 870,
          "y": 64,
          "scale": 1.8,
          "solid": 0
        },
        {
          "id": "nursery-p03",
          "asset": "eggs",
          "x": 1390,
          "y": 227,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "nursery-p04",
          "asset": "cocoon",
          "x": 1760,
          "y": 65,
          "scale": 1.6,
          "solid": 0
        },
        {
          "id": "nursery-v2-00",
          "asset": "eggtrack",
          "x": 710,
          "y": 62,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "nursery-v2-01",
          "asset": "chain",
          "x": 1540,
          "y": 63,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "nursery-v2-02",
          "asset": "resin",
          "x": 1950,
          "y": 229,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 336,
          "y": 40.400000000000006,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "nursery-p01"
        },
        {
          "x": 1331.5,
          "y": 197.1,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "nursery-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        10,
        5
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -4,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -4",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Résine adhérente. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "queenhold",
      "name": "Chambre de la Reine",
      "mode": "SETPIECE",
      "biome": "hive",
      "width": 2300,
      "floor": -4,
      "mood": "Les chaînes commencent à céder.",
      "design": "Palan suspendu, entraves autour de la Reine, coursive d’accès et emplacement de la charge.",
      "doors": [
        {
          "id": "queenhold--nursery",
          "to": "nursery",
          "pair": "nursery--queenhold",
          "x": 105,
          "y": 144,
          "gate": "sebastian",
          "phases": null,
          "kind": "door",
          "label": "Nurserie",
          "levelDelta": 0
        },
        {
          "id": "queenhold--gantry",
          "to": "gantry",
          "pair": "gantry--queenhold",
          "x": 850,
          "y": 65,
          "gate": "sebastian",
          "phases": null,
          "kind": "stairs",
          "label": "Passerelle des entraves",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "queenhold-p01",
          "asset": "chain",
          "x": 450,
          "y": 58,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "queenhold-p02",
          "asset": "eggs",
          "x": 990,
          "y": 230,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "queenhold-p03",
          "asset": "chain",
          "x": 1650,
          "y": 58,
          "scale": 1.5,
          "solid": 0
        },
        {
          "id": "queenhold-p04",
          "asset": "pylon",
          "x": 2040,
          "y": 68,
          "scale": 1.1,
          "solid": 0
        },
        {
          "id": "queenhold-v2-00",
          "asset": "pulley",
          "x": 1100,
          "y": 64,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "queenhold-v2-01",
          "asset": "counterweight",
          "x": 1360,
          "y": 65,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "queenhold-v2-02",
          "asset": "grate",
          "x": 830,
          "y": 229,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 931.5,
          "y": 200.1,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "queenhold-p02"
        }
      ],
      "collectibles": [
        {
          "id": "log-queenhold",
          "x": 1580,
          "y": 144,
          "title": "Les entraves",
          "text": "Les chaînes passent sous les plaques de la machine. De l’acide attaque déjà les verrous.",
          "reward": "archive"
        }
      ],
      "sceneOnly": false,
      "map": [
        11,
        5
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -4,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -4"
    },
    {
      "id": "tanks",
      "name": "Cuves de la station",
      "mode": "DEPTH",
      "biome": "dock",
      "width": 1900,
      "floor": 0,
      "mood": "Une chaîne suffit, si elle tient.",
      "design": "Cuve cylindrique mobile, chaîne continue vers le quai et points d’ancrage visibles.",
      "doors": [
        {
          "id": "tanks--station",
          "to": "station",
          "pair": "station--tanks",
          "x": 105,
          "y": 144,
          "gate": "escaped",
          "phases": null,
          "kind": "door",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 0
        },
        {
          "id": "tanks--icebattle",
          "to": "icebattle",
          "pair": "icebattle--tanks",
          "x": 1795,
          "y": 144,
          "gate": "chain",
          "phases": null,
          "kind": "door",
          "label": "Bord de la banquise",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "tanks-p01",
          "asset": "tank",
          "x": 500,
          "y": 70,
          "scale": 1.9,
          "solid": 1
        },
        {
          "id": "tanks-p02",
          "asset": "winch",
          "x": 1130,
          "y": 221,
          "scale": 1.2,
          "solid": 1
        },
        {
          "id": "tanks-p03",
          "asset": "rope",
          "x": 1530,
          "y": 70,
          "scale": 1.1,
          "solid": 0
        },
        {
          "id": "tanks-v2-00",
          "asset": "barrel",
          "x": 820,
          "y": 230,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tanks-v2-01",
          "asset": "hook",
          "x": 1350,
          "y": 65,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tanks-v2-02",
          "asset": "cablecoil",
          "x": 1730,
          "y": 229,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 414.5,
          "y": 26.300000000000004,
          "w": 171,
          "h": 87.39999999999999,
          "prop": "tanks-p01"
        },
        {
          "x": 1076,
          "y": 193.4,
          "w": 108,
          "h": 55.199999999999996,
          "prop": "tanks-p02"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        5,
        0
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface"
    },
    {
      "id": "icebattle",
      "name": "Bord de la banquise",
      "mode": "SETPIECE",
      "biome": "dock",
      "width": 2300,
      "floor": 0,
      "mood": "Ne pas la tuer. L’entraîner.",
      "design": "Glace, eau noire, cuve reliée à la chaîne, butoir et espace pour esquiver les charges.",
      "doors": [
        {
          "id": "icebattle--tanks",
          "to": "tanks",
          "pair": "tanks--icebattle",
          "x": 105,
          "y": 144,
          "gate": "chain",
          "phases": null,
          "kind": "door",
          "label": "Cuves de la station",
          "levelDelta": 0
        },
        {
          "id": "icebattle--elder",
          "to": "elder",
          "pair": "elder--icebattle",
          "x": 2195,
          "y": 144,
          "gate": "queen",
          "phases": null,
          "kind": "door",
          "label": "Le jugement des chasseurs",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "icebattle-p01",
          "asset": "tank",
          "x": 340,
          "y": 70,
          "scale": 1.5,
          "solid": 1
        },
        {
          "id": "icebattle-p02",
          "asset": "bollard",
          "x": 1150,
          "y": 73,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "icebattle-p03",
          "asset": "winch",
          "x": 1800,
          "y": 225,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "icebattle-v2-00",
          "asset": "chain",
          "x": 780,
          "y": 66,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "icebattle-v2-01",
          "asset": "barrel",
          "x": 1510,
          "y": 65,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "icebattle-v2-02",
          "asset": "floodlight",
          "x": 2040,
          "y": 64,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 272.5,
          "y": 35.5,
          "w": 135,
          "h": 69,
          "prop": "icebattle-p01"
        },
        {
          "x": 1091.5,
          "y": 43.099999999999994,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "icebattle-p02"
        },
        {
          "x": 1737,
          "y": 192.8,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "icebattle-p03"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        6,
        0
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "elder",
      "name": "Le jugement des chasseurs",
      "mode": "DEPTH",
      "biome": "snow",
      "width": 1700,
      "floor": 0,
      "mood": "Elle nous a vus combattre.",
      "design": "Neige intacte au-delà du quai, lumière du vaisseau, Ancien et corps de Scar.",
      "doors": [
        {
          "id": "elder--icebattle",
          "to": "icebattle",
          "pair": "icebattle--elder",
          "x": 105,
          "y": 144,
          "gate": "queen",
          "phases": null,
          "kind": "door",
          "label": "Bord de la banquise",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "elder-p01",
          "asset": "rubble",
          "x": 330,
          "y": 68,
          "scale": 1,
          "solid": 1
        },
        {
          "id": "elder-p02",
          "asset": "pylon",
          "x": 1180,
          "y": 73,
          "scale": 0.9,
          "solid": 0
        },
        {
          "id": "elder-v2-00",
          "asset": "sled",
          "x": 1450,
          "y": 228,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 285,
          "y": 45,
          "w": 90,
          "h": 46,
          "prop": "elder-p01"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "map": [
        7,
        0
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface"
    },
    {
      "id": "vessel",
      "name": "Vaisseau · Épilogue",
      "mode": "SIDE",
      "biome": "alienShip",
      "width": 1600,
      "floor": 0,
      "mood": "Quelque chose a survécu.",
      "design": "Tableau séparé de la navigation de Lex : corps de Scar dans la soute.",
      "doors": [],
      "props": [
        {
          "id": "vessel-p01",
          "asset": "altar",
          "x": 810,
          "y": 88,
          "scale": 2,
          "solid": 0
        },
        {
          "id": "vessel-p02",
          "asset": "obelisk",
          "x": 370,
          "y": 70,
          "scale": 1.6,
          "solid": 0
        },
        {
          "id": "vessel-p03",
          "asset": "obelisk",
          "x": 1260,
          "y": 70,
          "scale": 1.6,
          "solid": 0
        },
        {
          "id": "vessel-v2-00",
          "asset": "pulley",
          "x": 1140,
          "y": 64,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": true,
      "map": [
        8,
        0
      ],
      "sector": "Vaisseau",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Vaisseau · épilogue"
    },
    {
      "id": "infirmary",
      "name": "Infirmerie de la station",
      "mode": "SIDE",
      "biome": "timber",
      "width": 1200,
      "floor": 0,
      "mood": "Du matériel qui n’a pas servi depuis un siècle.",
      "design": "Lit métallique, étagère, coffre de secours récent laissé par l’expédition.",
      "doors": [
        {
          "id": "infirmary--station",
          "to": "station",
          "pair": "station--infirmary",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "infirmary-p01",
          "asset": "bench",
          "x": 450,
          "y": 70,
          "scale": 1.3,
          "solid": 0
        },
        {
          "id": "infirmary-p02",
          "asset": "medkit",
          "x": 860,
          "y": 65,
          "scale": 1.1,
          "solid": 0
        },
        {
          "id": "infirmary-v2-00",
          "asset": "locker",
          "x": 680,
          "y": 64,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "infirmary-v2-01",
          "asset": "worklamp",
          "x": 1020,
          "y": 66,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "infirmary-v2-02",
          "asset": "coat",
          "x": 270,
          "y": 66,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [],
      "collectibles": [
        {
          "id": "log-infirmary",
          "x": 870,
          "y": 144,
          "title": "La caisse de secours",
          "text": "L’expédition a laissé une trousse ici. Elle ne date pas des baleiniers.",
          "reward": "medkit"
        }
      ],
      "sceneOnly": false,
      "map": [
        2,
        -1
      ],
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface"
    },
    {
      "id": "trophies",
      "name": "Galerie des trophées",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 1550,
      "floor": -3,
      "mood": "Les murs comptent les chasses.",
      "design": "Niches votives, stèles, trophées anciens. Salle annexe, pas un arsenal gratuit.",
      "doors": [
        {
          "id": "trophies--refuge",
          "to": "refuge",
          "pair": "refuge--trophies",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Dernier abri",
          "levelDelta": 0
        },
        {
          "id": "trophies--nursery",
          "to": "nursery",
          "pair": "nursery--trophies",
          "x": 1000,
          "y": 65,
          "gate": "alliance",
          "phases": [
            0,
            2
          ],
          "kind": "stairs",
          "label": "Nurserie",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "trophies-p01",
          "asset": "relief",
          "x": 400,
          "y": 68,
          "scale": 1.3,
          "solid": 1
        },
        {
          "id": "trophies-p02",
          "asset": "statue",
          "x": 760,
          "y": 70,
          "scale": 1.5,
          "solid": 1
        },
        {
          "id": "trophies-p03",
          "asset": "bones",
          "x": 1210,
          "y": 226,
          "scale": 1.4,
          "solid": 1
        },
        {
          "id": "trophies-v2-00",
          "asset": "tablet",
          "x": 550,
          "y": 64,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "trophies-v2-01",
          "asset": "hook",
          "x": 940,
          "y": 65,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "trophies-v2-02",
          "asset": "braziertall",
          "x": 1330,
          "y": 65,
          "scale": 0.85,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 341.5,
          "y": 38.099999999999994,
          "w": 117,
          "h": 59.800000000000004,
          "prop": "trophies-p01"
        },
        {
          "x": 692.5,
          "y": 35.5,
          "w": 135,
          "h": 69,
          "prop": "trophies-p02"
        },
        {
          "x": 1147,
          "y": 193.8,
          "w": 125.99999999999999,
          "h": 64.39999999999999,
          "prop": "trophies-p03"
        }
      ],
      "collectibles": [
        {
          "id": "log-trophies",
          "x": 740,
          "y": 144,
          "title": "La marque du chasseur",
          "text": "La même marque revient sur les stèles. Elle ne désigne pas une famille : elle atteste une épreuve.",
          "reward": "archive"
        }
      ],
      "sceneOnly": false,
      "map": [
        7,
        5
      ],
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3"
    },
    {
      "id": "engine",
      "name": "Station · Salle des machines",
      "mode": "HYBRID",
      "biome": "timber",
      "width": 1750,
      "floor": 0,
      "map": [
        3,
        1
      ],
      "mood": "Le groupe de l’expédition est raccordé à la vieille chaudière.",
      "design": "Chaudron froid au mur, générateur portable moderne séparé de la machine de 1904 ; distribution électrique visible vers la cour.",
      "doors": [
        {
          "id": "engine--station",
          "to": "station",
          "pair": "station--engine",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station baleinière · Rue centrale",
          "levelDelta": 0
        },
        {
          "id": "engine--cellar",
          "to": "cellar",
          "pair": "cellar--engine",
          "x": 1550,
          "y": 70,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Station · Cave des réserves",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "engine-v2-00",
          "asset": "boiler",
          "x": 500,
          "y": 68,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-01",
          "asset": "pipebank",
          "x": 1150,
          "y": 62,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-02",
          "asset": "generator",
          "x": 750,
          "y": 228,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-03",
          "asset": "switchboard",
          "x": 1310,
          "y": 68,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-04",
          "asset": "valve",
          "x": 360,
          "y": 66,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-05",
          "asset": "oilcan",
          "x": 1610,
          "y": 230,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-06",
          "asset": "cablecoil",
          "x": 990,
          "y": 230,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "engine-v2-07",
          "asset": "worklamp",
          "x": 1500,
          "y": 61,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 460,
          "y": 55,
          "w": 140,
          "h": 48,
          "prop": "engine-architectural-base",
          "architectural": true
        }
      ],
      "collectibles": [
        {
          "id": "engine-note",
          "x": 570,
          "y": 144,
          "title": "Un départ trop rapide",
          "text": "Le matériel a été posé sur un sol vieux d’un siècle. Le câble neuf rejoint une prise improvisée.",
          "reward": null
        }
      ],
      "sceneOnly": false,
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 0,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Surface",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "tower",
      "name": "Station · Tour radio",
      "mode": "SIDE",
      "biome": "timber",
      "width": 1400,
      "floor": 1,
      "map": [
        3,
        -2
      ],
      "mood": "La neige frappe les vitres. En haut, le relais reçoit encore.",
      "design": "Plateforme haute de la tour accessible par l’escalier du hall ; fenêtre sur la cour, antenne en extérieur et poste radio de l’expédition.",
      "doors": [
        {
          "id": "tower--office",
          "to": "office",
          "pair": "office--tower",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Bureau du contremaître",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "tower-v2-00",
          "asset": "radio",
          "x": 840,
          "y": 66,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tower-v2-01",
          "asset": "antenna",
          "x": 1090,
          "y": 66,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tower-v2-02",
          "asset": "binoculars",
          "x": 515,
          "y": 68,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tower-v2-03",
          "asset": "bench",
          "x": 650,
          "y": 64,
          "scale": 1.5,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tower-v2-04",
          "asset": "frostwindow",
          "x": 385,
          "y": 60,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tower-v2-05",
          "asset": "cablecoil",
          "x": 1240,
          "y": 70,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "tower-v3-extra0",
          "asset": "binoculars",
          "x": 1110,
          "y": 65,
          "scale": 0.75,
          "solid": false,
          "layer": "structure",
          "purpose": "Point de guet de surface."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 1,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Étage +1"
    },
    {
      "id": "weights",
      "name": "Salle des contrepoids",
      "mode": "DEPTH",
      "biome": "maze",
      "width": 2100,
      "floor": -2,
      "map": [
        9,
        2
      ],
      "mood": "Chaque bloc répond au poids suspendu de l’autre côté.",
      "design": "Trois contrepoids suspendus sur des chaînes verticales, consoles en retrait, dalle mobile centrale et issue vers le couloir de l’étau.",
      "doors": [
        {
          "id": "weights--pivot",
          "to": "pivot",
          "pair": "pivot--weights",
          "x": 105,
          "y": 144,
          "gate": "plasma",
          "phases": null,
          "kind": "stairs",
          "label": "Croisée mobile",
          "levelDelta": -1
        },
        {
          "id": "weights--press",
          "to": "press",
          "pair": "press--weights",
          "x": 1995,
          "y": 144,
          "gate": "plasma",
          "phases": null,
          "kind": "stairs",
          "label": "Couloir de l’étau",
          "levelDelta": -1
        },
        {
          "id": "weights--cloister",
          "to": "cloister",
          "pair": "cloister--weights",
          "x": 1760,
          "y": 65,
          "gate": "cycle",
          "phases": null,
          "kind": "door",
          "label": "Pyramide · Galerie des niches",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "weights-v2-00",
          "asset": "counterweight",
          "x": 410,
          "y": 65,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-01",
          "asset": "counterweight",
          "x": 890,
          "y": 65,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-02",
          "asset": "counterweight",
          "x": 1500,
          "y": 65,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-03",
          "asset": "winchstone",
          "x": 670,
          "y": 230,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-04",
          "asset": "winchstone",
          "x": 1320,
          "y": 230,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-05",
          "asset": "rubble",
          "x": 1780,
          "y": 225,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-06",
          "asset": "relief",
          "x": 1900,
          "y": 60,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "weights-v2-07",
          "asset": "lever",
          "x": 1060,
          "y": 65,
          "scale": 1.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 1440,
          "y": 54,
          "w": 125,
          "h": 48,
          "prop": "weights-architectural-base",
          "architectural": true
        }
      ],
      "collectibles": [
        {
          "id": "weights-note",
          "x": 1580,
          "y": 144,
          "title": "Le poids de la pierre",
          "text": "Les blocs reprennent toujours la même place. Le passage devant la dalle reste la seule chose imprévisible sans écouter.",
          "reward": null
        }
      ],
      "sceneOnly": false,
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "astrarium",
      "name": "Chambre des cycles",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 1650,
      "floor": -2,
      "map": [
        7,
        3
      ],
      "mood": "Le disque ne donne pas une date. Il annonce le prochain passage.",
      "design": "Disque de pierre encastré au mur, trois empreintes lumineuses, relevé optionnel qui renseigne les chemins de service.",
      "doors": [
        {
          "id": "astrarium--glyphs",
          "to": "glyphs",
          "pair": "glyphs--astrarium",
          "x": 105,
          "y": 144,
          "gate": "ritual",
          "phases": null,
          "kind": "stairs",
          "label": "Galerie du rite",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "astrarium-v2-00",
          "asset": "calendar",
          "x": 825,
          "y": 65,
          "scale": 2.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "astrarium-v2-01",
          "asset": "statue",
          "x": 360,
          "y": 68,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "astrarium-v2-02",
          "asset": "statue",
          "x": 1310,
          "y": 68,
          "scale": 1.2,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "astrarium-v2-03",
          "asset": "brazier",
          "x": 600,
          "y": 230,
          "scale": 0.75,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "astrarium-v2-04",
          "asset": "brazier",
          "x": 1080,
          "y": 230,
          "scale": 0.75,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "astrarium-v2-05",
          "asset": "tablet",
          "x": 1100,
          "y": 68,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        }
      ],
      "solids": [
        {
          "x": 1250,
          "y": 55,
          "w": 115,
          "h": 43,
          "prop": "astrarium-architectural-base",
          "architectural": true
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2"
    },
    {
      "id": "incubator",
      "name": "Conduite d’incubation",
      "mode": "SIDE",
      "biome": "hive",
      "width": 1850,
      "floor": -3,
      "map": [
        9,
        6
      ],
      "mood": "Sous les dalles, les œufs avancent vers les chambres.",
      "design": "Caniveau central technique, alcôves occupées par des œufs individuels ; chemin latéral étroit et coude de sortie vers la nurserie.",
      "doors": [
        {
          "id": "incubator--service",
          "to": "service",
          "pair": "service--incubator",
          "x": 105,
          "y": 144,
          "gate": "alliance",
          "phases": null,
          "kind": "stairs",
          "label": "Passage sous les dalles",
          "levelDelta": -1
        },
        {
          "id": "incubator--nursery",
          "to": "nursery",
          "pair": "nursery--incubator",
          "x": 1745,
          "y": 144,
          "gate": "alliance",
          "phases": null,
          "kind": "stairs",
          "label": "Nurserie",
          "levelDelta": -1
        },
        {
          "id": "incubator--drain",
          "to": "drain",
          "pair": "drain--incubator",
          "x": 470,
          "y": 65,
          "gate": "alliance",
          "phases": null,
          "kind": "vent",
          "label": "Pyramide · Drain de la citerne",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "incubator-v2-00",
          "asset": "eggtrack",
          "x": 650,
          "y": 63,
          "scale": 2.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v2-01",
          "asset": "eggtrack",
          "x": 1350,
          "y": 63,
          "scale": 2.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v2-02",
          "asset": "resin",
          "x": 350,
          "y": 62,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v2-03",
          "asset": "resin",
          "x": 1590,
          "y": 63,
          "scale": 1.9,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v2-04",
          "asset": "grate",
          "x": 1070,
          "y": 64,
          "scale": 1.5,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v2-05",
          "asset": "valve",
          "x": 810,
          "y": 68,
          "scale": 1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v2-06",
          "asset": "bones",
          "x": 1450,
          "y": 65,
          "scale": 0.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "incubator-v3-extra0",
          "asset": "stonearch",
          "x": 700,
          "y": 59,
          "scale": 1.2,
          "solid": false,
          "layer": "structure",
          "purpose": "Renfoncement hors de la mâchoire mobile."
        }
      ],
      "solids": [],
      "collectibles": [
        {
          "id": "incubator-note",
          "x": 1650,
          "y": 144,
          "title": "La conduite",
          "text": "Ce n’est pas une fissure. Les rainures portent des traces répétées, comme si quelque chose y avait été transporté.",
          "reward": null
        }
      ],
      "sceneOnly": false,
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Eau peu profonde. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "gantry",
      "name": "Passerelle des entraves",
      "mode": "DEPTH",
      "biome": "hive",
      "width": 2050,
      "floor": -3,
      "map": [
        11,
        4
      ],
      "mood": "La structure porte la Reine. L’acide commence à mordre le métal.",
      "design": "Coursive devant un gouffre, trains de poulies au plafond, poste mécanique latéral et chemin sécurisé vers la chambre de la Reine.",
      "doors": [
        {
          "id": "gantry--nursery",
          "to": "nursery",
          "pair": "nursery--gantry",
          "x": 105,
          "y": 144,
          "gate": "sebastian",
          "phases": null,
          "kind": "stairs",
          "label": "Nurserie",
          "levelDelta": -1
        },
        {
          "id": "gantry--queenhold",
          "to": "queenhold",
          "pair": "queenhold--gantry",
          "x": 1945,
          "y": 144,
          "gate": "sebastian",
          "phases": null,
          "kind": "stairs",
          "label": "Chambre de la Reine",
          "levelDelta": -1
        },
        {
          "id": "gantry--drain",
          "to": "drain",
          "pair": "drain--gantry",
          "x": 1610,
          "y": 144,
          "gate": "sebastian",
          "phases": null,
          "kind": "stairs",
          "label": "Pyramide · Drain de la citerne",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "gantry-v2-00",
          "asset": "pulley",
          "x": 460,
          "y": 62,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-01",
          "asset": "pulley",
          "x": 1210,
          "y": 62,
          "scale": 1.8,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-02",
          "asset": "chain",
          "x": 1720,
          "y": 65,
          "scale": 2.1,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-03",
          "asset": "counterweight",
          "x": 780,
          "y": 65,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-04",
          "asset": "lever",
          "x": 920,
          "y": 62,
          "scale": 1.3,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-05",
          "asset": "resin",
          "x": 1500,
          "y": 64,
          "scale": 1.4,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-06",
          "asset": "grate",
          "x": 420,
          "y": 226,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-07",
          "asset": "grate",
          "x": 1090,
          "y": 226,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v2-08",
          "asset": "grate",
          "x": 1740,
          "y": 226,
          "scale": 1.7,
          "solid": 0,
          "layer": "dressing",
          "purpose": "Décor fixe placé hors de l’axe des seuils et de la bande centrale."
        },
        {
          "id": "gantry-v3-extra0",
          "asset": "railingstone",
          "x": 1300,
          "y": 230,
          "scale": 1.25,
          "solid": false,
          "layer": "structure",
          "purpose": "Garde-corps interrompu devant l’escalier du drain."
        }
      ],
      "solids": [
        {
          "x": 750,
          "y": 51,
          "w": 98,
          "h": 47,
          "prop": "gantry-architectural-base",
          "architectural": true
        }
      ],
      "collectibles": [
        {
          "id": "gantry-note",
          "x": 1660,
          "y": 144,
          "title": "Sous la coursive",
          "text": "Les chaînes se rejoignent au-dessus de la chambre. Il ne faut pas regarder trop longtemps ce qui les tire.",
          "reward": null
        }
      ],
      "sceneOnly": false,
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Métal résonnant. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "dormitory",
      "name": "Station · Dortoir des baleiniers",
      "mode": "SIDE",
      "biome": "timber",
      "width": 1650,
      "floor": 1,
      "map": [
        4,
        -2
      ],
      "mood": "Les lits sont faits. Personne n’est revenu les défaire.",
      "design": "Étage au-dessus du bureau et de l’atelier. Lits superposés adossés au mur, objets personnels dans leurs casiers, axe de marche libre. La pièce ne prétend pas reproduire un plan du film.",
      "doors": [
        {
          "id": "dormitory--office",
          "to": "office",
          "pair": "office--dormitory",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Bureau du contremaître",
          "levelDelta": -1
        },
        {
          "id": "dormitory--mess",
          "to": "mess",
          "pair": "mess--dormitory",
          "x": 1545,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station · Réfectoire",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "dormitory-v3-00",
          "asset": "bunk",
          "x": 380,
          "y": 64,
          "scale": 1.35,
          "solid": false,
          "layer": "structure",
          "purpose": "Deux couchages contre le mur porteur."
        },
        {
          "id": "dormitory-v3-01",
          "asset": "bunk",
          "x": 1020,
          "y": 64,
          "scale": 1.35,
          "solid": false,
          "layer": "structure",
          "purpose": "Seconde travée du dortoir."
        },
        {
          "id": "dormitory-v3-02",
          "asset": "coat",
          "x": 660,
          "y": 60,
          "scale": 1,
          "solid": false,
          "layer": "structure",
          "purpose": "Vêtement suspendu au pied des lits."
        },
        {
          "id": "dormitory-v3-03",
          "asset": "frostwindow",
          "x": 1310,
          "y": 55,
          "scale": 1,
          "solid": false,
          "layer": "structure",
          "purpose": "Fenêtre donnant sur le même front de neige que la rue."
        },
        {
          "id": "dormitory-v3-04",
          "asset": "boots",
          "x": 520,
          "y": 65,
          "scale": 0.7,
          "solid": false,
          "layer": "structure",
          "purpose": "Chaussures rangées, non utilisables comme équipement."
        },
        {
          "id": "dormitory-v3-05",
          "asset": "calendar",
          "x": 760,
          "y": 62,
          "scale": 0.6,
          "solid": false,
          "layer": "structure",
          "purpose": "Repère d’époque, pas une date de quête."
        },
        {
          "id": "dormitory-v3-06",
          "asset": "bedroll",
          "x": 1110,
          "y": 72,
          "scale": 0.6,
          "solid": false,
          "layer": "structure",
          "purpose": "Linge du dortoir."
        },
        {
          "id": "dormitory-v3-07",
          "asset": "suitcase",
          "x": 290,
          "y": 67,
          "scale": 0.6,
          "solid": false,
          "layer": "structure",
          "purpose": "Bagage abandonné sous un lit."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "sourceStatus": "original-game-layout",
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 1,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Étage +1"
    },
    {
      "id": "mess",
      "name": "Station · Réfectoire",
      "mode": "HYBRID",
      "biome": "timber",
      "width": 1750,
      "floor": 1,
      "map": [
        5,
        -2
      ],
      "mood": "Trois tasses sont restées sur la même table.",
      "design": "Suite du dortoir avec retour par escalier à l’atelier. Tables au fond, poêle contre le conduit, caisse de la nouvelle expédition distincte des affaires anciennes.",
      "doors": [
        {
          "id": "mess--dormitory",
          "to": "dormitory",
          "pair": "dormitory--mess",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "door",
          "label": "Station · Dortoir des baleiniers",
          "levelDelta": 0
        },
        {
          "id": "mess--workshop",
          "to": "workshop",
          "pair": "workshop--mess",
          "x": 1645,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Atelier des baleiniers",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "mess-v3-00",
          "asset": "stove",
          "x": 420,
          "y": 68,
          "scale": 1.1,
          "solid": false,
          "layer": "structure",
          "purpose": "Poêle sous son conduit."
        },
        {
          "id": "mess-v3-01",
          "asset": "diningtable",
          "x": 920,
          "y": 68,
          "scale": 1.35,
          "solid": false,
          "layer": "structure",
          "purpose": "Table du réfectoire, hors chemin central."
        },
        {
          "id": "mess-v3-02",
          "asset": "shelf",
          "x": 1250,
          "y": 66,
          "scale": 1.1,
          "solid": false,
          "layer": "structure",
          "purpose": "Vaisselle contre le mur."
        },
        {
          "id": "mess-v3-03",
          "asset": "mug",
          "x": 865,
          "y": 66,
          "scale": 0.7,
          "solid": false,
          "layer": "structure",
          "purpose": "Tasse sur la table."
        },
        {
          "id": "mess-v3-04",
          "asset": "mug",
          "x": 1030,
          "y": 66,
          "scale": 0.7,
          "solid": false,
          "layer": "structure",
          "purpose": "Deuxième tasse."
        },
        {
          "id": "mess-v3-05",
          "asset": "lantern",
          "x": 1370,
          "y": 67,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Lampe posée sur l’étagère."
        },
        {
          "id": "mess-v3-06",
          "asset": "frostwindow",
          "x": 660,
          "y": 54,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Baie gelée de l’étage."
        },
        {
          "id": "mess-v3-07",
          "asset": "bench",
          "x": 1150,
          "y": 232,
          "scale": 1.1,
          "solid": false,
          "layer": "foreground",
          "purpose": "Banc au premier plan, transparent près de Lex."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "sourceStatus": "original-game-layout",
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": 1,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Étage +1"
    },
    {
      "id": "cellar",
      "name": "Station · Cave des réserves",
      "mode": "DEPTH",
      "biome": "timber",
      "width": 1800,
      "floor": -1,
      "map": [
        2,
        1
      ],
      "mood": "Les étiquettes se lisent encore sous le givre.",
      "design": "Niveau sous la machinerie ; racks de stockage en périphérie, allée médiane, aucun appareil médical ancien présenté comme consommable utilisable.",
      "doors": [
        {
          "id": "cellar--engine",
          "to": "engine",
          "pair": "engine--cellar",
          "x": 105,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Station · Salle des machines",
          "levelDelta": 1
        },
        {
          "id": "cellar--workshop",
          "to": "workshop",
          "pair": "workshop--cellar",
          "x": 1695,
          "y": 144,
          "gate": null,
          "phases": null,
          "kind": "stairs",
          "label": "Atelier des baleiniers",
          "shortcut": "cellar-hatch",
          "unlockFrom": "cellar",
          "levelDelta": 1
        }
      ],
      "props": [
        {
          "id": "cellar-v3-00",
          "asset": "shelf",
          "x": 380,
          "y": 68,
          "scale": 1.35,
          "solid": false,
          "layer": "structure",
          "purpose": "Râtelier fixé au mur gauche."
        },
        {
          "id": "cellar-v3-01",
          "asset": "barrel",
          "x": 830,
          "y": 72,
          "scale": 1.3,
          "solid": true,
          "layer": "structure",
          "purpose": "Fûts anciens, pas du ravitaillement contemporain."
        },
        {
          "id": "cellar-v3-02",
          "asset": "shelf",
          "x": 1260,
          "y": 65,
          "scale": 1.3,
          "solid": false,
          "layer": "structure",
          "purpose": "Rayonnage interrompu avant le palier."
        },
        {
          "id": "cellar-v3-03",
          "asset": "pipebank",
          "x": 990,
          "y": 56,
          "scale": 1.2,
          "solid": false,
          "layer": "structure",
          "purpose": "Descente de conduite depuis la machinerie."
        },
        {
          "id": "cellar-v3-04",
          "asset": "crates-stack",
          "x": 560,
          "y": 226,
          "scale": 0.9,
          "solid": true,
          "layer": "foreground",
          "purpose": "Stock en avant-plan, contour possible au centre."
        },
        {
          "id": "cellar-v3-05",
          "asset": "worklamp",
          "x": 1510,
          "y": 65,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Éclairage récent amené par l’expédition."
        },
        {
          "id": "cellar-v3-06",
          "asset": "grate",
          "x": 1000,
          "y": 72,
          "scale": 0.8,
          "solid": false,
          "layer": "structure",
          "purpose": "Drain de la cave."
        },
        {
          "id": "cellar-v3-07",
          "asset": "oilcan",
          "x": 220,
          "y": 225,
          "scale": 0.85,
          "solid": false,
          "layer": "foreground",
          "purpose": "Bidon désaffecté en bord de pièce."
        }
      ],
      "solids": [
        {
          "x": 775.4,
          "y": 54,
          "w": 109.2,
          "h": 36,
          "prop": "cellar-v3-01"
        },
        {
          "x": 522.2,
          "y": 208,
          "w": 75.60000000000001,
          "h": 36,
          "prop": "cellar-v3-04"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "sourceStatus": "original-game-layout",
      "sector": "Surface",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -1,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -1",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Eau peu profonde. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "balcony",
      "name": "Pyramide · Balcon des bâtisseurs",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 1850,
      "floor": -2,
      "map": [
        6,
        3
      ],
      "mood": "La façade est juste de l’autre côté de ce mur.",
      "design": "Coursive haute de la pyramide. Le retour vers le vestibule doit être déverrouillé depuis ce côté ; les garde-corps et l’assise du monument restent visibles.",
      "doors": [
        {
          "id": "balcony--refuge",
          "to": "refuge",
          "pair": "refuge--balcony",
          "x": 105,
          "y": 144,
          "gate": "ritual",
          "phases": null,
          "kind": "stairs",
          "label": "Dernier abri",
          "levelDelta": -1
        },
        {
          "id": "balcony--vestibule",
          "to": "vestibule",
          "pair": "vestibule--balcony",
          "x": 1745,
          "y": 144,
          "gate": "ritual",
          "phases": null,
          "kind": "stairs",
          "label": "Vestibule des trois peuples",
          "shortcut": "balcony-return",
          "unlockFrom": "balcony",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "balcony-v3-00",
          "asset": "stonearch",
          "x": 430,
          "y": 65,
          "scale": 1.65,
          "solid": false,
          "layer": "structure",
          "purpose": "Baie ouverte sur la façade intérieure."
        },
        {
          "id": "balcony-v3-01",
          "asset": "stonearch",
          "x": 1220,
          "y": 65,
          "scale": 1.65,
          "solid": false,
          "layer": "structure",
          "purpose": "Seconde travée ; pas une porte utilisable."
        },
        {
          "id": "balcony-v3-02",
          "asset": "relief",
          "x": 760,
          "y": 63,
          "scale": 1.15,
          "solid": false,
          "layer": "structure",
          "purpose": "Instruction de construction près du chemin retour."
        },
        {
          "id": "balcony-v3-03",
          "asset": "railingstone",
          "x": 500,
          "y": 234,
          "scale": 1.35,
          "solid": false,
          "layer": "foreground",
          "purpose": "Garde-corps de la coursive."
        },
        {
          "id": "balcony-v3-04",
          "asset": "railingstone",
          "x": 1440,
          "y": 234,
          "scale": 1.3,
          "solid": false,
          "layer": "foreground",
          "purpose": "Garde-corps interrompu aux seuils."
        },
        {
          "id": "balcony-v3-05",
          "asset": "rubble",
          "x": 995,
          "y": 68,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Fragment au bord, sans enfermer le joueur."
        },
        {
          "id": "balcony-v3-06",
          "asset": "braziertall",
          "x": 1530,
          "y": 64,
          "scale": 0.8,
          "solid": false,
          "layer": "structure",
          "purpose": "Lumière avant le levier du retour."
        },
        {
          "id": "balcony-v3-07",
          "asset": "pulley",
          "x": 1650,
          "y": 59,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Le mécanisme du verrou rejoint la porte de retour."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "sourceStatus": "original-game-layout",
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2"
    },
    {
      "id": "drain",
      "name": "Pyramide · Drain de la citerne",
      "mode": "SIDE",
      "biome": "maze",
      "width": 1850,
      "floor": -3,
      "map": [
        10,
        6
      ],
      "mood": "L’eau entraîne la poussière, pas la résine.",
      "design": "Drain accessible depuis la conduite d’incubation, palier vers les entraves. Rigole ancienne au fond et nappe d’eau peu profonde sur la marche centrale ; les joints secs aux extrémités restent lisibles. La vanne contrôle un rideau de condensation, pas une nouvelle porte.",
      "doors": [
        {
          "id": "drain--incubator",
          "to": "incubator",
          "pair": "incubator--drain",
          "x": 105,
          "y": 144,
          "gate": "alliance",
          "phases": null,
          "kind": "vent",
          "label": "Conduite d’incubation",
          "levelDelta": 0
        },
        {
          "id": "drain--gantry",
          "to": "gantry",
          "pair": "gantry--drain",
          "x": 1745,
          "y": 144,
          "gate": "sebastian",
          "phases": null,
          "kind": "stairs",
          "label": "Passerelle des entraves",
          "levelDelta": 0
        }
      ],
      "props": [
        {
          "id": "drain-v3-00",
          "asset": "waterchannel",
          "x": 480,
          "y": 60,
          "scale": 1.5,
          "solid": false,
          "layer": "structure",
          "purpose": "Rigole décaissée au fond, non jouable."
        },
        {
          "id": "drain-v3-01",
          "asset": "waterchannel",
          "x": 1240,
          "y": 60,
          "scale": 1.5,
          "solid": false,
          "layer": "structure",
          "purpose": "Continuité de la rigole vers l’aval."
        },
        {
          "id": "drain-v3-02",
          "asset": "grate",
          "x": 820,
          "y": 65,
          "scale": 1.2,
          "solid": false,
          "layer": "structure",
          "purpose": "Grille ancienne, distincte des portes."
        },
        {
          "id": "drain-v3-03",
          "asset": "resin",
          "x": 1100,
          "y": 60,
          "scale": 1,
          "solid": false,
          "layer": "structure",
          "purpose": "Infestation localisée en provenance de la conduite."
        },
        {
          "id": "drain-v3-04",
          "asset": "rubble",
          "x": 1470,
          "y": 65,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Débris dans le bord de la rigole."
        },
        {
          "id": "drain-v3-05",
          "asset": "relief",
          "x": 330,
          "y": 58,
          "scale": 1,
          "solid": false,
          "layer": "structure",
          "purpose": "Repère du niveau inférieur."
        },
        {
          "id": "drain-v3-06",
          "asset": "chain",
          "x": 1610,
          "y": 58,
          "scale": 0.75,
          "solid": false,
          "layer": "structure",
          "purpose": "Chaîne du palier des entraves."
        },
        {
          "id": "drain-v3-07",
          "asset": "brazier",
          "x": 700,
          "y": 67,
          "scale": 0.7,
          "solid": false,
          "layer": "structure",
          "purpose": "Lumière guidant la sortie."
        }
      ],
      "solids": [],
      "collectibles": [],
      "sceneOnly": false,
      "sourceStatus": "original-game-layout",
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -3,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -3",
      "terrainIntent": "Les régions de sol visibles sont les régions de bruit et de vitesse de la simulation : Eau peu profonde. Elles ne créent pas de collision invisible ; les accessoires restent séparés du passage."
    },
    {
      "id": "cloister",
      "name": "Pyramide · Galerie des niches",
      "mode": "HYBRID",
      "biome": "temple",
      "width": 2050,
      "floor": -2,
      "map": [
        10,
        3
      ],
      "mood": "Les niches sont assez profondes pour dissimuler une silhouette.",
      "design": "Galerie entre contrepoids et salle du filet ; niches de refuge dans le mur porteur, ligne de vue rompue par les contreforts. Le passage rejoint la même scène, sans second Grid.",
      "doors": [
        {
          "id": "cloister--weights",
          "to": "weights",
          "pair": "weights--cloister",
          "x": 105,
          "y": 144,
          "gate": "cycle",
          "phases": null,
          "kind": "door",
          "label": "Salle des contrepoids",
          "levelDelta": 0
        },
        {
          "id": "cloister--duel",
          "to": "duel",
          "pair": "duel--cloister",
          "x": 1945,
          "y": 144,
          "gate": "cycle",
          "phases": null,
          "kind": "stairs",
          "label": "Salle du filet",
          "levelDelta": -1
        }
      ],
      "props": [
        {
          "id": "cloister-v3-00",
          "asset": "stonearch",
          "x": 520,
          "y": 62,
          "scale": 1.35,
          "solid": false,
          "layer": "structure",
          "purpose": "Niche arrière, non issue."
        },
        {
          "id": "cloister-v3-01",
          "asset": "stonearch",
          "x": 1370,
          "y": 62,
          "scale": 1.35,
          "solid": false,
          "layer": "structure",
          "purpose": "Niche arrière, distincte du passage du filet."
        },
        {
          "id": "cloister-v3-02",
          "asset": "relief",
          "x": 940,
          "y": 64,
          "scale": 1.1,
          "solid": false,
          "layer": "structure",
          "purpose": "Marques qui prolongent la chambre des cycles."
        },
        {
          "id": "cloister-v3-03",
          "asset": "pillar",
          "x": 380,
          "y": 230,
          "scale": 1.1,
          "solid": true,
          "layer": "foreground",
          "purpose": "Contrefort avant ne bouchant pas l’axe central."
        },
        {
          "id": "cloister-v3-04",
          "asset": "pillar",
          "x": 1120,
          "y": 66,
          "scale": 1,
          "solid": true,
          "layer": "structure",
          "purpose": "Appui structurel décalé."
        },
        {
          "id": "cloister-v3-05",
          "asset": "brazier",
          "x": 1710,
          "y": 66,
          "scale": 0.9,
          "solid": false,
          "layer": "structure",
          "purpose": "Repère du seuil de sortie."
        },
        {
          "id": "cloister-v3-06",
          "asset": "bones",
          "x": 800,
          "y": 230,
          "scale": 1,
          "solid": false,
          "layer": "foreground",
          "purpose": "Restes dans une niche basse."
        },
        {
          "id": "cloister-v3-07",
          "asset": "rubble",
          "x": 1550,
          "y": 231,
          "scale": 0.9,
          "solid": false,
          "layer": "foreground",
          "purpose": "Débris appuyés au mur."
        }
      ],
      "solids": [
        {
          "x": 333.8,
          "y": 212,
          "w": 92.4,
          "h": 36,
          "prop": "cloister-v3-03"
        },
        {
          "x": 1078,
          "y": 48,
          "w": 84,
          "h": 36,
          "prop": "cloister-v3-04"
        }
      ],
      "collectibles": [],
      "sceneOnly": false,
      "sourceStatus": "original-game-layout",
      "sector": "Pyramide",
      "continuity": {
        "source": "Plan de jeu original, non relevé 1:1 du film",
        "entranceRule": "Seuil apparié, arrivée au même côté de pièce",
        "clearance": "Bande centrale conservée ; passages secondaires contrôlés séparément",
        "floor": -2,
        "datum": "Repère de mise en scène : surface = 0 ; étages au-dessus positifs ; sous-sol négatif. Pas de mètres ni de géographie film certifiée."
      },
      "floorLabel": "Sous-sol -2"
    }
  ],
  "chapters": [
    {
      "id": "avp04-01",
      "number": 1,
      "room": "brief",
      "flag": "briefing",
      "title": "Consulter les relevés thermiques",
      "x": 690,
      "y": 144,
      "speaker": "Weyland",
      "line": "Le signal vient de sous la glace. Nous avons une chance de découvrir ce qui l’émet.",
      "after": "Le relevé ne dit rien de ce qui nous attend.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-02",
      "number": 2,
      "room": "gear",
      "flag": "gear",
      "title": "Préparer le matériel de descente",
      "x": 770,
      "y": 144,
      "speaker": "Lex",
      "line": "On prend les cordes, les lampes et le matériel de secours. Et personne ne descend seul.",
      "after": "Le piolet et les cordes sont prêts.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-03",
      "number": 3,
      "room": "station",
      "flag": "radio",
      "title": "Rétablir le relais de l’expédition",
      "x": 840,
      "y": 152,
      "speaker": "Miller",
      "line": "La liaison tient. Mais pas à travers six cents mètres de glace.",
      "after": "Le camp peut maintenant nous entendre.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-04",
      "number": 4,
      "room": "bore",
      "flag": "rope",
      "title": "Vérifier la ligne de rappel",
      "x": 1170,
      "y": 144,
      "speaker": "Lex",
      "line": "Les ancrages sont bons. Gardez vos distances sur la ligne.",
      "after": "La descente est assurée.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-05",
      "number": 5,
      "room": "forecourt",
      "flag": "facade",
      "title": "Relever les inscriptions du parvis",
      "x": 1030,
      "y": 144,
      "speaker": "Sebastian",
      "line": "Ces formes ne devraient pas se retrouver ensemble. Pourtant, elles racontent la même chose.",
      "after": "La porte mène sous le monument.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-06",
      "number": 6,
      "room": "sacrifice",
      "flag": "tables",
      "title": "Examiner les dalles",
      "x": 1040,
      "y": 146,
      "speaker": "Lex",
      "line": "Ne touchez pas aux ouvertures. Regardez d’abord ce qu’il y a dessous.",
      "after": "Les tables portent des traces de contention.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-07",
      "number": 7,
      "room": "weapons",
      "flag": "plasma",
      "title": "Rejoindre l’équipe au sarcophage",
      "x": 885,
      "y": 145,
      "speaker": "Verheiden",
      "line": "Les logements sont ouverts. On emporte les trois pièces et on retrouve les autres.",
      "after": "Le mécanisme vient de se réveiller. Il faut sortir.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-08",
      "number": 8,
      "room": "pivot",
      "flag": "cycle",
      "title": "Lire le cycle de la pyramide",
      "x": 1110,
      "y": 148,
      "speaker": "Sebastian",
      "line": "La pierre suit un rythme. Si nous le comprenons, nous pourrons traverser.",
      "after": "Dix minutes. Puis une nouvelle configuration.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-09",
      "number": 9,
      "room": "duel",
      "flag": "duel",
      "title": "Attendre une ouverture et quitter la salle",
      "x": 1880,
      "y": 145,
      "speaker": "Lex",
      "line": "Restez loin du filet. Pendant qu’ils se battent, on gagne la sortie.",
      "after": "Le passage est libre. Ne regardez pas derrière vous.",
      "mechanic": "duel",
      "hold": 0.9
    },
    {
      "id": "avp04-10",
      "number": 10,
      "room": "glyphs",
      "flag": "ritual",
      "title": "Déchiffrer la frise du rite",
      "x": 1080,
      "y": 144,
      "speaker": "Sebastian",
      "line": "Nous avons pénétré dans une épreuve. Et nous avons pris les armes des participants.",
      "after": "Rendre l’arme peut être notre seule chance.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-11",
      "number": 11,
      "room": "refuge",
      "flag": "weyland",
      "title": "Rejoindre Weyland",
      "x": 520,
      "y": 145,
      "speaker": "Weyland",
      "line": "Je vous ralentis. Trouvez une issue pendant qu’il en reste une.",
      "after": "Weyland reste en arrière. Lex et Sebastian doivent continuer.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-12",
      "number": 12,
      "room": "hunter",
      "flag": "alliance",
      "title": "Rendre le canon à Scar",
      "x": 980,
      "y": 150,
      "speaker": "Lex",
      "line": "C’est à toi. Nous cherchons seulement la sortie.",
      "after": "Scar accepte le canon. Il taille une lance et un bouclier dans la carapace.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-13",
      "number": 13,
      "room": "nursery",
      "flag": "sebastian",
      "title": "Retrouver Sebastian",
      "x": 1700,
      "y": 149,
      "speaker": "Sebastian",
      "line": "Ne reste pas ici, Lex. Il est déjà trop tard pour moi.",
      "after": "Scar prépare le dispositif. La Reine force ses entraves.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-14",
      "number": 14,
      "room": "queenhold",
      "flag": "bomb",
      "title": "Armer le dispositif de Scar",
      "x": 650,
      "y": 151,
      "speaker": "Lex",
      "line": "Nous repartons par le tunnel. Maintenant.",
      "after": "La charge est armée. Rejoindre le parvis avant la détonation.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-15",
      "number": 15,
      "room": "forecourt",
      "flag": "escaped",
      "title": "Atteindre le parvis avec Scar",
      "x": 550,
      "y": 151,
      "speaker": "Lex",
      "line": "Le tunnel est encore ouvert. Il faut remonter.",
      "after": "La détonation détruit la pyramide derrière eux.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-16",
      "number": 16,
      "room": "station",
      "flag": "line",
      "title": "Récupérer la ligne de traction",
      "x": 1240,
      "y": 144,
      "speaker": "Lex",
      "line": "Quelque chose remonte. La cuve, les chaînes… on peut s’en servir.",
      "after": "La ligne rejoint les cuves près du bord de mer.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-17",
      "number": 17,
      "room": "tanks",
      "flag": "chain",
      "title": "Accrocher la chaîne à la cuve",
      "x": 1130,
      "y": 147,
      "speaker": "Lex",
      "line": "Si elle nous suit jusqu’au bord, la cuve l’emportera.",
      "after": "La chaîne est en place. Il faut l’attirer.",
      "mechanic": null,
      "hold": 0.65
    },
    {
      "id": "avp04-18",
      "number": 18,
      "room": "icebattle",
      "flag": "queen",
      "title": "Accrocher la Reine puis libérer le butoir",
      "x": 1790,
      "y": 145,
      "speaker": "Lex",
      "line": "La ligne tient. Encore quelques pas vers le bord.",
      "after": "La cuve bascule. La chaîne entraîne la Reine sous la glace.",
      "mechanic": "tether",
      "hold": 0.9
    },
    {
      "id": "avp04-19",
      "number": 19,
      "room": "elder",
      "flag": "judgment",
      "title": "Approcher l’Ancien",
      "x": 990,
      "y": 144,
      "speaker": "Lex",
      "line": "La tempête se tait. Les chasseurs récupèrent Scar.",
      "after": "L’Ancien reconnaît la marque et remet sa lance à Lex.",
      "mechanic": null,
      "hold": 0.65
    }
  ],
  "enemies": [
    {
      "id": "hugger-press",
      "room": "press",
      "kind": "facehugger",
      "x": 1150,
      "y": 144,
      "after": "plasma",
      "hp": 28
    },
    {
      "id": "grid-duel",
      "room": "duel",
      "kind": "grid",
      "x": 1300,
      "y": 160,
      "after": "cycle",
      "until": "duel",
      "hp": 999,
      "unique": true
    },
    {
      "id": "xeno-hunter",
      "room": "hunter",
      "kind": "xeno",
      "x": 1500,
      "y": 215,
      "after": "alliance",
      "hp": 115
    },
    {
      "id": "hugger-service",
      "room": "service",
      "kind": "facehugger",
      "x": 1030,
      "y": 144,
      "after": "alliance",
      "hp": 28
    },
    {
      "id": "xeno-nursery",
      "room": "nursery",
      "kind": "xeno",
      "x": 1150,
      "y": 195,
      "after": "alliance",
      "hp": 120
    },
    {
      "id": "hugger-nursery",
      "room": "nursery",
      "kind": "facehugger",
      "x": 1850,
      "y": 225,
      "after": "alliance",
      "hp": 28
    },
    {
      "id": "xeno-queenhold",
      "room": "queenhold",
      "kind": "xeno",
      "x": 1270,
      "y": 190,
      "after": "sebastian",
      "hp": 130
    },
    {
      "id": "queen-final",
      "room": "icebattle",
      "kind": "queen",
      "x": 1380,
      "y": 180,
      "after": "chain",
      "until": "queen",
      "hp": 999,
      "unique": true
    },
    {
      "id": "hatch-egg-service",
      "room": "service",
      "kind": "facehugger",
      "x": 1325,
      "y": 144,
      "after": "alliance",
      "egg": "egg-service",
      "hp": 28
    },
    {
      "id": "hatch-egg-inc-a",
      "room": "incubator",
      "kind": "facehugger",
      "x": 575,
      "y": 144,
      "after": "alliance",
      "egg": "egg-inc-a",
      "hp": 28
    },
    {
      "id": "hatch-egg-inc-b",
      "room": "incubator",
      "kind": "facehugger",
      "x": 1425,
      "y": 144,
      "after": "alliance",
      "egg": "egg-inc-b",
      "hp": 28
    },
    {
      "id": "hatch-egg-nur-a",
      "room": "nursery",
      "kind": "facehugger",
      "x": 1065,
      "y": 226,
      "after": "alliance",
      "egg": "egg-nur-a",
      "hp": 28
    },
    {
      "id": "hatch-egg-nur-b",
      "room": "nursery",
      "kind": "facehugger",
      "x": 1655,
      "y": 75,
      "after": "alliance",
      "egg": "egg-nur-b",
      "hp": 28
    },
    {
      "id": "hatch-egg-gantry",
      "room": "gantry",
      "kind": "facehugger",
      "x": 1465,
      "y": 216,
      "after": "sebastian",
      "egg": "egg-gantry",
      "hp": 28
    },
    {
      "id": "hatch-egg-sacrifice",
      "room": "sacrifice",
      "kind": "facehugger",
      "x": 1655,
      "y": 216,
      "after": "plasma",
      "egg": "egg-sacrifice",
      "hp": 28
    },
    {
      "id": "xeno-weights",
      "room": "weights",
      "kind": "xeno",
      "x": 1630,
      "y": 205,
      "after": "cycle",
      "hp": 100
    },
    {
      "id": "xeno-gantry",
      "room": "gantry",
      "kind": "xeno",
      "x": 1720,
      "y": 200,
      "after": "sebastian",
      "hp": 105
    },
    {
      "id": "sentinel-cloister",
      "room": "cloister",
      "kind": "xeno",
      "x": 1580,
      "y": 180,
      "after": "cycle",
      "hp": 100
    },
    {
      "id": "sentinel-balcony",
      "room": "balcony",
      "kind": "xeno",
      "x": 1350,
      "y": 185,
      "after": "ritual",
      "hp": 100
    },
    {
      "id": "sentinel-drain",
      "room": "drain",
      "kind": "xeno",
      "x": 1380,
      "y": 144,
      "after": "alliance",
      "hp": 100
    }
  ],
  "codex": [
    {
      "id": "room-maru",
      "category": "Lieux",
      "title": "Piper Maru · Pont",
      "text": "Le navire craque contre la banquise. Câbles arrimés, treuil bâbord, accès à la salle des cartes et au local de matériel.",
      "unlockRoom": "maru"
    },
    {
      "id": "room-brief",
      "category": "Lieux",
      "title": "Salle des cartes",
      "text": "Sous la glace, quelque chose émet de la chaleur. Table centrale en fond, caisses arrimées à gauche, passage avant libre.",
      "unlockRoom": "brief"
    },
    {
      "id": "room-gear",
      "category": "Lieux",
      "title": "Local d’expédition",
      "text": "Une corde, un piolet. Ce que nous connaissons. Râtelier et vestiaires adossés à la coque, matériel de descente accessible.",
      "unlockRoom": "gear"
    },
    {
      "id": "room-landing",
      "category": "Lieux",
      "title": "Bouvetøya · Zone d’arrivée",
      "text": "Le vent efface déjà nos traces. Jalons, caisses d’expédition et silhouettes des hangars. Aucun autel ici.",
      "unlockRoom": "landing"
    },
    {
      "id": "room-station",
      "category": "Lieux",
      "title": "Station baleinière · Rue centrale",
      "text": "Personne n’a quitté un mot derrière lui. Hangars visitables au fond, chaudière à droite, passage vers le puits et cuves côté mer.",
      "unlockRoom": "station"
    },
    {
      "id": "room-office",
      "category": "Lieux",
      "title": "Bureau du contremaître",
      "text": "Le calendrier s’est arrêté. Registre sur bureau, vieux poêle, vitres gelées. Aucun équipement spatial.",
      "unlockRoom": "office"
    },
    {
      "id": "room-workshop",
      "category": "Lieux",
      "title": "Atelier des baleiniers",
      "text": "La rouille n’a pas emporté les outils. Établi mural, bobine et crochet de levage, allée centrale dégagée.",
      "unlockRoom": "workshop"
    },
    {
      "id": "room-bore",
      "category": "Lieux",
      "title": "Tunnel thermique",
      "text": "Ce tunnel n’a pas été creusé avec nos machines. Pente suggérée dans la roche, lignes de rappel continues, palier de sécurité.",
      "unlockRoom": "bore"
    },
    {
      "id": "room-forecourt",
      "category": "Lieux",
      "title": "Pyramide · Parvis enfoui",
      "text": "La montagne cache une autre montagne. Façade en gradins, statues monumentales, accès axial. Grande profondeur lisible.",
      "unlockRoom": "forecourt"
    },
    {
      "id": "room-vestibule",
      "category": "Lieux",
      "title": "Vestibule des trois peuples",
      "text": "Des civilisations différentes. Une même porte. Pilastres gravés, seuil éclairé et accès de service latéral au labyrinthe.",
      "unlockRoom": "vestibule"
    },
    {
      "id": "room-sacrifice",
      "category": "Lieux",
      "title": "Chambre des sacrifices",
      "text": "Les tables ne servaient pas aux morts. Deux rangées de dalles funéraires, percements pour les œufs au fond, axe libre.",
      "unlockRoom": "sacrifice"
    },
    {
      "id": "room-ossuary",
      "category": "Lieux",
      "title": "Ossuaire",
      "text": "Les cages thoraciques sont ouvertes de l’intérieur. Niches à hauteur d’épaule, ossements regroupés en fond et passage étroit.",
      "unlockRoom": "ossuary"
    },
    {
      "id": "room-weapons",
      "category": "Lieux",
      "title": "Chambre des armes",
      "text": "Trois emplacements. Trois chasseurs. Sarcophage axial à trois logements, dial au mur et cheminement autour du socle.",
      "unlockRoom": "weapons"
    },
    {
      "id": "room-pivot",
      "category": "Lieux",
      "title": "Croisée mobile",
      "text": "Les murs ne se déplacent pas au hasard. Dalles en translation sur rails distincts; niches latérales et raccourci cyclique signalé.",
      "unlockRoom": "pivot"
    },
    {
      "id": "room-press",
      "category": "Lieux",
      "title": "Couloir de l’étau",
      "text": "Avancer pendant que la pierre nous le permet. Parois mobiles au second plan, refuge central et couloir permanent sécurisé.",
      "unlockRoom": "press"
    },
    {
      "id": "room-duel",
      "category": "Lieux",
      "title": "Salle du filet",
      "text": "Nous ne sommes ni les chasseurs, ni le prix. Piliers cassés, filet au sol, aire de duel en fond et trajet de fuite au premier plan.",
      "unlockRoom": "duel"
    },
    {
      "id": "room-glyphs",
      "category": "Lieux",
      "title": "Galerie du rite",
      "text": "Ce n’est pas un tombeau. Frise narrative continue, traces de plasma et niche où Sebastian peut lire.",
      "unlockRoom": "glyphs"
    },
    {
      "id": "room-refuge",
      "category": "Lieux",
      "title": "Dernier abri",
      "text": "Weyland ne pourra plus suivre. Renfoncement avec appui de pierre, torche humaine et unique accès au couloir.",
      "unlockRoom": "refuge"
    },
    {
      "id": "room-hunter",
      "category": "Lieux",
      "title": "Hall du chasseur",
      "text": "Rendre ce qui ne nous appartient pas. Silhouette de Scar en fond, case du canon au centre, espace dégagé pour l’alliance.",
      "unlockRoom": "hunter"
    },
    {
      "id": "room-service",
      "category": "Lieux",
      "title": "Passage sous les dalles",
      "text": "La résine gagne les joints de la pierre. Conduit bas reliant le hall à la nurserie, résine uniquement autour des points infestés.",
      "unlockRoom": "service"
    },
    {
      "id": "room-nursery",
      "category": "Lieux",
      "title": "Nurserie",
      "text": "Ils ne nous ont pas tués. Ils nous gardent. Cocons au mur, œufs regroupés hors chemin sûr, Sebastian au fond à droite.",
      "unlockRoom": "nursery"
    },
    {
      "id": "room-queenhold",
      "category": "Lieux",
      "title": "Chambre de la Reine",
      "text": "Les chaînes commencent à céder. Palan suspendu, entraves autour de la Reine, coursive d’accès et emplacement de la charge.",
      "unlockRoom": "queenhold"
    },
    {
      "id": "room-tanks",
      "category": "Lieux",
      "title": "Cuves de la station",
      "text": "Une chaîne suffit, si elle tient. Cuve cylindrique mobile, chaîne continue vers le quai et points d’ancrage visibles.",
      "unlockRoom": "tanks"
    },
    {
      "id": "room-icebattle",
      "category": "Lieux",
      "title": "Bord de la banquise",
      "text": "Ne pas la tuer. L’entraîner. Glace, eau noire, cuve reliée à la chaîne, butoir et espace pour esquiver les charges.",
      "unlockRoom": "icebattle"
    },
    {
      "id": "room-elder",
      "category": "Lieux",
      "title": "Le jugement des chasseurs",
      "text": "Elle nous a vus combattre. Neige intacte au-delà du quai, lumière du vaisseau, Ancien et corps de Scar.",
      "unlockRoom": "elder"
    },
    {
      "id": "room-vessel",
      "category": "Lieux",
      "title": "Vaisseau · Épilogue",
      "text": "Quelque chose a survécu. Tableau séparé de la navigation de Lex : corps de Scar dans la soute.",
      "unlockRoom": "vessel"
    },
    {
      "id": "room-infirmary",
      "category": "Lieux",
      "title": "Infirmerie de la station",
      "text": "Du matériel qui n’a pas servi depuis un siècle. Lit métallique, étagère, coffre de secours récent laissé par l’expédition.",
      "unlockRoom": "infirmary"
    },
    {
      "id": "room-trophies",
      "category": "Lieux",
      "title": "Galerie des trophées",
      "text": "Les murs comptent les chasses. Niches votives, stèles, trophées anciens. Salle annexe, pas un arsenal gratuit.",
      "unlockRoom": "trophies"
    },
    {
      "id": "person-lex",
      "category": "Rencontres",
      "title": "Alexa « Lex » Woods",
      "text": "Guide — Priorité : le terrain, les ancrages, les sorties. Le personnage jouable de cette adaptation.",
      "unlockFlag": "briefing"
    },
    {
      "id": "person-sebastian",
      "category": "Rencontres",
      "title": "Sebastian de Rosa",
      "text": "Archéologue — Ses lectures relient le sarcophage, le cycle de la pyramide et le rite.",
      "unlockFlag": "facade"
    },
    {
      "id": "person-weyland",
      "category": "Rencontres",
      "title": "Charles Bishop Weyland",
      "text": "Commanditaire — Il finance cette expédition. Le DLC ne le confond pas avec Peter Weyland.",
      "unlockFlag": "briefing"
    },
    {
      "id": "person-miller",
      "category": "Rencontres",
      "title": "Graeme Miller",
      "text": "Scientifique — Le relais et les relevés appartiennent à une expédition humaine, pas aux Marines coloniaux.",
      "unlockFlag": "radio"
    },
    {
      "id": "person-verheiden",
      "category": "Rencontres",
      "title": "Verheiden",
      "text": "Sécurité — L’extraction des armes au sarcophage déclenche le danger.",
      "unlockFlag": "plasma"
    },
    {
      "id": "person-scar",
      "category": "Rencontres",
      "title": "Scar",
      "text": "Chasseur — Son canon est rendu avant l’alliance. Lex ne reçoit ni biomask ni canon d’épaule.",
      "unlockFlag": "alliance"
    },
    {
      "id": "person-celtic",
      "category": "Rencontres",
      "title": "Celtic",
      "text": "Chasseur — Le filet et le duel contre Grid le distinguent des autres chasseurs.",
      "unlockFlag": "duel"
    },
    {
      "id": "person-chopper",
      "category": "Rencontres",
      "title": "Chopper",
      "text": "Chasseur — Ses longues lames et ses trophées forment une silhouette distincte.",
      "unlockFlag": "duel"
    },
    {
      "id": "person-grid",
      "category": "Rencontres",
      "title": "Grid",
      "text": "Xénomorphe — La trace du filet marque son crâne. Le parcours principal n’invente pas une victoire de Lex contre lui.",
      "unlockFlag": "duel"
    },
    {
      "id": "person-queen",
      "category": "Rencontres",
      "title": "La Reine",
      "text": "Matriarche — La fin du combat dépend de la chaîne et de la cuve, pas de l’épuisement d’une barre de vie.",
      "unlockFlag": "chain"
    },
    {
      "id": "person-elder",
      "category": "Rencontres",
      "title": "L’Ancien",
      "text": "Chasseur — Son apparition conclut le rite de Lex.",
      "unlockFlag": "judgment"
    },
    {
      "id": "person-predalien",
      "category": "Rencontres",
      "title": "Une autre naissance",
      "text": "Épilogue — La naissance à bord du vaisseau reste un épilogue. Aucun Predalien adulte n’est ajouté dans la pyramide.",
      "unlockFlag": "judgment"
    },
    {
      "id": "equipment-piolet",
      "category": "Équipement",
      "title": "Piolet",
      "text": "Le piolet repousse une menace proche. Contre une créature adulte, mieux vaut ouvrir un passage que s’acharner.",
      "unlockFlag": "gear"
    },
    {
      "id": "equipment-lamp",
      "category": "Équipement",
      "title": "Lampe frontale",
      "text": "Une lampe pour lire le chemin. Elle ne voit pas à travers la pierre.",
      "unlockFlag": "gear"
    },
    {
      "id": "equipment-flare",
      "category": "Équipement",
      "title": "Fusée éclairante",
      "text": "L’éclat attire les prédateurs proches et laisse quelques secondes pour traverser.",
      "unlockFlag": "gear"
    },
    {
      "id": "equipment-medical",
      "category": "Équipement",
      "title": "Trousse de secours",
      "text": "Une trousse restaure une partie de la santé. Les réserves se conservent d’une salle à l’autre.",
      "unlockFlag": "gear"
    },
    {
      "id": "equipment-plasma",
      "category": "Équipement",
      "title": "Canon récupéré",
      "text": "Transporté comme objet de l’expédition. Lex ne l’utilise pas comme arme.",
      "unlockFlag": "plasma"
    },
    {
      "id": "equipment-spear",
      "category": "Équipement",
      "title": "Lance de fortune",
      "text": "Scar assemble la pointe à partir d’une queue xénomorphe. Sa portée dépasse celle du piolet.",
      "unlockFlag": "alliance"
    },
    {
      "id": "equipment-shield",
      "category": "Équipement",
      "title": "Bouclier de carapace",
      "text": "Maintenir la garde réduit les dégâts venant de face, mais vide l’endurance.",
      "unlockFlag": "alliance"
    },
    {
      "id": "equipment-device",
      "category": "Équipement",
      "title": "Dispositif du chasseur",
      "text": "Son compte à rebours reste suspendu dans les menus. La sortie suit les lieux déjà traversés.",
      "unlockFlag": "bomb"
    },
    {
      "id": "equipment-chain",
      "category": "Équipement",
      "title": "Chaîne de halage",
      "text": "La chaîne relie la Reine à une cuve. Elle doit être attachée avant le dernier affrontement.",
      "unlockFlag": "chain"
    },
    {
      "id": "equipment-elderSpear",
      "category": "Équipement",
      "title": "Lance de l’Ancien",
      "text": "La marque ouvre une reconnaissance, pas une nouvelle carrière de chasseur dans ce film.",
      "unlockFlag": "judgment"
    },
    {
      "id": "rule-profondeur",
      "category": "Terrain",
      "title": "Lire un passage",
      "text": "Dans les grands espaces, changer de profondeur permet de contourner les obstacles. Les portes au fond se rejoignent à pied.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-silence",
      "category": "Terrain",
      "title": "Faire moins de bruit",
      "text": "Marcher accroupi diminue la distance de détection. Courir facilite la fuite mais attire les créatures.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-cycle",
      "category": "Terrain",
      "title": "Écouter la pierre",
      "text": "Les routes de service changent au rythme de la pyramide. Les niches et le chemin principal restent praticables.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-scar",
      "category": "Terrain",
      "title": "Rester ensemble",
      "text": "Scar suit Lex après l’alliance et couvre sa progression. Il ne se téléporte pas à travers les obstacles.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-acid",
      "category": "Terrain",
      "title": "Garder ses distances",
      "text": "Le sang acide laissé par une créature tombée reste dangereux quelques secondes.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-dodge",
      "category": "Terrain",
      "title": "Trouver une ouverture",
      "text": "L’esquive coûte de l’endurance. La charge de la Reine est annoncée au sol avant son départ.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-journal",
      "category": "Terrain",
      "title": "Retrouver son chemin",
      "text": "Le carnet se remplit à chaque salle découverte. Les portes non franchies ne révèlent pas tout le plan.",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-continuity",
      "category": "Terrain",
      "title": "Une chasse à part",
      "text": "Cette expédition de 2004 reste séparée de la campagne de 2204 et des missions Prometheus.",
      "unlockFlag": "briefing"
    },
    {
      "id": "room-engine",
      "category": "Lieux",
      "title": "Station · Salle des machines",
      "text": "Le groupe de l’expédition est raccordé à la vieille chaudière. Chaudron froid au mur, générateur portable moderne séparé de la machine de 1904 ; distribution électrique visible vers la cour.",
      "unlockRoom": "engine"
    },
    {
      "id": "room-tower",
      "category": "Lieux",
      "title": "Station · Tour radio",
      "text": "La neige frappe les vitres. En haut, le relais reçoit encore. Plateforme haute de la tour accessible par l’escalier du hall ; fenêtre sur la cour, antenne en extérieur et poste radio de l’expédition.",
      "unlockRoom": "tower"
    },
    {
      "id": "room-weights",
      "category": "Lieux",
      "title": "Salle des contrepoids",
      "text": "Chaque bloc répond au poids suspendu de l’autre côté. Trois contrepoids suspendus sur des chaînes verticales, consoles en retrait, dalle mobile centrale et issue vers le couloir de l’étau.",
      "unlockRoom": "weights"
    },
    {
      "id": "room-astrarium",
      "category": "Lieux",
      "title": "Chambre des cycles",
      "text": "Le disque ne donne pas une date. Il annonce le prochain passage. Disque de pierre encastré au mur, trois empreintes lumineuses, relevé optionnel qui renseigne les chemins de service.",
      "unlockRoom": "astrarium"
    },
    {
      "id": "room-incubator",
      "category": "Lieux",
      "title": "Conduite d’incubation",
      "text": "Sous les dalles, les œufs avancent vers les chambres. Caniveau central technique, alcôves occupées par des œufs individuels ; chemin latéral étroit et coude de sortie vers la nurserie.",
      "unlockRoom": "incubator"
    },
    {
      "id": "room-gantry",
      "category": "Lieux",
      "title": "Passerelle des entraves",
      "text": "La structure porte la Reine. L’acide commence à mordre le métal. Coursive devant un gouffre, trains de poulies au plafond, poste mécanique latéral et chemin sécurisé vers la chambre de la Reine.",
      "unlockRoom": "gantry"
    },
    {
      "id": "rule-v2-slab",
      "title": "La pierre prévient",
      "text": "Les rainures s’allument avant la fermeture. Une dalle ne referme pas son passage sur un corps ; attendre son retrait ou la contourner.",
      "category": "Terrain",
      "unlockFlag": "cycle"
    },
    {
      "id": "rule-v2-eggs",
      "title": "Les œufs isolés",
      "text": "Un œuf qui se déplie annonce une sortie. Rester accroupie à distance, le détruire ou refermer le distributeur.",
      "category": "Terrain",
      "unlockFlag": "alliance"
    },
    {
      "id": "rule-v2-orders",
      "title": "Le signe de la main",
      "text": "G demande à Scar de garder sa position. Un deuxième signe le rappelle. Le passage dans une autre salle reforme le duo.",
      "category": "Terrain",
      "unlockFlag": "alliance"
    },
    {
      "id": "rule-v2-energy",
      "title": "Le canon chauffe",
      "text": "Scar choisit une ligne de tir dégagée. Son canon recharge entre les salves et ne tire pas au travers des piliers.",
      "category": "Terrain",
      "unlockFlag": "alliance"
    },
    {
      "id": "rule-v2-operations",
      "title": "Préparer le passage",
      "text": "Le carnet des actions indique ce qui manque à l’objectif courant et dans quelle pièce le chercher.",
      "category": "Terrain",
      "unlockFlag": "briefing"
    },
    {
      "id": "rule-v2-counterweights",
      "title": "Le relief des poids",
      "text": "Le linteau indique les trois crans. Les chaînes montent et descendent séparément ; la position doit être vérifiée.",
      "category": "Terrain",
      "unlockFlag": "plasma"
    },
    {
      "id": "v3-room-dormitory",
      "category": "Lieux",
      "title": "Station · Dortoir des baleiniers",
      "text": "Étage au-dessus du bureau et de l’atelier. Lits superposés adossés au mur, objets personnels dans leurs casiers, axe de marche libre. La pièce ne prétend pas reproduire un plan du film.",
      "unlockRoom": "dormitory"
    },
    {
      "id": "v3-room-mess",
      "category": "Lieux",
      "title": "Station · Réfectoire",
      "text": "Suite du dortoir avec retour par escalier à l’atelier. Tables au fond, poêle contre le conduit, caisse de la nouvelle expédition distincte des affaires anciennes.",
      "unlockRoom": "mess"
    },
    {
      "id": "v3-room-cellar",
      "category": "Lieux",
      "title": "Station · Cave des réserves",
      "text": "Niveau sous la machinerie ; racks de stockage en périphérie, allée médiane, aucun appareil médical ancien présenté comme consommable utilisable.",
      "unlockRoom": "cellar"
    },
    {
      "id": "v3-room-balcony",
      "category": "Lieux",
      "title": "Pyramide · Balcon des bâtisseurs",
      "text": "Coursive haute de la pyramide. Le retour vers le vestibule doit être déverrouillé depuis ce côté ; les garde-corps et l’assise du monument restent visibles.",
      "unlockRoom": "balcony"
    },
    {
      "id": "v3-room-drain",
      "category": "Lieux",
      "title": "Pyramide · Drain de la citerne",
      "text": "Drain accessible depuis la conduite d’incubation, escalier vers les entraves. Une rigole au fond guide l’écoulement ; la marche centrale est sèche.",
      "unlockRoom": "drain"
    },
    {
      "id": "v3-room-cloister",
      "category": "Lieux",
      "title": "Pyramide · Galerie des niches",
      "text": "Galerie entre contrepoids et salle du filet ; niches de refuge dans le mur porteur, ligne de vue rompue par les contreforts. Le passage rejoint la même scène, sans second Grid.",
      "unlockRoom": "cloister"
    },
    {
      "id": "v3-search",
      "category": "Terrain",
      "title": "Perdre une créature",
      "text": "Une créature privée de vue rejoint la dernière position connue puis cherche aux alentours. Courir ou frapper peut lui fournir un nouvel indice.",
      "unlockFlag": "cycle"
    },
    {
      "id": "v3-light",
      "category": "Terrain",
      "title": "La lampe et la pierre",
      "text": "L allume ou éteint la lampe. La lumière facilite votre lecture mais augmente la distance de repérage visuel. Un mur bloque toujours la vue.",
      "unlockFlag": "gear"
    },
    {
      "id": "v3-hide",
      "category": "Terrain",
      "title": "Un refuge n’est pas une invulnérabilité",
      "text": "Entrer dans une niche depuis le calme dissimule Lex. Une créature qui la voit entrer peut venir la déloger. E permet de ressortir.",
      "unlockFlag": "cycle"
    },
    {
      "id": "v3-caches",
      "category": "Terrain",
      "title": "Une caisse reste ouverte",
      "text": "Le contenu n’est accordé qu’une fois. Le couvercle et le fond vide restent visibles après retour ou chargement.",
      "unlockFlag": "gear"
    },
    {
      "id": "v3-scars",
      "category": "Terrain",
      "title": "Les traces du combat",
      "text": "Acide au sol et fusées conservent leur durée restante au changement de pièce et au chargement. Le temps de jeu écoulé continue de compter.",
      "unlockFlag": "alliance"
    },
    {
      "id": "v3-route",
      "category": "Terrain",
      "title": "Un repère, pas un déplacement rapide",
      "text": "La carte permet de marquer une pièce connue. La flèche montre seulement le prochain seuil praticable ; elle ne déplace jamais Lex.",
      "unlockFlag": "briefing"
    },
    {
      "id": "hunt-1",
      "category": "Survie · Les seuils",
      "title": "La chasse traverse le seuil",
      "text": "Une créature qui vous voit quitter la pièce peut rejoindre ce même passage. Elle ne reçoit pas votre nouvelle position : elle cherche d’abord près de votre point d’entrée.",
      "unlockRoom": "press"
    },
    {
      "id": "hunt-2",
      "category": "Survie · Les seuils",
      "title": "Fermer derrière soi",
      "text": "Maintenir V près d’un vantail referme ses deux faces. E reste réservé au passage. Une porte fermée peut être rouverte sans objet consommable.",
      "unlockRoom": "refuge"
    },
    {
      "id": "hunt-3",
      "category": "Survie · Les seuils",
      "title": "Les coups sur la grille",
      "text": "Les adultes peuvent briser les vantaux après plusieurs coups espacés. Une grille brisée reste brisée. Les facehuggers ne brisent pas ces portes.",
      "unlockRoom": "nursery"
    },
    {
      "id": "hunt-4",
      "category": "Survie · Les seuils",
      "title": "Écouter à travers la pierre",
      "text": "Maintenir X pour écouter près d’un seuil. Les sons renseignent sur le passage voisin, jamais sur toute la carte. Une porte fermée atténue les bruits.",
      "unlockRoom": "glyphs"
    },
    {
      "id": "hunt-5",
      "category": "Survie · Les seuils",
      "title": "Rompre la piste",
      "text": "Deux franchissements successifs au maximum par créature. Si elle ne vous aperçoit plus et perd sa piste, elle cherche près du dernier seuil. Pas de poursuite jusqu’au navire.",
      "unlockRoom": "cloister"
    },
    {
      "id": "hunt-6",
      "category": "Survie · Les seuils",
      "title": "Une porte ne duplique rien",
      "text": "L’ennemi qui entre conserve son identifiant, sa santé et ses blessures. Il quitte sa salle précédente. Les changements de pièce ne réinitialisent pas sa vie.",
      "unlockRoom": "service"
    },
    {
      "id": "hunt-7",
      "category": "Survie · Les seuils",
      "title": "Lire le relevé des étages",
      "text": "La carte sépare le navire, la station et la pyramide. Les lignes verticales indiquent les changements d’étage. Les vantaux affichent leur dernier état constaté dans la pièce ; ce relevé ne révèle pas les changements distants.",
      "unlockRoom": "office"
    },
    {
      "id": "hunt-8",
      "category": "Survie · Les seuils",
      "title": "Le carnet sous pression",
      "text": "Pause, carte et dossiers suspendent aussi les poursuites et les impacts. Recharger le carnet ne rend pas les vantaux neufs et ne fait pas disparaître les chasseurs engagés.",
      "unlockRoom": "weights"
    },
    {
      "id": "terrain-01",
      "category": "Terrain actif",
      "title": "Des lampes dans la pierre",
      "text": "Les six éclairages portables ont un état indépendant de la frontale. Leurs faisceaux augmentent la portée du repérage visuel dans leur zone, à condition qu’aucun obstacle ne coupe la lumière.",
      "unlockRoom": "forecourt"
    },
    {
      "id": "terrain-02",
      "category": "Terrain actif",
      "title": "Le groupe de la cour",
      "text": "Les projecteurs de la station et de l’atelier attendent le raccordement du groupe. Couper leur interrupteur ne retire pas l’alimentation des objectifs du scénario.",
      "unlockRoom": "station"
    },
    {
      "id": "terrain-03",
      "category": "Terrain actif",
      "title": "Éloigner le bruit",
      "text": "Les quatre leurres fixes résonnent après 2,6 secondes. La créature rejoint la source entendue, pas la position secrète de Lex.",
      "unlockRoom": "weights"
    },
    {
      "id": "terrain-04",
      "category": "Terrain actif",
      "title": "Retrouver le silence",
      "text": "Un leurre dure 5,2 secondes puis attend 24 secondes avant réarmement. Les usages n’ajoutent aucune créature.",
      "unlockRoom": "pivot"
    },
    {
      "id": "terrain-05",
      "category": "Terrain actif",
      "title": "Un rideau, pas un mur",
      "text": "Les deux purges produisent sept secondes de condensation. Elles coupent les vues à travers le nuage mais ni les collisions physiques ni les tirs.",
      "unlockRoom": "drain"
    },
    {
      "id": "terrain-06",
      "category": "Terrain actif",
      "title": "Le sol répond",
      "text": "Métal, eau et débris portent les pas plus loin. La neige les amortit. Le volume acoustique ne dépend pas du réglage sonore du navigateur.",
      "unlockRoom": "maru"
    },
    {
      "id": "terrain-07",
      "category": "Terrain actif",
      "title": "L’eau retient les pieds",
      "text": "L’eau et les résines ralentissent les déplacements. Les xénomorphes ne subissent pas le ralentissement de leur propre résine.",
      "unlockRoom": "service"
    },
    {
      "id": "terrain-08",
      "category": "Terrain actif",
      "title": "Marcher pour disparaître",
      "text": "Avancer accroupi réduit la portée des pas sur chaque surface. Un adversaire assez proche peut encore vous entendre.",
      "unlockRoom": "cloister"
    },
    {
      "id": "terrain-09",
      "category": "Terrain actif",
      "title": "Une fusée arrêtée par la pierre",
      "text": "Les fusées ne sont plus posées de l’autre côté d’un obstacle. Leur trajectoire courte s’arrête avant une collision.",
      "unlockRoom": "hunter"
    },
    {
      "id": "terrain-10",
      "category": "Terrain actif",
      "title": "Le lance-piton",
      "text": "Une fois la ligne préparée, T lance un piton dans le sens de Lex. La profondeur est fixée au départ. Un tir manqué revient après un délai, sans consommer de réserve unique.",
      "unlockRoom": "icebattle"
    },
    {
      "id": "terrain-11",
      "category": "Terrain actif",
      "title": "La reprise de la Reine",
      "text": "Le piton ne s’accroche pas pendant sa préparation de charge ou sa course. Attendre sa reprise, viser le bon plan et éviter les obstacles.",
      "unlockRoom": "icebattle"
    },
    {
      "id": "terrain-12",
      "category": "Terrain actif",
      "title": "Au bord du piège",
      "text": "Accrocher la Reine ne suffit pas. Elle doit rejoindre la zone de traction près du butoir. E libère alors la cuve ; les coups n’épuisent jamais ses points de vie.",
      "unlockRoom": "icebattle"
    }
  ],
  "characters": [
    [
      "lex",
      "Alexa « Lex » Woods",
      "Guide",
      "Priorité : le terrain, les ancrages, les sorties. Le personnage jouable de cette adaptation.",
      "briefing"
    ],
    [
      "sebastian",
      "Sebastian de Rosa",
      "Archéologue",
      "Ses lectures relient le sarcophage, le cycle de la pyramide et le rite.",
      "facade"
    ],
    [
      "weyland",
      "Charles Bishop Weyland",
      "Commanditaire",
      "Il finance cette expédition. Le DLC ne le confond pas avec Peter Weyland.",
      "briefing"
    ],
    [
      "miller",
      "Graeme Miller",
      "Scientifique",
      "Le relais et les relevés appartiennent à une expédition humaine, pas aux Marines coloniaux.",
      "radio"
    ],
    [
      "verheiden",
      "Verheiden",
      "Sécurité",
      "L’extraction des armes au sarcophage déclenche le danger.",
      "plasma"
    ],
    [
      "scar",
      "Scar",
      "Chasseur",
      "Son canon est rendu avant l’alliance. Lex ne reçoit ni biomask ni canon d’épaule.",
      "alliance"
    ],
    [
      "celtic",
      "Celtic",
      "Chasseur",
      "Le filet et le duel contre Grid le distinguent des autres chasseurs.",
      "duel"
    ],
    [
      "chopper",
      "Chopper",
      "Chasseur",
      "Ses longues lames et ses trophées forment une silhouette distincte.",
      "duel"
    ],
    [
      "grid",
      "Grid",
      "Xénomorphe",
      "La trace du filet marque son crâne. Le parcours principal n’invente pas une victoire de Lex contre lui.",
      "duel"
    ],
    [
      "queen",
      "La Reine",
      "Matriarche",
      "La fin du combat dépend de la chaîne et de la cuve, pas de l’épuisement d’une barre de vie.",
      "chain"
    ],
    [
      "elder",
      "L’Ancien",
      "Chasseur",
      "Son apparition conclut le rite de Lex.",
      "judgment"
    ],
    [
      "predalien",
      "Une autre naissance",
      "Épilogue",
      "La naissance à bord du vaisseau reste un épilogue. Aucun Predalien adulte n’est ajouté dans la pyramide.",
      "judgment"
    ]
  ],
  "base": {
    "repo": "darknigthmare/aliens-tantalus-frontier",
    "commit": "496996f5ea557d970ec625aa346876f3eaed1c5f",
    "version": "86.0.0",
    "doctrine": "CODEX_HYBRIDE_ALIENS_1986_V102.md"
  },
  "sources": [
    {
      "title": "20th Century Studios — Alien vs. Predator",
      "url": "https://www.20thcenturystudios.com/movies/alien-vs-predator",
      "role": "Film et principe de la pyramide automatisée / alliance",
      "accessed": "2026-09-29"
    },
    {
      "title": "AVP_2004_Inventaire.xlsx",
      "url": "../references/AVP_2004_Inventaire.xlsx",
      "role": "Inventaire utilisateur : références documentaires, non preuve que tous les éléments sont jouables"
    },
    {
      "title": "IMDb — plot summary",
      "url": "https://www.imdb.com/title/tt0370263/plotsummary/",
      "role": "Contrôle secondaire de l’ordre général, pas dialogue reproduit",
      "accessed": "2026-09-29"
    }
  ],
  "releaseName": "Le terrain devient une arme",
  "schema": 5,
  "operations": [
    {
      "id": "power",
      "room": "engine",
      "x": 1270,
      "y": 144,
      "title": "Raccorder le groupe de l’expédition",
      "text": "Le circuit est alimenté. La lampe du relais répond.",
      "after": "gear",
      "forFlag": "radio",
      "requires": [],
      "hold": 1.8,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "antenna",
      "room": "tower",
      "x": 880,
      "y": 144,
      "title": "Orienter l’antenne vers le Piper Maru",
      "text": "Miller reçoit le navire. Le relais de la cour peut être ouvert.",
      "after": "gear",
      "forFlag": "radio",
      "requires": [
        "power"
      ],
      "hold": 1.8,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "anchor-top",
      "room": "bore",
      "x": 410,
      "y": 144,
      "title": "Vérifier l’ancrage supérieur",
      "text": "La corde est freinée par deux points indépendants.",
      "after": "radio",
      "forFlag": "rope",
      "requires": [],
      "hold": 1.1,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "anchor-low",
      "room": "bore",
      "x": 1510,
      "y": 144,
      "title": "Mettre la ligne en tension",
      "text": "L’ancrage inférieur tient. On peut ouvrir la descente.",
      "after": "radio",
      "forFlag": "rope",
      "requires": [
        "anchor-top"
      ],
      "hold": 1.1,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "table-scan",
      "room": "sacrifice",
      "x": 560,
      "y": 150,
      "title": "Observer la première dalle",
      "text": "Les liens étaient faits pour une personne vivante.",
      "after": "facade",
      "forFlag": "tables",
      "requires": [],
      "hold": 1.1,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "table-duct",
      "room": "sacrifice",
      "x": 1500,
      "y": 145,
      "title": "Éclairer le conduit sous les dalles",
      "text": "Le conduit aboutit sous les tables. Rien ne doit en sortir.",
      "after": "facade",
      "forFlag": "tables",
      "requires": [],
      "hold": 1.3,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "balance",
      "room": "weights",
      "x": 1060,
      "y": 144,
      "title": "Régler les trois contrepoids",
      "text": "Le mécanisme a rejoint la position gravée sur le linteau.",
      "after": "plasma",
      "forFlag": "cycle",
      "requires": [],
      "hold": 0.6,
      "puzzle": "balance",
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "cycle-mark",
      "room": "pivot",
      "x": 810,
      "y": 144,
      "title": "Comparer les trois marques",
      "text": "Deux traits, puis la porte. La prochaine rotation est lisible.",
      "after": "plasma",
      "forFlag": "cycle",
      "requires": [],
      "hold": 1.1,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "archive-rubbing",
      "room": "astrarium",
      "x": 860,
      "y": 145,
      "title": "Relever les passages de service",
      "text": "Le carnet porte désormais un relevé des liaisons cycliques.",
      "after": "ritual",
      "forFlag": null,
      "requires": [],
      "hold": 2,
      "puzzle": null,
      "reward": "map",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "spare-kit",
      "room": "workshop",
      "x": 750,
      "y": 146,
      "title": "Ouvrir la caisse de l’équipe",
      "text": "Une trousse et deux fusées. La caisse reste ouverte.",
      "after": "gear",
      "forFlag": null,
      "requires": [],
      "hold": 1.2,
      "puzzle": null,
      "reward": "supplies",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "tower-log",
      "room": "tower",
      "x": 490,
      "y": 144,
      "title": "Noter le dernier échange radio",
      "text": "La voix du navire se perd sous le vent.",
      "after": "gear",
      "forFlag": null,
      "requires": [],
      "hold": 1,
      "puzzle": null,
      "reward": "note",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "incubator-valve",
      "room": "incubator",
      "x": 920,
      "y": 144,
      "title": "Fermer le distributeur d’œufs",
      "text": "Les mâchoires du conduit se referment. Les œufs encore intacts ne s’ouvriront plus ici.",
      "after": "alliance",
      "forFlag": null,
      "requires": [],
      "hold": 1.8,
      "puzzle": null,
      "reward": "valve",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "gantry-brace",
      "room": "gantry",
      "x": 920,
      "y": 144,
      "title": "Bloquer le retour des poulies",
      "text": "La coursive ne vibre plus. Scar peut préparer le dispositif.",
      "after": "sebastian",
      "forFlag": "bomb",
      "requires": [],
      "hold": 1.8,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "bomb-place",
      "room": "queenhold",
      "x": 450,
      "y": 145,
      "title": "Placer le dispositif au pied des entraves",
      "text": "Le dispositif est posé. Son armement reste à effectuer.",
      "after": "sebastian",
      "forFlag": "bomb",
      "requires": [
        "gantry-brace"
      ],
      "hold": 1.4,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "tank-brake",
      "room": "tanks",
      "x": 750,
      "y": 145,
      "title": "Desserrer le frein de la cuve",
      "text": "La cuve est libre, retenue seulement par le butoir.",
      "after": "line",
      "forFlag": "chain",
      "requires": [],
      "hold": 1.4,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "tank-cable",
      "room": "tanks",
      "x": 1500,
      "y": 145,
      "title": "Passer la ligne dans le guide",
      "text": "La chaîne ne frotte plus sur le quai. Elle pourra se tendre.",
      "after": "line",
      "forFlag": "chain",
      "requires": [
        "tank-brake"
      ],
      "hold": 1.4,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "harpoon",
      "room": "icebattle",
      "x": 900,
      "y": 145,
      "title": "Préparer le lance-piton",
      "text": "Le lance-piton est relié à la ligne. T permet de tirer : aligner la Reine pendant sa reprise, puis la conduire vers le butoir.",
      "after": "chain",
      "forFlag": "queen",
      "requires": [],
      "hold": 1.4,
      "puzzle": null,
      "reward": null,
      "sourceStatus": "original-gameplay"
    }
  ],
  "mechanisms": [
    {
      "id": "press-slab",
      "room": "press",
      "x": 825,
      "y": 104,
      "w": 72,
      "h": 82,
      "after": "cycle",
      "period": 13,
      "open": 7,
      "warn": 2,
      "offset": 0,
      "label": "Dalle de l’étau"
    },
    {
      "id": "weight-slab",
      "room": "weights",
      "x": 1210,
      "y": 78,
      "w": 95,
      "h": 128,
      "after": "plasma",
      "period": 15,
      "open": 8,
      "warn": 2,
      "offset": 4,
      "label": "Dalle des contrepoids"
    },
    {
      "id": "incubator-slab",
      "room": "incubator",
      "x": 1190,
      "y": 105,
      "w": 68,
      "h": 80,
      "after": "alliance",
      "period": 14,
      "open": 8,
      "warn": 2,
      "offset": 2,
      "label": "Mâchoire du distributeur",
      "disabledBy": "incubator-valve"
    }
  ],
  "eggs": [
    {
      "id": "egg-service",
      "room": "service",
      "x": 1290,
      "y": 144,
      "after": "alliance"
    },
    {
      "id": "egg-inc-a",
      "room": "incubator",
      "x": 540,
      "y": 144,
      "after": "alliance",
      "disabledBy": "incubator-valve"
    },
    {
      "id": "egg-inc-b",
      "room": "incubator",
      "x": 1390,
      "y": 144,
      "after": "alliance",
      "disabledBy": "incubator-valve"
    },
    {
      "id": "egg-nur-a",
      "room": "nursery",
      "x": 1030,
      "y": 226,
      "after": "alliance"
    },
    {
      "id": "egg-nur-b",
      "room": "nursery",
      "x": 1620,
      "y": 75,
      "after": "alliance"
    },
    {
      "id": "egg-gantry",
      "room": "gantry",
      "x": 1430,
      "y": 216,
      "after": "sebastian"
    },
    {
      "id": "egg-sacrifice",
      "room": "sacrifice",
      "x": 1620,
      "y": 216,
      "after": "plasma"
    }
  ],
  "migration": {
    "acceptsSchemas": [
      1,
      2,
      3
    ],
    "strategy": "Same save key. v1 completed operation prerequisites grandfathered. v2 inventory and chapters unchanged. v3 caches, clues, doors, concealment, companion, enemy memory and room effects validated on import.",
    "v4": "Les états v1–v3 sont conservés. Les huit portes sont ouvertes au premier chargement. Les identifiants et points de passage des poursuites sont contrôlés ; aucun ennemi supplémentaire n’est créé.",
    "schema5": "Équipements, sons localisés et ligne de traction. Schémas 1–4 acceptés, carnets originaux conservés. Une scène de chute déjà engagée reste valide."
  },
  "interactables": [
    {
      "id": "kit-gear",
      "room": "gear",
      "x": 430,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir le coffre d’appoint",
      "text": "Une seule fusée de secours. Le reste accompagne déjà le groupe.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "flares": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-workshop",
      "room": "workshop",
      "x": 1130,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir la mallette de terrain",
      "text": "Deux cartouches sèches, déposées par l’expédition près de l’établi.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "flares": 2
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-mess",
      "room": "mess",
      "x": 1450,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir le sac de secours",
      "text": "Une trousse récente, bien distincte de la vaisselle abandonnée.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "medkits": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-cellar",
      "room": "cellar",
      "x": 1460,
      "y": 144,
      "kind": "cache",
      "title": "Vérifier la caisse d’étanchéité",
      "text": "Les cartouches sont sèches. La réserve ne se remplit pas au retour.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "flares": 2
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-dorm",
      "room": "dormitory",
      "x": 1250,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir le bagage abandonné",
      "text": "Du linge, rien qui puisse servir contre les créatures.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {},
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-tower",
      "room": "tower",
      "x": 1120,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir l’étui du relais",
      "text": "La réserve de l’équipe radio contient une trousse.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "medkits": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-refuge",
      "room": "refuge",
      "x": 1000,
      "y": 144,
      "kind": "cache",
      "title": "Fouiller le sac abandonné",
      "text": "Une fusée est restée à côté des relevés.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "flares": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-gantry",
      "room": "gantry",
      "x": 1160,
      "y": 144,
      "kind": "cache",
      "title": "Récupérer la réserve de l’expédition",
      "text": "Une trousse que le groupe n’a pas pu emporter.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "medkits": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-station",
      "room": "station",
      "x": 1980,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir la caisse de retour",
      "text": "Une fusée pour baliser le quai.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "flares": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "case-infirmary",
      "room": "infirmary",
      "x": 640,
      "y": 144,
      "kind": "cache",
      "title": "Ouvrir le coffre récent",
      "text": "Le matériel ancien n’est plus utilisable. La trousse récente, si.",
      "hold": 0.7,
      "sourceStatus": "original-gameplay",
      "reward": {
        "medkits": 1
      },
      "after": "gear",
      "asset": "case-field"
    },
    {
      "id": "roster",
      "room": "dormitory",
      "x": 720,
      "y": 144,
      "kind": "clue",
      "title": "La liste des couchages",
      "text": "Les noms correspondent à des couchages encore préparés. Le départ n’a pas été organisé.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "meal",
      "room": "mess",
      "x": 920,
      "y": 144,
      "kind": "clue",
      "title": "Le repas interrompu",
      "text": "Plusieurs places ont été dressées ensemble. Aucune affaire de voyage ne les accompagne.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "cargo",
      "room": "cellar",
      "x": 610,
      "y": 144,
      "kind": "clue",
      "title": "Un départ sans chargement",
      "text": "Le lot destiné au prochain départ est toujours sur ses supports. La station n’a pas été évacuée normalement.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "ledge",
      "room": "balcony",
      "x": 870,
      "y": 144,
      "kind": "clue",
      "title": "L’assise de la façade",
      "text": "La corniche rejoint le vestibule. Le verrou est accessible depuis ce balcon, pas depuis l’entrée.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "channels",
      "room": "drain",
      "x": 760,
      "y": 144,
      "kind": "clue",
      "title": "La direction de l’écoulement",
      "text": "La rigole passe sous la conduite puis remonte vers le palier des entraves. Un passage étroit, à l’écart de la grande galerie.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "niches",
      "room": "cloister",
      "x": 980,
      "y": 144,
      "kind": "clue",
      "title": "La profondeur des niches",
      "text": "La pierre protège de la vue, pas d’un chasseur qui vous a regardée entrer.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "cable-test",
      "room": "workshop",
      "x": 390,
      "y": 144,
      "kind": "clue",
      "title": "Le relevé du câble",
      "text": "Le câble de halage doit passer dans son guide avant de subir une traction.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "anchor-log",
      "room": "engine",
      "x": 960,
      "y": 144,
      "kind": "clue",
      "title": "Le carnet de maintenance",
      "text": "Les appuis du treuil sont pris dans la charpente. La commande et le guide ont des fonctions distinctes.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "coast",
      "room": "tower",
      "x": 250,
      "y": 144,
      "kind": "clue",
      "title": "Le croquis du quai",
      "text": "Le dessin ancien repère les cuves et le bord du quai ; il ne garantit pas l’état actuel de la glace.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "asset": "field-page"
    },
    {
      "id": "hide-mess",
      "room": "mess",
      "x": 600,
      "y": 144,
      "kind": "hide",
      "title": "Se glisser dans le placard",
      "text": "Rester immobile. L’obscurité ne suffit pas si la créature vous a vue entrer.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "after": null,
      "asset": "locker"
    },
    {
      "id": "hide-glyphs",
      "room": "glyphs",
      "x": 1550,
      "y": 144,
      "kind": "hide",
      "title": "Se dissimuler dans la niche",
      "text": "Rester immobile. L’obscurité ne suffit pas si la créature vous a vue entrer.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "after": "cycle",
      "asset": "hide-niche"
    },
    {
      "id": "hide-cloister",
      "room": "cloister",
      "x": 700,
      "y": 144,
      "kind": "hide",
      "title": "Se dissimuler dans la niche",
      "text": "Rester immobile. L’obscurité ne suffit pas si la créature vous a vue entrer.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "after": "cycle",
      "asset": "hide-niche"
    },
    {
      "id": "hide-incubator",
      "room": "incubator",
      "x": 700,
      "y": 144,
      "kind": "hide",
      "title": "Se dissimuler dans le renfoncement",
      "text": "Rester immobile. L’obscurité ne suffit pas si la créature vous a vue entrer.",
      "hold": 0.4,
      "sourceStatus": "original-gameplay",
      "after": "alliance",
      "asset": "hide-niche"
    }
  ],
  "investigations": [
    {
      "id": "silent-station",
      "title": "Les absents de la station",
      "clues": [
        "roster",
        "meal",
        "cargo"
      ],
      "text": "Les lits étaient prêts, le repas servi et la cargaison attendait. Personne n’avait prévu de partir cette nuit-là."
    },
    {
      "id": "return-routes",
      "title": "Lire le monument",
      "clues": [
        "ledge",
        "channels",
        "niches"
      ],
      "text": "Le balcon rejoint l’entrée ; le drain rejoint les entraves ; les niches rompent la vue. Trois repères à utiliser pendant la retraite."
    },
    {
      "id": "old-machines",
      "title": "Ce que la station peut encore offrir",
      "clues": [
        "cable-test",
        "anchor-log",
        "coast"
      ],
      "text": "La réserve est limitée et la ligne doit suivre son guide. Le terrain donne une issue, pas une victoire automatique."
    }
  ],
  "portals": [
    {
      "id": "glyphs~refuge",
      "doors": [
        "glyphs--refuge",
        "refuge--glyphs"
      ],
      "rooms": [
        "glyphs",
        "refuge"
      ],
      "title": "Grille du dernier abri",
      "hp": 3,
      "material": "metal",
      "hold": 0.55
    },
    {
      "id": "refuge~trophies",
      "doors": [
        "refuge--trophies",
        "trophies--refuge"
      ],
      "rooms": [
        "refuge",
        "trophies"
      ],
      "title": "Grille des trophées",
      "hp": 3,
      "material": "metal",
      "hold": 0.55
    },
    {
      "id": "service~nursery",
      "doors": [
        "service--nursery",
        "nursery--service"
      ],
      "rooms": [
        "service",
        "nursery"
      ],
      "title": "Herse de la nurserie",
      "hp": 3,
      "material": "metal",
      "hold": 0.55
    },
    {
      "id": "weights~cloister",
      "doors": [
        "weights--cloister",
        "cloister--weights"
      ],
      "rooms": [
        "weights",
        "cloister"
      ],
      "title": "Herse des niches",
      "hp": 3,
      "material": "metal",
      "hold": 0.55
    },
    {
      "id": "incubator~nursery",
      "doors": [
        "incubator--nursery",
        "nursery--incubator"
      ],
      "rooms": [
        "incubator",
        "nursery"
      ],
      "title": "Vantail de l’incubateur",
      "hp": 2,
      "material": "metal",
      "hold": 0.55
    },
    {
      "id": "hunter~service",
      "doors": [
        "hunter--service",
        "service--hunter"
      ],
      "rooms": [
        "hunter",
        "service"
      ],
      "title": "Vantail du passage inférieur",
      "hp": 3,
      "material": "metal",
      "hold": 0.55
    },
    {
      "id": "dormitory~mess",
      "doors": [
        "dormitory--mess",
        "mess--dormitory"
      ],
      "rooms": [
        "dormitory",
        "mess"
      ],
      "title": "Porte du réfectoire",
      "hp": 2,
      "material": "timber",
      "hold": 0.55
    },
    {
      "id": "nursery~queenhold",
      "doors": [
        "nursery--queenhold",
        "queenhold--nursery"
      ],
      "rooms": [
        "nursery",
        "queenhold"
      ],
      "title": "Grille des entraves",
      "hp": 3,
      "material": "metal",
      "hold": 0.55
    }
  ],
  "huntRoutes": [
    {
      "door": "vestibule--sacrifice",
      "from": "vestibule",
      "to": "sacrifice",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "vestibule--pivot",
      "from": "vestibule",
      "to": "pivot",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "vestibule--balcony",
      "from": "vestibule",
      "to": "balcony",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "sacrifice--vestibule",
      "from": "sacrifice",
      "to": "vestibule",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "sacrifice--ossuary",
      "from": "sacrifice",
      "to": "ossuary",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "ossuary--sacrifice",
      "from": "ossuary",
      "to": "sacrifice",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "ossuary--weapons",
      "from": "ossuary",
      "to": "weapons",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "weapons--ossuary",
      "from": "weapons",
      "to": "ossuary",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "weapons--pivot",
      "from": "weapons",
      "to": "pivot",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "pivot--weapons",
      "from": "pivot",
      "to": "weapons",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "pivot--press",
      "from": "pivot",
      "to": "press",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "pivot--vestibule",
      "from": "pivot",
      "to": "vestibule",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "pivot--weights",
      "from": "pivot",
      "to": "weights",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "press--pivot",
      "from": "press",
      "to": "pivot",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "press--duel",
      "from": "press",
      "to": "duel",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "press--weights",
      "from": "press",
      "to": "weights",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "duel--press",
      "from": "duel",
      "to": "press",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "duel--glyphs",
      "from": "duel",
      "to": "glyphs",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "duel--cloister",
      "from": "duel",
      "to": "cloister",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "glyphs--duel",
      "from": "glyphs",
      "to": "duel",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "glyphs--refuge",
      "from": "glyphs",
      "to": "refuge",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "glyphs--hunter",
      "from": "glyphs",
      "to": "hunter",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "glyphs--astrarium",
      "from": "glyphs",
      "to": "astrarium",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "refuge--glyphs",
      "from": "refuge",
      "to": "glyphs",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "refuge--trophies",
      "from": "refuge",
      "to": "trophies",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "refuge--balcony",
      "from": "refuge",
      "to": "balcony",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "hunter--glyphs",
      "from": "hunter",
      "to": "glyphs",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "hunter--service",
      "from": "hunter",
      "to": "service",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "service--hunter",
      "from": "service",
      "to": "hunter",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "service--nursery",
      "from": "service",
      "to": "nursery",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "service--incubator",
      "from": "service",
      "to": "incubator",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "nursery--service",
      "from": "nursery",
      "to": "service",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "nursery--queenhold",
      "from": "nursery",
      "to": "queenhold",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "nursery--trophies",
      "from": "nursery",
      "to": "trophies",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "nursery--incubator",
      "from": "nursery",
      "to": "incubator",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "nursery--gantry",
      "from": "nursery",
      "to": "gantry",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "queenhold--nursery",
      "from": "queenhold",
      "to": "nursery",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "queenhold--gantry",
      "from": "queenhold",
      "to": "gantry",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "trophies--refuge",
      "from": "trophies",
      "to": "refuge",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "trophies--nursery",
      "from": "trophies",
      "to": "nursery",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "weights--pivot",
      "from": "weights",
      "to": "pivot",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "weights--press",
      "from": "weights",
      "to": "press",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "weights--cloister",
      "from": "weights",
      "to": "cloister",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "astrarium--glyphs",
      "from": "astrarium",
      "to": "glyphs",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "incubator--service",
      "from": "incubator",
      "to": "service",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "incubator--nursery",
      "from": "incubator",
      "to": "nursery",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "incubator--drain",
      "from": "incubator",
      "to": "drain",
      "kind": "vent",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "gantry--nursery",
      "from": "gantry",
      "to": "nursery",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "gantry--queenhold",
      "from": "gantry",
      "to": "queenhold",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "gantry--drain",
      "from": "gantry",
      "to": "drain",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "balcony--refuge",
      "from": "balcony",
      "to": "refuge",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "balcony--vestibule",
      "from": "balcony",
      "to": "vestibule",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "drain--incubator",
      "from": "drain",
      "to": "incubator",
      "kind": "vent",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "drain--gantry",
      "from": "drain",
      "to": "gantry",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "cloister--weights",
      "from": "cloister",
      "to": "weights",
      "kind": "door",
      "maxHops": 2,
      "expiry": 26
    },
    {
      "door": "cloister--duel",
      "from": "cloister",
      "to": "duel",
      "kind": "stairs",
      "maxHops": 2,
      "expiry": 26
    }
  ],
  "devices": [
    {
      "id": "lamp-workshop",
      "room": "workshop",
      "kind": "lamp",
      "x": 330,
      "y": 150,
      "fx": 330,
      "fy": 150,
      "radius": 480,
      "title": "Lampe de l’atelier",
      "text": "Le pied du projecteur appartient à l’expédition, pas au mobilier ancien.",
      "after": "gear",
      "power": "power",
      "defaultOn": true,
      "hold": 0.65,
      "delay": 0,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "lamp-station",
      "room": "station",
      "kind": "lamp",
      "x": 650,
      "y": 163,
      "fx": 650,
      "fy": 163,
      "radius": 510,
      "title": "Projecteur de la cour",
      "text": "Le câble rejoint le groupe raccordé dans la machinerie.",
      "after": "gear",
      "power": "power",
      "defaultOn": true,
      "hold": 0.65,
      "delay": 0,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "lamp-forecourt",
      "room": "forecourt",
      "kind": "lamp",
      "x": 1490,
      "y": 151,
      "fx": 1490,
      "fy": 151,
      "radius": 520,
      "title": "Projecteur du parvis",
      "text": "Un éclairage portable laissé sur le trajet de retour.",
      "after": "rope",
      "power": null,
      "defaultOn": true,
      "hold": 0.65,
      "delay": 0,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "lamp-sacrifice",
      "room": "sacrifice",
      "kind": "lamp",
      "x": 760,
      "y": 151,
      "fx": 760,
      "fy": 151,
      "radius": 460,
      "title": "Balise de l’équipe",
      "text": "Le faisceau balaye les dalles sans traverser la pierre.",
      "after": "facade",
      "power": null,
      "defaultOn": true,
      "hold": 0.65,
      "delay": 0,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "lamp-glyphs",
      "room": "glyphs",
      "kind": "lamp",
      "x": 1250,
      "y": 144,
      "fx": 1250,
      "fy": 144,
      "radius": 455,
      "title": "Lampe de lecture",
      "text": "Son halo rend les inscriptions lisibles mais expose le passage.",
      "after": "cycle",
      "power": null,
      "defaultOn": true,
      "hold": 0.65,
      "delay": 0,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "lamp-hunter",
      "room": "hunter",
      "kind": "lamp",
      "x": 1230,
      "y": 151,
      "fx": 1230,
      "fy": 151,
      "radius": 500,
      "title": "Projecteur abandonné",
      "text": "Couper cette lumière ne retire pas la mémoire des créatures.",
      "after": "weyland",
      "power": null,
      "defaultOn": true,
      "hold": 0.65,
      "delay": 0,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "rattle-weights",
      "room": "weights",
      "kind": "rattle",
      "x": 600,
      "y": 157,
      "fx": 700,
      "fy": 144,
      "radius": 760,
      "title": "Chaîne de rappel",
      "text": "Une traction charge le ressort ; les maillons résonnent quelques secondes plus tard.",
      "after": "plasma",
      "power": null,
      "defaultOn": false,
      "hold": 0.65,
      "delay": 2.6,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "rattle-pivot",
      "room": "pivot",
      "kind": "rattle",
      "x": 1320,
      "y": 158,
      "fx": 1460,
      "fy": 170,
      "radius": 710,
      "title": "Chaîne du rail latéral",
      "text": "Ce mécanisme sonore n’altère ni les cycles ni la géométrie des dalles.",
      "after": "plasma",
      "power": null,
      "defaultOn": false,
      "hold": 0.65,
      "delay": 2.6,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "radio-service",
      "room": "service",
      "kind": "radio",
      "x": 670,
      "y": 144,
      "fx": 740,
      "fy": 144,
      "radius": 690,
      "title": "Radio de l’équipe",
      "text": "Le grésillement retardé vient de la radio, jamais de la position suivante de Lex.",
      "after": "alliance",
      "power": null,
      "defaultOn": false,
      "hold": 0.65,
      "delay": 2.6,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "rattle-cloister",
      "room": "cloister",
      "kind": "rattle",
      "x": 1190,
      "y": 151,
      "fx": 1400,
      "fy": 144,
      "radius": 740,
      "title": "Anneau de service",
      "text": "Les maillons peuvent détourner une recherche, pas un coup déjà engagé.",
      "after": "ritual",
      "power": null,
      "defaultOn": false,
      "hold": 0.65,
      "delay": 2.6,
      "duration": 5.2,
      "cooldown": 24,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "mist-drain",
      "room": "drain",
      "kind": "mist",
      "x": 1030,
      "y": 144,
      "fx": 1260,
      "fy": 144,
      "radius": 250,
      "title": "Vanne de la citerne",
      "text": "La chute d’eau soulève un rideau de condensation temporaire. Les coups peuvent le traverser.",
      "after": "plasma",
      "power": null,
      "defaultOn": false,
      "hold": 0.65,
      "delay": 0,
      "duration": 7,
      "cooldown": 32,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "mist-incubator",
      "room": "incubator",
      "kind": "mist",
      "x": 1350,
      "y": 144,
      "fx": 1550,
      "fy": 144,
      "radius": 245,
      "title": "Purge du conduit",
      "text": "Le rideau masque les silhouettes, mais n’étouffe pas les pas.",
      "after": "alliance",
      "power": null,
      "defaultOn": false,
      "hold": 0.65,
      "delay": 0,
      "duration": 7,
      "cooldown": 32,
      "sourceStatus": "original-gameplay"
    }
  ],
  "materials": {
    "stone": {
      "name": "Dalles sèches",
      "walkNoise": 105,
      "runNoise": 340,
      "crouchNoise": 32,
      "speed": 1
    },
    "metal": {
      "name": "Métal résonnant",
      "walkNoise": 220,
      "runNoise": 590,
      "crouchNoise": 76,
      "speed": 1
    },
    "water": {
      "name": "Eau peu profonde",
      "walkNoise": 200,
      "runNoise": 510,
      "crouchNoise": 88,
      "speed": 0.84
    },
    "shards": {
      "name": "Gravats instables",
      "walkNoise": 210,
      "runNoise": 540,
      "crouchNoise": 82,
      "speed": 0.94
    },
    "resin": {
      "name": "Résine adhérente",
      "walkNoise": 64,
      "runNoise": 230,
      "crouchNoise": 25,
      "speed": 0.83
    },
    "snow": {
      "name": "Neige tassée",
      "walkNoise": 55,
      "runNoise": 210,
      "crouchNoise": 22,
      "speed": 0.97
    }
  },
  "terrainZones": [
    {
      "id": "ground-01",
      "room": "maru",
      "material": "metal",
      "x": 520,
      "y": 128,
      "w": 510,
      "h": 47,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-02",
      "room": "landing",
      "material": "snow",
      "x": 420,
      "y": 115,
      "w": 730,
      "h": 68,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-03",
      "room": "station",
      "material": "metal",
      "x": 1210,
      "y": 130,
      "w": 330,
      "h": 48,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-04",
      "room": "station",
      "material": "snow",
      "x": 420,
      "y": 208,
      "w": 930,
      "h": 29,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-05",
      "room": "workshop",
      "material": "metal",
      "x": 900,
      "y": 105,
      "w": 260,
      "h": 60,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-06",
      "room": "engine",
      "material": "metal",
      "x": 710,
      "y": 124,
      "w": 415,
      "h": 57,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-07",
      "room": "cellar",
      "material": "water",
      "x": 700,
      "y": 115,
      "w": 550,
      "h": 48,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-08",
      "room": "bore",
      "material": "shards",
      "x": 740,
      "y": 129,
      "w": 330,
      "h": 43,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-09",
      "room": "forecourt",
      "material": "shards",
      "x": 630,
      "y": 122,
      "w": 300,
      "h": 53,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-10",
      "room": "sacrifice",
      "material": "metal",
      "x": 1160,
      "y": 108,
      "w": 235,
      "h": 55,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-11",
      "room": "sacrifice",
      "material": "shards",
      "x": 420,
      "y": 196,
      "w": 390,
      "h": 42,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-12",
      "room": "weapons",
      "material": "metal",
      "x": 1150,
      "y": 135,
      "w": 190,
      "h": 43,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-13",
      "room": "weights",
      "material": "metal",
      "x": 850,
      "y": 190,
      "w": 450,
      "h": 45,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-14",
      "room": "pivot",
      "material": "metal",
      "x": 1260,
      "y": 135,
      "w": 275,
      "h": 53,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-15",
      "room": "press",
      "material": "shards",
      "x": 700,
      "y": 130,
      "w": 280,
      "h": 45,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-16",
      "room": "duel",
      "material": "shards",
      "x": 920,
      "y": 140,
      "w": 290,
      "h": 49,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-17",
      "room": "glyphs",
      "material": "shards",
      "x": 680,
      "y": 129,
      "w": 220,
      "h": 43,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-18",
      "room": "hunter",
      "material": "shards",
      "x": 1090,
      "y": 204,
      "w": 310,
      "h": 33,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-19",
      "room": "service",
      "material": "resin",
      "x": 620,
      "y": 128,
      "w": 380,
      "h": 48,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-20",
      "room": "nursery",
      "material": "resin",
      "x": 990,
      "y": 120,
      "w": 285,
      "h": 55,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-21",
      "room": "incubator",
      "material": "water",
      "x": 1130,
      "y": 124,
      "w": 240,
      "h": 50,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-22",
      "room": "gantry",
      "material": "metal",
      "x": 1040,
      "y": 139,
      "w": 370,
      "h": 45,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-23",
      "room": "drain",
      "material": "water",
      "x": 560,
      "y": 116,
      "w": 860,
      "h": 60,
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "ground-24",
      "room": "icebattle",
      "material": "metal",
      "x": 1230,
      "y": 120,
      "w": 345,
      "h": 44,
      "sourceStatus": "original-gameplay"
    }
  ],
  "rigSpec": {
    "room": "icebattle",
    "id": "queen-final",
    "minimumX": 1360,
    "maximumX": 2160,
    "maximumDepthGap": 78,
    "boltSpeed": 680,
    "boltLife": 1.5,
    "reload": 2.2,
    "anchor": {
      "x": 340,
      "y": 70
    },
    "sourceStatus": "original-gameplay"
  }
};

