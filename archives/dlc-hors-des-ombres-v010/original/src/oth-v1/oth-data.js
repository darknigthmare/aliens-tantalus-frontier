export const DATA = {
  "id": "mire-out-of-shadows",
  "version": "0.10.0",
  "title": "ALIEN — HORS DES OMBRES",
  "subtitle": "LA SORTIE DES PROFONDEURS",
  "saveKey": "atf:mire:out-of-shadows:v1",
  "sourceStatus": "unofficial-adaptation-prototype",
  "rooms": [
    {
      "id": "bridge",
      "name": "Passerelle du Marion",
      "zone": "marion",
      "style": "ship",
      "mode": "depth",
      "width": 2160,
      "depth": 180,
      "deck": "A-01",
      "motif": "nav",
      "description": "Grande baie orbitale, consoles orientées vers la planète, commandement surélevé derrière une coursive praticable.",
      "sourceStatus": "original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "bridge:prop:0",
          "type": "terminal",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "bridge:prop:1",
          "type": "chair",
          "x": 670,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "bridge:prop:2",
          "type": "console",
          "x": 994,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "bridge:prop:3",
          "type": "locker",
          "x": 1339,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "bridge:prop:4",
          "type": "console",
          "x": 1642,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "bridge:prop:5",
          "type": "bench",
          "x": 1835,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "bridge:dressing:0",
          "type": "cable",
          "x": 415,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "bridge:dressing:1",
          "type": "vent",
          "x": 825,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "bridge:dressing:2",
          "type": "extinguisher",
          "x": 1505,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "bridge:dressing:3",
          "type": "strap",
          "x": 1950,
          "y": 166,
          "scale": 1,
          "solid": false,
          "variant": 3
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 518,
          "y": 88
        },
        {
          "id": "b",
          "x": 1188,
          "y": 88
        },
        {
          "id": "c",
          "x": 1771,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e01:bridge",
          "edge": "e01",
          "target": "comms",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e02:bridge",
          "edge": "e02",
          "target": "junction",
          "kind": "door",
          "x": 2070,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.42,
        "pools": [
          {
            "x": 475,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1577,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e01:bridge:return:-1",
          "portal": "e01:bridge",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e01:bridge:return:1",
          "portal": "e01:bridge",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e02:bridge:return:-1",
          "portal": "e02:bridge",
          "x": 2000,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e02:bridge:return:1",
          "portal": "e02:bridge",
          "x": 2128,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "comms",
      "name": "Relais des communications",
      "zone": "marion",
      "style": "ship",
      "mode": "profile",
      "width": 1680,
      "depth": 180,
      "deck": "A-02",
      "motif": "signal",
      "description": "Antenne sectionnée visible à travers la baie. Les racks longent le mur ; le chemin central reste dégagé.",
      "sourceStatus": "original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "comms:prop:0",
          "type": "rack",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "comms:prop:1",
          "type": "terminal",
          "x": 521,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "comms:prop:2",
          "type": "cable",
          "x": 773,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "comms:prop:3",
          "type": "locker",
          "x": 1042,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "comms:prop:4",
          "type": "rack",
          "x": 1277,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "comms:prop:5",
          "type": "toolcart",
          "x": 1355,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "comms:dressing:0",
          "type": "vent",
          "x": 690,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "comms:dressing:1",
          "type": "cable",
          "x": 1120,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-comms-0",
          "type": "serviceHatch",
          "x": 1300,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0,
          "purpose": "Habillage de mur ; non présentée comme un passage utilisable."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 403,
          "y": 88
        },
        {
          "id": "b",
          "x": 924,
          "y": 88
        },
        {
          "id": "c",
          "x": 1378,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e01:comms",
          "edge": "e01",
          "target": "bridge",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.42,
        "pools": [
          {
            "x": 370,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1226,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e01:comms:return:-1",
          "portal": "e01:comms",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e01:comms:return:1",
          "portal": "e01:comms",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "junction",
      "name": "Coursive des équipages",
      "zone": "marion",
      "style": "ship",
      "mode": "depth",
      "width": 2460,
      "depth": 180,
      "deck": "A-03",
      "motif": "spine",
      "description": "Trois accès de fond mènent à des pièces différentes. Les conduites suivent les cloisons et ne traversent pas les portes.",
      "sourceStatus": "original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "junction:prop:0",
          "type": "locker",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "junction:prop:1",
          "type": "bench",
          "x": 763,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "junction:prop:2",
          "type": "pipe",
          "x": 1132,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "junction:prop:3",
          "type": "crate",
          "x": 1525,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "junction:prop:4",
          "type": "vent",
          "x": 1870,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "junction:prop:5",
          "type": "extinguisher",
          "x": 2135,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "junction:dressing:0",
          "type": "cable",
          "x": 940,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "junction:dressing:1",
          "type": "strap",
          "x": 1740,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "junction:dressing:2",
          "type": "pallet",
          "x": 2070,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 2
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 590,
          "y": 88
        },
        {
          "id": "b",
          "x": 1353,
          "y": 88
        },
        {
          "id": "c",
          "x": 2017,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e02:junction",
          "edge": "e02",
          "target": "bridge",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e03:junction",
          "edge": "e03",
          "target": "engineering",
          "kind": "door",
          "x": 2370,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e04:junction",
          "edge": "e04",
          "target": "medical",
          "kind": "door",
          "x": 861,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e05:junction",
          "edge": "e05",
          "target": "airlock",
          "kind": "door",
          "x": 1304,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-rec-0:a",
          "edge": "oth-annex-rec-0",
          "target": "rec",
          "x": 1697,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.42,
        "pools": [
          {
            "x": 541,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1796,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e02:junction:return:-1",
          "portal": "e02:junction",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e02:junction:return:1",
          "portal": "e02:junction",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e03:junction:return:-1",
          "portal": "e03:junction",
          "x": 2300,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e03:junction:return:1",
          "portal": "e03:junction",
          "x": 2428,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-0:a:return:-1",
          "portal": "oth-annex-rec-0:a",
          "x": 1627,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-0:a:return:1",
          "portal": "oth-annex-rec-0:a",
          "x": 1755,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "engineering",
      "name": "Distribution électrique",
      "zone": "marion",
      "style": "industrial",
      "mode": "depth",
      "width": 2520,
      "depth": 180,
      "deck": "B-01",
      "motif": "power",
      "description": "Bus de puissance à gauche, échangeurs à droite, vannes sous les tuyaux. Deux passages entourent les machines.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "engineering:prop:0",
          "type": "generator",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "engineering:prop:1",
          "type": "pipe",
          "x": 781,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "engineering:prop:2",
          "type": "valve",
          "x": 1159,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "engineering:prop:3",
          "type": "crate",
          "x": 1562,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "engineering:prop:4",
          "type": "toolcart",
          "x": 1915,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "engineering:prop:5",
          "type": "terminal",
          "x": 2195,
          "y": 145,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "engineering:dressing:0",
          "type": "cable",
          "x": 550,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "engineering:dressing:1",
          "type": "vent",
          "x": 970,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "engineering:dressing:2",
          "type": "pallet",
          "x": 1740,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "v03-engineering-0",
          "type": "cableSpool",
          "x": 930,
          "y": 153,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Stock technique réservé aux locaux humains."
        },
        {
          "id": "v03-engineering-1",
          "type": "serviceHatch",
          "x": 2180,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0,
          "purpose": "Habillage de mur ; non présentée comme un passage utilisable."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 605,
          "y": 88
        },
        {
          "id": "b",
          "x": 1386,
          "y": 88
        },
        {
          "id": "c",
          "x": 2066,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e03:engineering",
          "edge": "e03",
          "target": "junction",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e08:engineering",
          "edge": "e08",
          "target": "workshop",
          "kind": "door",
          "x": 2430,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e09:engineering",
          "edge": "e09",
          "target": "server",
          "kind": "door",
          "x": 882,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-maintenance-0:a",
          "edge": "oth-annex-maintenance-0",
          "target": "maintenance",
          "x": 1738,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 554,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1840,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e03:engineering:return:-1",
          "portal": "e03:engineering",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e03:engineering:return:1",
          "portal": "e03:engineering",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e08:engineering:return:-1",
          "portal": "e08:engineering",
          "x": 2360,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e08:engineering:return:1",
          "portal": "e08:engineering",
          "x": 2488,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-0:a:return:-1",
          "portal": "oth-annex-maintenance-0:a",
          "x": 1668,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-0:a:return:1",
          "portal": "oth-annex-maintenance-0:a",
          "x": 1796,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "airlock",
      "name": "Sas de confinement",
      "zone": "marion",
      "style": "industrial",
      "mode": "profile",
      "width": 1700,
      "depth": 180,
      "deck": "B-02",
      "motif": "seal",
      "description": "Deux portes étanches encadrent une zone de purge. Un hublot permet de lire l’état du compartiment suivant.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "airlock:prop:0",
          "type": "valve",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "airlock:prop:1",
          "type": "extinguisher",
          "x": 527,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "airlock:prop:2",
          "type": "terminal",
          "x": 782,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "airlock:prop:3",
          "type": "pipe",
          "x": 1054,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "airlock:prop:4",
          "type": "locker",
          "x": 1292,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "airlock:prop:5",
          "type": "vent",
          "x": 1375,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 408,
          "y": 88
        },
        {
          "id": "b",
          "x": 935,
          "y": 88
        },
        {
          "id": "c",
          "x": 1394,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e05:airlock",
          "edge": "e05",
          "target": "junction",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e06:airlock",
          "edge": "e06",
          "target": "hangar",
          "kind": "door",
          "x": 1610,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 374,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1241,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e05:airlock:return:-1",
          "portal": "e05:airlock",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e05:airlock:return:1",
          "portal": "e05:airlock",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e06:airlock:return:-1",
          "portal": "e06:airlock",
          "x": 1540,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e06:airlock:return:1",
          "portal": "e06:airlock",
          "x": 1668,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "hangar",
      "name": "Hangar des navettes",
      "zone": "marion",
      "style": "hangar",
      "mode": "depth",
      "width": 2860,
      "depth": 180,
      "deck": "C-01",
      "motif": "cargo",
      "description": "Volume à trois bandes praticables. Palan suspendu, travées de chargement et navette en fond hors collision.",
      "sourceStatus": "original-layout",
      "ambient": "amb_hangar",
      "props": [
        {
          "id": "hangar:prop:0",
          "type": "pallet",
          "x": 330,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "hangar:prop:1",
          "type": "crate",
          "x": 887,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "hangar:prop:2",
          "type": "forklift",
          "x": 1316,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "hangar:prop:3",
          "type": "barrel",
          "x": 1773,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "hangar:prop:4",
          "type": "crate",
          "x": 2174,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "hangar:prop:5",
          "type": "toolcart",
          "x": 2535,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "hangar:dressing:0",
          "type": "strap",
          "x": 440,
          "y": 166,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "hangar:dressing:1",
          "type": "cable",
          "x": 1010,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "hangar:dressing:2",
          "type": "pallet",
          "x": 1450,
          "y": 166,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "hangar:dressing:3",
          "type": "extinguisher",
          "x": 2400,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 3
        },
        {
          "id": "v03-hangar-0",
          "type": "cableSpool",
          "x": 1970,
          "y": 148,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Stock technique réservé aux locaux humains."
        },
        {
          "id": "v03-hangar-1",
          "type": "serviceHatch",
          "x": 640,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0,
          "purpose": "Habillage de mur ; non présentée comme un passage utilisable."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 686,
          "y": 88
        },
        {
          "id": "b",
          "x": 1573,
          "y": 88
        },
        {
          "id": "c",
          "x": 2345,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e06:hangar",
          "edge": "e06",
          "target": "airlock",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e07:hangar",
          "edge": "e07",
          "target": "breach",
          "kind": "door",
          "x": 2770,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e10:hangar",
          "edge": "e10",
          "target": "dock",
          "kind": "door",
          "x": 1001,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e12:hangar",
          "edge": "e12",
          "target": "boarding",
          "kind": "door",
          "x": 1516,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e30:hangar",
          "edge": "e30",
          "target": "hold",
          "kind": "door",
          "x": 2031,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "service-cargo:hangar",
          "edge": "service-cargo",
          "target": "workshop",
          "kind": "door",
          "x": 390,
          "y": 88,
          "repair": "repair-cargo",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.28,
        "pools": [
          {
            "x": 629,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 2088,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e06:hangar:return:-1",
          "portal": "e06:hangar",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e06:hangar:return:1",
          "portal": "e06:hangar",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e07:hangar:return:-1",
          "portal": "e07:hangar",
          "x": 2700,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e07:hangar:return:1",
          "portal": "e07:hangar",
          "x": 2828,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-cargo:hangar:return:-1",
          "portal": "service-cargo:hangar",
          "x": 320,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-cargo:hangar:return:1",
          "portal": "service-cargo:hangar",
          "x": 448,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "breach",
      "name": "Brèche de la Delilah",
      "zone": "marion",
      "style": "wreck",
      "mode": "profile",
      "width": 2240,
      "depth": 180,
      "deck": "C-02",
      "motif": "wreck",
      "description": "Tôle froissée en arrière-plan, câble arraché au premier plan, ligne de fuite derrière les écrans pare-feu.",
      "sourceStatus": "original-layout",
      "ambient": "amb_wreck",
      "props": [
        {
          "id": "breach:prop:0",
          "type": "debris",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "breach:prop:1",
          "type": "pipe",
          "x": 694,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "breach:prop:2",
          "type": "extinguisher",
          "x": 1030,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "breach:prop:3",
          "type": "barrel",
          "x": 1389,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "breach:prop:4",
          "type": "debris",
          "x": 1702,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "breach:prop:5",
          "type": "terminal",
          "x": 1915,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 538,
          "y": 88
        },
        {
          "id": "b",
          "x": 1232,
          "y": 88
        },
        {
          "id": "c",
          "x": 1837,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e07:breach",
          "edge": "e07",
          "target": "hangar",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.24,
        "pools": [
          {
            "x": 493,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1635,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e07:breach:return:-1",
          "portal": "e07:breach",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e07:breach:return:1",
          "portal": "e07:breach",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "workshop",
      "name": "Atelier de bord",
      "zone": "marion",
      "style": "industrial",
      "mode": "depth",
      "width": 1960,
      "depth": 180,
      "deck": "B-03",
      "motif": "tools",
      "description": "Établi et outillage regroupés ; consommables rangés sur des plateaux plutôt que posés au milieu des portes.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "workshop:prop:0",
          "type": "workbench",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "workshop:prop:1",
          "type": "serviceTrolley",
          "x": 1438,
          "y": 142,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "movable": "workshop-cart",
          "purpose": "Obstacle mobile tenu à deux mains ; position persistante, sans dégâts d’écrasement."
        },
        {
          "id": "workshop:prop:2",
          "type": "locker",
          "x": 902,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "workshop:prop:3",
          "type": "barrel",
          "x": 1215,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "workshop:prop:4",
          "type": "rack",
          "x": 1490,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "workshop:prop:5",
          "type": "terminal",
          "x": 1635,
          "y": 145,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "workshop:dressing:0",
          "type": "extinguisher",
          "x": 490,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "workshop:dressing:1",
          "type": "cable",
          "x": 780,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "workshop:dressing:2",
          "type": "pallet",
          "x": 1420,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "v03-workshop-0",
          "type": "cableSpool",
          "x": 1060,
          "y": 151,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Stock technique réservé aux locaux humains."
        },
        {
          "id": "v03-workshop-1",
          "type": "sampleRack",
          "x": 1770,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Rangement et contrôle des échantillons rapportés à l’atelier, hors de la circulation centrale."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 470,
          "y": 88
        },
        {
          "id": "b",
          "x": 1078,
          "y": 88
        },
        {
          "id": "c",
          "x": 1607,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e08:workshop",
          "edge": "e08",
          "target": "engineering",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-rec-1:a",
          "edge": "oth-annex-rec-1",
          "target": "rec",
          "x": 784,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "service-cargo:workshop",
          "edge": "service-cargo",
          "target": "hangar",
          "kind": "door",
          "x": 630,
          "y": 88,
          "repair": "repair-cargo",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 431,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1431,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e08:workshop:return:-1",
          "portal": "e08:workshop",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e08:workshop:return:1",
          "portal": "e08:workshop",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-1:a:return:-1",
          "portal": "oth-annex-rec-1:a",
          "x": 714,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-1:a:return:1",
          "portal": "oth-annex-rec-1:a",
          "x": 842,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-cargo:workshop:return:-1",
          "portal": "service-cargo:workshop",
          "x": 560,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-cargo:workshop:return:1",
          "portal": "service-cargo:workshop",
          "x": 688,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "medical",
      "name": "Infirmerie",
      "zone": "marion",
      "style": "medical",
      "mode": "depth",
      "width": 2240,
      "depth": 180,
      "deck": "A-04",
      "motif": "medical",
      "description": "Unité médicale alimentée par un bus local visible ; lits et rideaux créent des caches sans bloquer l’allée.",
      "sourceStatus": "original-layout",
      "ambient": "amb_medical",
      "props": [
        {
          "id": "medical:prop:0",
          "type": "medpod",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "medical:prop:1",
          "type": "bed",
          "x": 694,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "medical:prop:2",
          "type": "cabinet",
          "x": 1030,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "medical:prop:3",
          "type": "terminal",
          "x": 1389,
          "y": 160,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "medical:prop:4",
          "type": "bed",
          "x": 1702,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "medical:prop:5",
          "type": "chair",
          "x": 1915,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "medical:dressing:0",
          "type": "cable",
          "x": 420,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "medical:dressing:1",
          "type": "vent",
          "x": 870,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "medical:dressing:2",
          "type": "extinguisher",
          "x": 1510,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 538,
          "y": 88
        },
        {
          "id": "b",
          "x": 1232,
          "y": 88
        },
        {
          "id": "c",
          "x": 1837,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e04:medical",
          "edge": "e04",
          "target": "junction",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e31:medical",
          "edge": "e31",
          "target": "hold",
          "kind": "door",
          "x": 2150,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "service-medical:medical",
          "edge": "service-medical",
          "target": "rec",
          "kind": "door",
          "x": 1530,
          "y": 88,
          "repair": "repair-medical",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.66,
        "pools": [
          {
            "x": 493,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1635,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e04:medical:return:-1",
          "portal": "e04:medical",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e04:medical:return:1",
          "portal": "e04:medical",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e31:medical:return:-1",
          "portal": "e31:medical",
          "x": 2080,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e31:medical:return:1",
          "portal": "e31:medical",
          "x": 2208,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-medical:medical:return:-1",
          "portal": "service-medical:medical",
          "x": 1460,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-medical:medical:return:1",
          "portal": "service-medical:medical",
          "x": 1588,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "server",
      "name": "Cœur informatique",
      "zone": "marion",
      "style": "server",
      "mode": "profile",
      "width": 1960,
      "depth": 180,
      "deck": "B-04",
      "motif": "core",
      "description": "Racks à deux hauteurs et câbles en plafond. Le sectionneur mécanique reste distinct du terminal compromis.",
      "sourceStatus": "original-layout",
      "ambient": "amb_server",
      "props": [
        {
          "id": "server:prop:0",
          "type": "rack",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "server:prop:1",
          "type": "rack",
          "x": 608,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "server:prop:2",
          "type": "terminal",
          "x": 902,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "server:prop:3",
          "type": "pipe",
          "x": 1215,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "server:prop:4",
          "type": "rack",
          "x": 1490,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "server:prop:5",
          "type": "locker",
          "x": 1635,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "server:dressing:0",
          "type": "cable",
          "x": 430,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "server:dressing:1",
          "type": "vent",
          "x": 1370,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 470,
          "y": 88
        },
        {
          "id": "b",
          "x": 1078,
          "y": 88
        },
        {
          "id": "c",
          "x": 1607,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e09:server",
          "edge": "e09",
          "target": "engineering",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-maintenance-1:a",
          "edge": "oth-annex-maintenance-1",
          "target": "maintenance",
          "x": 784,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.3,
        "pools": [
          {
            "x": 431,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1431,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e09:server:return:-1",
          "portal": "e09:server",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e09:server:return:1",
          "portal": "e09:server",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-1:a:return:-1",
          "portal": "oth-annex-maintenance-1:a",
          "x": 714,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-1:a:return:1",
          "portal": "oth-annex-maintenance-1:a",
          "x": 842,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "dock",
      "name": "Amarrage du Narcissus",
      "zone": "marion",
      "style": "hangar",
      "mode": "depth",
      "width": 2100,
      "depth": 180,
      "deck": "C-03",
      "motif": "dock",
      "description": "Passerelle d’embarquement, bras d’arrimage et connexion ombilicale convergent vers une seule navette.",
      "sourceStatus": "original-layout",
      "ambient": "amb_hangar",
      "props": [
        {
          "id": "dock:prop:0",
          "type": "console",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "dock:prop:1",
          "type": "pipe",
          "x": 651,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "dock:prop:2",
          "type": "crate",
          "x": 966,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "dock:prop:3",
          "type": "terminal",
          "x": 1302,
          "y": 160,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "dock:prop:4",
          "type": "barrel",
          "x": 1596,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "dock:prop:5",
          "type": "toolcart",
          "x": 1775,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "dock:dressing:0",
          "type": "cable",
          "x": 480,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "dock:dressing:1",
          "type": "strap",
          "x": 1180,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 504,
          "y": 88
        },
        {
          "id": "b",
          "x": 1155,
          "y": 88
        },
        {
          "id": "c",
          "x": 1722,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e10:dock",
          "edge": "e10",
          "target": "hangar",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e11:dock",
          "edge": "e11",
          "target": "narcissus",
          "kind": "door",
          "x": 2010,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.28,
        "pools": [
          {
            "x": 462,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1533,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e10:dock:return:-1",
          "portal": "e10:dock",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e10:dock:return:1",
          "portal": "e10:dock",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e11:dock:return:-1",
          "portal": "e11:dock",
          "x": 1940,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e11:dock:return:1",
          "portal": "e11:dock",
          "x": 2068,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "narcissus",
      "name": "Narcissus — cryostase",
      "zone": "narcissus",
      "style": "medical",
      "mode": "profile",
      "width": 1600,
      "depth": 180,
      "deck": "N-01",
      "motif": "safe",
      "description": "Cockpit compact, alcôve de cryostase et coffre sécurisé de Jones. Aucun adversaire n’entre dans cette pièce.",
      "sourceStatus": "original-layout",
      "ambient": "amb_medical",
      "props": [
        {
          "id": "narcissus:prop:0",
          "type": "cryopod",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "narcissus:prop:1",
          "type": "catbox",
          "x": 496,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "narcissus:prop:2",
          "type": "console",
          "x": 736,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "narcissus:prop:3",
          "type": "locker",
          "x": 992,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "narcissus:prop:4",
          "type": "terminal",
          "x": 1216,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "narcissus:prop:5",
          "type": "cabinet",
          "x": 1275,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 384,
          "y": 88
        },
        {
          "id": "b",
          "x": 880,
          "y": 88
        },
        {
          "id": "c",
          "x": 1312,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e11:narcissus",
          "edge": "e11",
          "target": "dock",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.66,
        "pools": [
          {
            "x": 352,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1168,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e11:narcissus:return:-1",
          "portal": "e11:narcissus",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e11:narcissus:return:1",
          "portal": "e11:narcissus",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "samson",
      "name": "Samson — soute",
      "zone": "samson",
      "style": "hangar",
      "mode": "depth",
      "width": 2140,
      "depth": 180,
      "deck": "S-01",
      "motif": "shuttle",
      "description": "Rampe à gauche, palette de carburant et attaches au sol ; cockpit relié par une vraie porte de fond.",
      "sourceStatus": "original-layout",
      "ambient": "amb_hangar",
      "props": [
        {
          "id": "samson:prop:0",
          "type": "crate",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "samson:prop:1",
          "type": "pallet",
          "x": 663,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "samson:prop:2",
          "type": "barrel",
          "x": 984,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "samson:prop:3",
          "type": "strap",
          "x": 1327,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "samson:prop:4",
          "type": "crate",
          "x": 1626,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "samson:prop:5",
          "type": "terminal",
          "x": 1815,
          "y": 145,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "samson:dressing:0",
          "type": "strap",
          "x": 580,
          "y": 166,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "samson:dressing:1",
          "type": "cable",
          "x": 1450,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 514,
          "y": 88
        },
        {
          "id": "b",
          "x": 1177,
          "y": 88
        },
        {
          "id": "c",
          "x": 1755,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e13:samson",
          "edge": "e13",
          "target": "cockpit",
          "kind": "door",
          "x": 2050,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v10-arm-samson:samson",
          "edge": "v10-arm-samson",
          "target": "docking_arm",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.28,
        "pools": [
          {
            "x": 471,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1562,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e13:samson:return:-1",
          "portal": "e13:samson",
          "x": 1980,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e13:samson:return:1",
          "portal": "e13:samson",
          "x": 2108,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-arm-samson:samson:return:-1",
          "portal": "v10-arm-samson:samson",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-arm-samson:samson:return:1",
          "portal": "v10-arm-samson:samson",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction/lieu attesté dans un extrait",
        "layout": "plan original non coté",
        "source": "F02"
      }
    },
    {
      "id": "cockpit",
      "name": "Samson — cockpit",
      "zone": "samson",
      "style": "ship",
      "mode": "profile",
      "width": 1560,
      "depth": 180,
      "deck": "S-02",
      "motif": "flight",
      "description": "Deux sièges et tableau de vol ; le panorama change uniquement quand le transfert entre orbite et sol est autorisé.",
      "sourceStatus": "original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "cockpit:prop:0",
          "type": "chair",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "cockpit:prop:1",
          "type": "console",
          "x": 484,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "cockpit:prop:2",
          "type": "chair",
          "x": 718,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "cockpit:prop:3",
          "type": "terminal",
          "x": 967,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "cockpit:prop:4",
          "type": "locker",
          "x": 1186,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "cockpit:prop:5",
          "type": "console",
          "x": 1235,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 374,
          "y": 88
        },
        {
          "id": "b",
          "x": 858,
          "y": 88
        },
        {
          "id": "c",
          "x": 1279,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e13:cockpit",
          "edge": "e13",
          "target": "samson",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e14:cockpit",
          "edge": "e14",
          "target": "landing",
          "kind": "shuttle",
          "x": 1470,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.42,
        "pools": [
          {
            "x": 343,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1139,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e13:cockpit:return:-1",
          "portal": "e13:cockpit",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e13:cockpit:return:1",
          "portal": "e13:cockpit",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e14:cockpit:return:-1",
          "portal": "e14:cockpit",
          "x": 1400,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e14:cockpit:return:1",
          "portal": "e14:cockpit",
          "x": 1528,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction/lieu attesté dans un extrait",
        "layout": "plan original non coté",
        "source": "F02"
      }
    },
    {
      "id": "landing",
      "name": "LV-178 — aire d’atterrissage",
      "zone": "surface",
      "style": "surface",
      "mode": "depth",
      "width": 2800,
      "depth": 180,
      "deck": "L-01",
      "motif": "landing",
      "description": "Plateforme ancrée dans le sable, balises alignées sur les bords, roche en couches au-delà du périmètre.",
      "sourceStatus": "original-layout",
      "ambient": "amb_surface",
      "props": [
        {
          "id": "landing:prop:0",
          "type": "beacon",
          "x": 330,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "landing:prop:1",
          "type": "barrel",
          "x": 868,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "landing:prop:2",
          "type": "pallet",
          "x": 1288,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "landing:prop:3",
          "type": "crate",
          "x": 1736,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "landing:prop:4",
          "type": "beacon",
          "x": 2128,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "landing:prop:5",
          "type": "pipe",
          "x": 2475,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "landing:dressing:0",
          "type": "cable",
          "x": 1190,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "landing:dressing:1",
          "type": "strap",
          "x": 1840,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 672,
          "y": 88
        },
        {
          "id": "b",
          "x": 1540,
          "y": 88
        },
        {
          "id": "c",
          "x": 2296,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e14:landing",
          "edge": "e14",
          "target": "cockpit",
          "kind": "shuttle",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e15:landing",
          "edge": "e15",
          "target": "control",
          "kind": "door",
          "x": 2710,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.66,
        "pools": [
          {
            "x": 616,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 2044,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e14:landing:return:-1",
          "portal": "e14:landing",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e14:landing:return:1",
          "portal": "e14:landing",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e15:landing:return:-1",
          "portal": "e15:landing",
          "x": 2640,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e15:landing:return:1",
          "portal": "e15:landing",
          "x": 2768,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "control",
      "name": "Poste de la concession",
      "zone": "surface",
      "style": "industrial",
      "mode": "depth",
      "width": 2100,
      "depth": 180,
      "deck": "L-02",
      "motif": "control",
      "description": "Salle préfabriquée à double paroi, carte des puits et vestiaire près du sas ; réserve électrique sous abri.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "control:prop:0",
          "type": "terminal",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "control:prop:1",
          "type": "locker",
          "x": 651,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "control:prop:2",
          "type": "workbench",
          "x": 966,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "control:prop:3",
          "type": "chair",
          "x": 1302,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "control:prop:4",
          "type": "generator",
          "x": 1596,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "control:prop:5",
          "type": "rack",
          "x": 1775,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "control:dressing:0",
          "type": "cable",
          "x": 520,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "control:dressing:1",
          "type": "vent",
          "x": 1190,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-control-0",
          "type": "serviceHatch",
          "x": 1460,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0,
          "purpose": "Habillage de mur ; non présentée comme un passage utilisable."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 504,
          "y": 88
        },
        {
          "id": "b",
          "x": 1155,
          "y": 88
        },
        {
          "id": "c",
          "x": 1722,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e15:control",
          "edge": "e15",
          "target": "landing",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e16:control",
          "edge": "e16",
          "target": "stores",
          "kind": "door",
          "x": 2010,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e17:control",
          "edge": "e17",
          "target": "lift_top",
          "kind": "door",
          "x": 735,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 462,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1533,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e15:control:return:-1",
          "portal": "e15:control",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e15:control:return:1",
          "portal": "e15:control",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e16:control:return:-1",
          "portal": "e16:control",
          "x": 1940,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e16:control:return:1",
          "portal": "e16:control",
          "x": 2068,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "stores",
      "name": "Réserve des cellules",
      "zone": "surface",
      "style": "industrial",
      "mode": "depth",
      "width": 2360,
      "depth": 180,
      "deck": "L-03",
      "motif": "cells",
      "description": "Cellules sur berceaux isolés, table de contrôle au fond ; aucun carburant dans le passage de l’ascenseur.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "stores:prop:0",
          "type": "cell",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "stores:prop:1",
          "type": "cell",
          "x": 732,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "stores:prop:2",
          "type": "terminal",
          "x": 1086,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "stores:prop:3",
          "type": "pallet",
          "x": 1463,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "stores:prop:4",
          "type": "cabinet",
          "x": 1794,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "stores:prop:5",
          "type": "serviceTrolley",
          "x": 2080,
          "y": 143,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "movable": "stores-cart",
          "purpose": "Obstacle mobile tenu à deux mains ; position persistante, sans dégâts d’écrasement."
        },
        {
          "id": "v03-stores-0",
          "type": "sampleRack",
          "x": 740,
          "y": 151,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Échantillonnage sur le front de taille."
        },
        {
          "id": "v03-stores-1",
          "type": "cableSpool",
          "x": 1300,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Stock technique réservé aux locaux humains."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 566,
          "y": 88
        },
        {
          "id": "b",
          "x": 1298,
          "y": 88
        },
        {
          "id": "c",
          "x": 1935,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e16:stores",
          "edge": "e16",
          "target": "control",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e29:stores",
          "edge": "e29",
          "target": "lift_east",
          "kind": "lift",
          "x": 2270,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 519,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1723,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e16:stores:return:-1",
          "portal": "e16:stores",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e16:stores:return:1",
          "portal": "e16:stores",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e29:stores:return:-1",
          "portal": "e29:stores",
          "x": 2200,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e29:stores:return:1",
          "portal": "e29:stores",
          "x": 2328,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "lift_top",
      "name": "Puits principal — tête",
      "zone": "surface",
      "style": "industrial",
      "mode": "profile",
      "width": 1700,
      "depth": 180,
      "deck": "L-04",
      "motif": "lift",
      "description": "Cage verticale et guide-câbles. La descente change réellement de salle et de niveau dans la carte.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "lift_top:prop:0",
          "type": "winch",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "lift_top:prop:1",
          "type": "terminal",
          "x": 527,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "lift_top:prop:2",
          "type": "pipe",
          "x": 782,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "lift_top:prop:3",
          "type": "locker",
          "x": 1054,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "lift_top:prop:4",
          "type": "beam",
          "x": 1292,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "lift_top:prop:5",
          "type": "cable",
          "x": 1375,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 408,
          "y": 88
        },
        {
          "id": "b",
          "x": 935,
          "y": 88
        },
        {
          "id": "c",
          "x": 1394,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e17:lift_top",
          "edge": "e17",
          "target": "control",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e18:lift_top",
          "edge": "e18",
          "target": "lift_bottom",
          "kind": "lift",
          "x": 1610,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 374,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1241,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e17:lift_top:return:-1",
          "portal": "e17:lift_top",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e17:lift_top:return:1",
          "portal": "e17:lift_top",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e18:lift_top:return:-1",
          "portal": "e18:lift_top",
          "x": 1540,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e18:lift_top:return:1",
          "portal": "e18:lift_top",
          "x": 1668,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "lift_bottom",
      "name": "Puits principal — fond",
      "zone": "mine",
      "style": "mine",
      "mode": "profile",
      "width": 2020,
      "depth": 180,
      "deck": "M-01",
      "motif": "fall",
      "description": "Cage accidentée au fond, galerie de dégagement en avant ; poussière et faisceaux révèlent une profondeur non jouable.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "lift_bottom:prop:0",
          "type": "debris",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "lift_bottom:prop:1",
          "type": "winch",
          "x": 626,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "lift_bottom:prop:2",
          "type": "rail",
          "x": 929,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "lift_bottom:prop:3",
          "type": "beam",
          "x": 1252,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "lift_bottom:prop:4",
          "type": "pipe",
          "x": 1535,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "lift_bottom:prop:5",
          "type": "toolcart",
          "x": 1695,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 485,
          "y": 88
        },
        {
          "id": "b",
          "x": 1111,
          "y": 88
        },
        {
          "id": "c",
          "x": 1656,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e18:lift_bottom",
          "edge": "e18",
          "target": "lift_top",
          "kind": "lift",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e19:lift_bottom",
          "edge": "e19",
          "target": "haul",
          "kind": "door",
          "x": 1930,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.2,
        "pools": [
          {
            "x": 444,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1475,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e18:lift_bottom:return:-1",
          "portal": "e18:lift_bottom",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e18:lift_bottom:return:1",
          "portal": "e18:lift_bottom",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e19:lift_bottom:return:-1",
          "portal": "e19:lift_bottom",
          "x": 1860,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e19:lift_bottom:return:1",
          "portal": "e19:lift_bottom",
          "x": 1988,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "haul",
      "name": "Galerie de roulage",
      "zone": "mine",
      "style": "mine",
      "mode": "depth",
      "width": 2840,
      "depth": 180,
      "deck": "M-02",
      "motif": "haul",
      "description": "Rails continus dans la même bande, convoyeur au fond, refuges dans des niches balisées.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "haul:prop:0",
          "type": "oreTrolley",
          "x": 790,
          "y": 143,
          "scale": 1,
          "solid": true,
          "variant": 1,
          "movable": "haul-cart",
          "purpose": "Obstacle mobile tenu à deux mains ; position persistante, sans dégâts d’écrasement."
        },
        {
          "id": "haul:prop:1",
          "type": "beam",
          "x": 880,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "haul:prop:2",
          "type": "rail",
          "x": 1306,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "haul:prop:3",
          "type": "ore",
          "x": 1761,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "haul:prop:4",
          "type": "pipe",
          "x": 2158,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "haul:prop:5",
          "type": "crate",
          "x": 2515,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "haul:dressing:0",
          "type": "beam",
          "x": 470,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "haul:dressing:1",
          "type": "cable",
          "x": 1060,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "haul:dressing:2",
          "type": "rail",
          "x": 1860,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "v03-haul-0",
          "type": "cableSpool",
          "x": 1040,
          "y": 153,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Stock technique réservé aux locaux humains."
        },
        {
          "id": "v03-haul-1",
          "type": "sampleRack",
          "x": 2220,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Échantillonnage sur le front de taille."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 682,
          "y": 88
        },
        {
          "id": "b",
          "x": 1562,
          "y": 88
        },
        {
          "id": "c",
          "x": 2329,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e19:haul",
          "edge": "e19",
          "target": "lift_bottom",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e20:haul",
          "edge": "e20",
          "target": "pump",
          "kind": "door",
          "x": 2750,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e21:haul",
          "edge": "e21",
          "target": "refuge",
          "kind": "door",
          "x": 994,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e22:haul",
          "edge": "e22",
          "target": "vein",
          "kind": "door",
          "x": 1505,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-drain-0:a",
          "edge": "oth-annex-drain-0",
          "target": "drain",
          "x": 1136,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-haul-return:haul",
          "edge": "v07-haul-return",
          "target": "return_gallery",
          "x": 1310,
          "y": 5,
          "kind": "door",
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.2,
        "pools": [
          {
            "x": 625,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 2073,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e19:haul:return:-1",
          "portal": "e19:haul",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e19:haul:return:1",
          "portal": "e19:haul",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e20:haul:return:-1",
          "portal": "e20:haul",
          "x": 2680,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e20:haul:return:1",
          "portal": "e20:haul",
          "x": 2808,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-0:a:return:-1",
          "portal": "oth-annex-drain-0:a",
          "x": 1066,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-0:a:return:1",
          "portal": "oth-annex-drain-0:a",
          "x": 1194,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "pump",
      "name": "Station de pompage",
      "zone": "mine",
      "style": "industrial",
      "mode": "depth",
      "width": 2420,
      "depth": 180,
      "deck": "M-03",
      "motif": "pump",
      "description": "Pompes sur socles, caniveaux et passerelles de maintenance ; la purge ferme une conduite identifiée.",
      "sourceStatus": "original-layout",
      "ambient": "amb_industrial",
      "props": [
        {
          "id": "pump:prop:0",
          "type": "pump",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "pump:prop:1",
          "type": "valve",
          "x": 750,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "pump:prop:2",
          "type": "pipe",
          "x": 1113,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "pump:prop:3",
          "type": "barrel",
          "x": 1500,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "pump:prop:4",
          "type": "generator",
          "x": 1839,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "pump:prop:5",
          "type": "terminal",
          "x": 2095,
          "y": 145,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "pump:dressing:0",
          "type": "pipe",
          "x": 920,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "pump:dressing:1",
          "type": "cable",
          "x": 1720,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-pump-0",
          "type": "cableSpool",
          "x": 2130,
          "y": 154,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Stock technique réservé aux locaux humains."
        },
        {
          "id": "v09-pump-cart",
          "type": "serviceTrolley",
          "x": 785,
          "y": 75,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "movable": "pump-cart",
          "purpose": "Obstacle mobile tenu à deux mains ; position persistante, sans dégâts d’écrasement."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 581,
          "y": 88
        },
        {
          "id": "b",
          "x": 1331,
          "y": 88
        },
        {
          "id": "c",
          "x": 1984,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e20:pump",
          "edge": "e20",
          "target": "haul",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e32:pump",
          "edge": "e32",
          "target": "vein",
          "kind": "door",
          "x": 2330,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-drain-1:a",
          "edge": "oth-annex-drain-1",
          "target": "drain",
          "x": 968,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 532,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1767,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e20:pump:return:-1",
          "portal": "e20:pump",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e20:pump:return:1",
          "portal": "e20:pump",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e32:pump:return:-1",
          "portal": "e32:pump",
          "x": 2260,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e32:pump:return:1",
          "portal": "e32:pump",
          "x": 2388,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-1:a:return:-1",
          "portal": "oth-annex-drain-1:a",
          "x": 898,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-1:a:return:1",
          "portal": "oth-annex-drain-1:a",
          "x": 1026,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "refuge",
      "name": "Abri des mineurs",
      "zone": "mine",
      "style": "mine",
      "mode": "depth",
      "width": 1800,
      "depth": 180,
      "deck": "M-04",
      "motif": "refuge",
      "description": "Bancs, casiers et bouteilles de secours. Alcôve calme facultative, distincte d’une sortie de mission.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "refuge:prop:0",
          "type": "bench",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "refuge:prop:1",
          "type": "locker",
          "x": 558,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "refuge:prop:2",
          "type": "cabinet",
          "x": 828,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "refuge:prop:3",
          "type": "barrel",
          "x": 1116,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "refuge:prop:4",
          "type": "terminal",
          "x": 1368,
          "y": 18,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "refuge:prop:5",
          "type": "extinguisher",
          "x": 1475,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 432,
          "y": 88
        },
        {
          "id": "b",
          "x": 990,
          "y": 88
        },
        {
          "id": "c",
          "x": 1476,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e21:refuge",
          "edge": "e21",
          "target": "haul",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.2,
        "pools": [
          {
            "x": 396,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1314,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e21:refuge:return:-1",
          "portal": "e21:refuge",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e21:refuge:return:1",
          "portal": "e21:refuge",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "vein",
      "name": "Front de trimonite",
      "zone": "mine",
      "style": "mine",
      "mode": "depth",
      "width": 2660,
      "depth": 180,
      "deck": "M-05",
      "motif": "ore",
      "description": "Foreuse arrêtée face au front de taille ; minerai uniquement dans la roche ou les bennes, pas en loot flottant.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "vein:prop:0",
          "type": "drill",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "vein:prop:1",
          "type": "ore",
          "x": 825,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "vein:prop:2",
          "type": "minecart",
          "x": 1224,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "vein:prop:3",
          "type": "beam",
          "x": 1649,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "vein:prop:4",
          "type": "rail",
          "x": 2022,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "vein:prop:5",
          "type": "terminal",
          "x": 2335,
          "y": 145,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "vein:dressing:0",
          "type": "beam",
          "x": 650,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "vein:dressing:1",
          "type": "rail",
          "x": 1450,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-vein-0",
          "type": "sampleRack",
          "x": 2040,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Échantillonnage sur le front de taille."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 638,
          "y": 88
        },
        {
          "id": "b",
          "x": 1463,
          "y": 88
        },
        {
          "id": "c",
          "x": 2181,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e22:vein",
          "edge": "e22",
          "target": "haul",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e23:vein",
          "edge": "e23",
          "target": "fissure",
          "kind": "door",
          "x": 2570,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e32:vein",
          "edge": "e32",
          "target": "pump",
          "kind": "door",
          "x": 931,
          "y": 5,
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "service-mine:vein",
          "edge": "service-mine",
          "target": "drain",
          "kind": "door",
          "x": 370,
          "y": 88,
          "repair": "repair-mine",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-exchange-vein:vein",
          "edge": "v07-exchange-vein",
          "target": "exchanger",
          "x": 2370,
          "y": 5,
          "kind": "door",
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.2,
        "pools": [
          {
            "x": 585,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1942,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e22:vein:return:-1",
          "portal": "e22:vein",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e22:vein:return:1",
          "portal": "e22:vein",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e23:vein:return:-1",
          "portal": "e23:vein",
          "x": 2500,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e23:vein:return:1",
          "portal": "e23:vein",
          "x": 2628,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-mine:vein:return:-1",
          "portal": "service-mine:vein",
          "x": 300,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-mine:vein:return:1",
          "portal": "service-mine:vein",
          "x": 428,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "fissure",
      "name": "Faille d’accès",
      "zone": "mine",
      "style": "cavern",
      "mode": "profile",
      "width": 2120,
      "depth": 180,
      "deck": "M-06",
      "motif": "threshold",
      "description": "Les étais humains s’arrêtent avant une coque étrangère. Passage bas qui oblige à réduire le bruit.",
      "sourceStatus": "original-layout",
      "ambient": "amb_cavern",
      "props": [
        {
          "id": "fissure:prop:0",
          "type": "beam",
          "x": 330,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "fissure:prop:1",
          "type": "ore",
          "x": 657,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "fissure:prop:2",
          "type": "rock",
          "x": 975,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "fissure:prop:3",
          "type": "debris",
          "x": 1314,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "fissure:prop:4",
          "type": "rock",
          "x": 1611,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "fissure:prop:5",
          "type": "beacon",
          "x": 1795,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 509,
          "y": 88
        },
        {
          "id": "b",
          "x": 1166,
          "y": 88
        },
        {
          "id": "c",
          "x": 1738,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e23:fissure",
          "edge": "e23",
          "target": "vein",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e24:fissure",
          "edge": "e24",
          "target": "vestibule",
          "kind": "door",
          "x": 2030,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.16,
        "pools": [
          {
            "x": 1018,
            "y": 60,
            "radius": 280,
            "strength": 0.25
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e23:fissure:return:-1",
          "portal": "e23:fissure",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e23:fissure:return:1",
          "portal": "e23:fissure",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e24:fissure:return:-1",
          "portal": "e24:fissure",
          "x": 1960,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e24:fissure:return:1",
          "portal": "e24:fissure",
          "x": 2088,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "vestibule",
      "name": "Épave enfouie — seuil",
      "zone": "derelict",
      "style": "derelict",
      "mode": "depth",
      "width": 2580,
      "depth": 180,
      "deck": "D-01",
      "motif": "alien",
      "description": "Architecture étrangère à nervures asymétriques ; aucune console humaine ne pousse dans la coque.",
      "sourceStatus": "original-layout",
      "ambient": "amb_derelict",
      "props": [
        {
          "id": "vestibule:prop:0",
          "type": "rib",
          "x": 330,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "vestibule:prop:1",
          "type": "resin",
          "x": 800,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "vestibule:prop:2",
          "type": "rock",
          "x": 1187,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "vestibule:prop:3",
          "type": "rib",
          "x": 1600,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "vestibule:prop:4",
          "type": "fossil",
          "x": 1961,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "vestibule:prop:5",
          "type": "resin",
          "x": 2255,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "v03-vestibule-0",
          "type": "bioTendrils",
          "x": 630,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Masse organique contre le fond ; aucun tuyau industriel."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 619,
          "y": 88
        },
        {
          "id": "b",
          "x": 1419,
          "y": 88
        },
        {
          "id": "c",
          "x": 2116,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e24:vestibule",
          "edge": "e24",
          "target": "fissure",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e25:vestibule",
          "edge": "e25",
          "target": "fossils",
          "kind": "door",
          "x": 2490,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.14,
        "pools": [
          {
            "x": 1238,
            "y": 60,
            "radius": 280,
            "strength": 0.25
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e24:vestibule:return:-1",
          "portal": "e24:vestibule",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e24:vestibule:return:1",
          "portal": "e24:vestibule",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e25:vestibule:return:-1",
          "portal": "e25:vestibule",
          "x": 2420,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e25:vestibule:return:1",
          "portal": "e25:vestibule",
          "x": 2548,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "fossils",
      "name": "Chambre des vestiges",
      "zone": "derelict",
      "style": "derelict",
      "mode": "depth",
      "width": 2400,
      "depth": 180,
      "deck": "D-02",
      "motif": "fossils",
      "description": "Restes fossilisés de constructeurs inconnus. La forme est une interprétation, pas un modèle officiel.",
      "sourceStatus": "original-layout",
      "ambient": "amb_derelict",
      "props": [
        {
          "id": "fossils:prop:0",
          "type": "fossil",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "fossils:prop:1",
          "type": "rib",
          "x": 744,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "fossils:prop:2",
          "type": "resin",
          "x": 1104,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "fossils:prop:3",
          "type": "rock",
          "x": 1488,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "fossils:prop:4",
          "type": "fossil",
          "x": 1824,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "fossils:prop:5",
          "type": "rib",
          "x": 2075,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "fossils:dressing:0",
          "type": "rib",
          "x": 520,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "fossils:dressing:1",
          "type": "resin",
          "x": 970,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-fossils-0",
          "type": "bioTendrils",
          "x": 840,
          "y": 156,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Masse organique contre le fond ; aucun tuyau industriel."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 576,
          "y": 88
        },
        {
          "id": "b",
          "x": 1320,
          "y": 88
        },
        {
          "id": "c",
          "x": 1968,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e25:fossils",
          "edge": "e25",
          "target": "vestibule",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e26:fossils",
          "edge": "e26",
          "target": "eggs",
          "kind": "door",
          "x": 2310,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-alcove-0:a",
          "edge": "oth-annex-alcove-0",
          "target": "alcove",
          "x": 960,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.14,
        "pools": [
          {
            "x": 1152,
            "y": 60,
            "radius": 280,
            "strength": 0.25
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e25:fossils:return:-1",
          "portal": "e25:fossils",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e25:fossils:return:1",
          "portal": "e25:fossils",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e26:fossils:return:-1",
          "portal": "e26:fossils",
          "x": 2240,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e26:fossils:return:1",
          "portal": "e26:fossils",
          "x": 2368,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-0:a:return:-1",
          "portal": "oth-annex-alcove-0:a",
          "x": 890,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-0:a:return:1",
          "portal": "oth-annex-alcove-0:a",
          "x": 1018,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "eggs",
      "name": "Chambre d’incubation",
      "zone": "derelict",
      "style": "hive",
      "mode": "depth",
      "width": 2860,
      "depth": 180,
      "deck": "D-03",
      "motif": "eggs",
      "description": "Œufs placés dans des niches, résine sur supports ; un chemin lisible les contourne sans imposer une extermination.",
      "sourceStatus": "original-layout",
      "ambient": "amb_hive",
      "props": [
        {
          "id": "eggs:prop:0",
          "type": "egg",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "eggs:prop:1",
          "type": "resin",
          "x": 887,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "eggs:prop:2",
          "type": "egg",
          "x": 1316,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "eggs:prop:3",
          "type": "rib",
          "x": 1773,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "eggs:prop:4",
          "type": "egg",
          "x": 2174,
          "y": 18,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "eggs:prop:5",
          "type": "resin",
          "x": 2535,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "eggs:dressing:0",
          "type": "rib",
          "x": 590,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "eggs:dressing:1",
          "type": "rib",
          "x": 2000,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-eggs-0",
          "type": "bioTendrils",
          "x": 1990,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Masse organique contre le fond ; aucun tuyau industriel."
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 686,
          "y": 88
        },
        {
          "id": "b",
          "x": 1573,
          "y": 88
        },
        {
          "id": "c",
          "x": 2345,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e26:eggs",
          "edge": "e26",
          "target": "fossils",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e27:eggs",
          "edge": "e27",
          "target": "bypass",
          "kind": "door",
          "x": 2770,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.12,
        "pools": [
          {
            "x": 1373,
            "y": 60,
            "radius": 280,
            "strength": 0.25
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e26:eggs:return:-1",
          "portal": "e26:eggs",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e26:eggs:return:1",
          "portal": "e26:eggs",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e27:eggs:return:-1",
          "portal": "e27:eggs",
          "x": 2700,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e27:eggs:return:1",
          "portal": "e27:eggs",
          "x": 2828,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "bypass",
      "name": "Suture de la coque",
      "zone": "derelict",
      "style": "hive",
      "mode": "profile",
      "width": 2200,
      "depth": 180,
      "deck": "D-04",
      "motif": "escape",
      "description": "Chemin latéral étroit entre deux nervures, plan profond réservé aux silhouettes, sans ennemis touchables hors plan.",
      "sourceStatus": "original-layout",
      "ambient": "amb_hive",
      "props": [
        {
          "id": "bypass:prop:0",
          "type": "rib",
          "x": 330,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "bypass:prop:1",
          "type": "resin",
          "x": 682,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "bypass:prop:2",
          "type": "rock",
          "x": 1012,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "bypass:prop:3",
          "type": "egg",
          "x": 1364,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "bypass:prop:4",
          "type": "rib",
          "x": 1672,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "bypass:prop:5",
          "type": "resin",
          "x": 1875,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "bypass:dressing:0",
          "type": "rib",
          "x": 890,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "bypass:dressing:1",
          "type": "rib",
          "x": 1510,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 528,
          "y": 88
        },
        {
          "id": "b",
          "x": 1210,
          "y": 88
        },
        {
          "id": "c",
          "x": 1804,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e27:bypass",
          "edge": "e27",
          "target": "eggs",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e28:bypass",
          "edge": "e28",
          "target": "lift_east",
          "kind": "door",
          "x": 2110,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-alcove-1:a",
          "edge": "oth-annex-alcove-1",
          "target": "alcove",
          "x": 880,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.12,
        "pools": [
          {
            "x": 1056,
            "y": 60,
            "radius": 280,
            "strength": 0.25
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e27:bypass:return:-1",
          "portal": "e27:bypass",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e27:bypass:return:1",
          "portal": "e27:bypass",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e28:bypass:return:-1",
          "portal": "e28:bypass",
          "x": 2040,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e28:bypass:return:1",
          "portal": "e28:bypass",
          "x": 2168,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-1:a:return:-1",
          "portal": "oth-annex-alcove-1:a",
          "x": 810,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-1:a:return:1",
          "portal": "oth-annex-alcove-1:a",
          "x": 938,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "lift_east",
      "name": "Puits secondaire — cage",
      "zone": "mine",
      "style": "mine",
      "mode": "profile",
      "width": 1960,
      "depth": 180,
      "deck": "M-07",
      "motif": "ascent",
      "description": "Sortie par cage distincte du puits saboté ; rails, treuil et câbles sont raccordés au plafond.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "lift_east:prop:0",
          "type": "winch",
          "x": 330,
          "y": 16,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "lift_east:prop:1",
          "type": "beam",
          "x": 608,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "lift_east:prop:2",
          "type": "rail",
          "x": 902,
          "y": 150,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "lift_east:prop:3",
          "type": "terminal",
          "x": 1215,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "lift_east:prop:4",
          "type": "pipe",
          "x": 1490,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "lift_east:prop:5",
          "type": "crate",
          "x": 1635,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 470,
          "y": 88
        },
        {
          "id": "b",
          "x": 1078,
          "y": 88
        },
        {
          "id": "c",
          "x": 1607,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e28:lift_east",
          "edge": "e28",
          "target": "bypass",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e29:lift_east",
          "edge": "e29",
          "target": "stores",
          "kind": "lift",
          "x": 1870,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.2,
        "pools": [
          {
            "x": 431,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1431,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e28:lift_east:return:-1",
          "portal": "e28:lift_east",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e28:lift_east:return:1",
          "portal": "e28:lift_east",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e29:lift_east:return:-1",
          "portal": "e29:lift_east",
          "x": 1800,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e29:lift_east:return:1",
          "portal": "e29:lift_east",
          "x": 1928,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "hold",
      "name": "Soute de quarantaine",
      "zone": "marion",
      "style": "wreck",
      "mode": "depth",
      "width": 2600,
      "depth": 180,
      "deck": "C-04",
      "motif": "quarantine",
      "description": "Cloisons coupe-feu et compartiment de fret. Le dernier danger ne réapparaît pas après son confinement.",
      "sourceStatus": "original-layout",
      "ambient": "amb_wreck",
      "props": [
        {
          "id": "hold:prop:0",
          "type": "crate",
          "x": 330,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "hold:prop:1",
          "type": "barrel",
          "x": 806,
          "y": 150,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "hold:prop:2",
          "type": "oreTrolley",
          "x": 1080,
          "y": 143,
          "scale": 1,
          "solid": true,
          "variant": 1,
          "movable": "hold-cart",
          "purpose": "Obstacle mobile tenu à deux mains ; position persistante, sans dégâts d’écrasement."
        },
        {
          "id": "hold:prop:3",
          "type": "pipe",
          "x": 1612,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "hold:prop:4",
          "type": "debris",
          "x": 1976,
          "y": 18,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "hold:prop:5",
          "type": "terminal",
          "x": 2275,
          "y": 145,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 624,
          "y": 88
        },
        {
          "id": "b",
          "x": 1430,
          "y": 88
        },
        {
          "id": "c",
          "x": 2132,
          "y": 88
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "e30:hold",
          "edge": "e30",
          "target": "hangar",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "e31:hold",
          "edge": "e31",
          "target": "medical",
          "kind": "door",
          "x": 2510,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.24,
        "pools": [
          {
            "x": 572,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1898,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "e30:hold:return:-1",
          "portal": "e30:hold",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e30:hold:return:1",
          "portal": "e30:hold",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e31:hold:return:-1",
          "portal": "e31:hold",
          "x": 2440,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e31:hold:return:1",
          "portal": "e31:hold",
          "x": 2568,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "rec",
      "name": "BeeBee’s — carré de repos",
      "zone": "marion",
      "style": "industrial",
      "mode": "depth",
      "width": 1780,
      "depth": 180,
      "deck": "B-03",
      "motif": "recreation",
      "description": "Le comptoir, les tables et le passe-plats laissent une allée centrale. Deux accès rejoignent la coursive et l’atelier.",
      "sourceStatus": "original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "rec:prop:0",
          "type": "bench",
          "x": 430,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "rec:prop:1",
          "type": "console",
          "x": 720,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "rec:prop:2",
          "type": "cabinet",
          "x": 1050,
          "y": 155,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "rec:prop:3",
          "type": "terminal",
          "x": 1390,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 3
        },
        {
          "id": "rec:dressing:0",
          "type": "cable",
          "x": 950,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "rec:dressing:1",
          "type": "vent",
          "x": 1250,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "oth-annex-rec-0:b",
          "edge": "oth-annex-rec-0",
          "target": "junction",
          "x": 110,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-rec-1:b",
          "edge": "oth-annex-rec-1",
          "target": "workshop",
          "x": 1670,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "service-medical:rec",
          "edge": "service-medical",
          "target": "medical",
          "kind": "door",
          "x": 925,
          "y": 88,
          "repair": "repair-medical",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 392,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1299,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "oth-annex-rec-0:b:return:-1",
          "portal": "oth-annex-rec-0:b",
          "x": 40,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-0:b:return:1",
          "portal": "oth-annex-rec-0:b",
          "x": 168,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-1:b:return:-1",
          "portal": "oth-annex-rec-1:b",
          "x": 1600,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-rec-1:b:return:1",
          "portal": "oth-annex-rec-1:b",
          "x": 1728,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-medical:rec:return:-1",
          "portal": "service-medical:rec",
          "x": 855,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-medical:rec:return:1",
          "portal": "service-medical:rec",
          "x": 983,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction ou subdivision reconstruite ; attestation individuelle non établie par les extraits retenus",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "maintenance",
      "name": "Galerie des auxiliaires",
      "zone": "marion",
      "style": "industrial",
      "mode": "profile",
      "width": 1840,
      "depth": 180,
      "deck": "C-04",
      "motif": "auxiliary",
      "description": "Un chemin technique relie la machinerie à la baie des serveurs. Le collecteur possède une vanne locale et une fuite temporisée.",
      "sourceStatus": "original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "maintenance:prop:0",
          "type": "generator",
          "x": 390,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "maintenance:prop:1",
          "type": "pipe",
          "x": 790,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "maintenance:prop:2",
          "type": "rack",
          "x": 1240,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "maintenance:prop:3",
          "type": "valve",
          "x": 1580,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 3
        },
        {
          "id": "maintenance:dressing:0",
          "type": "cable",
          "x": 520,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "maintenance:dressing:1",
          "type": "vent",
          "x": 1020,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-maintenance-0",
          "type": "serviceHatch",
          "x": 1200,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0,
          "purpose": "Habillage de mur ; non présentée comme un passage utilisable."
        }
      ],
      "nodes": [],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "oth-annex-maintenance-0:b",
          "edge": "oth-annex-maintenance-0",
          "target": "engineering",
          "x": 110,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-maintenance-1:b",
          "edge": "oth-annex-maintenance-1",
          "target": "server",
          "x": 1730,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 405,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1343,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "oth-annex-maintenance-0:b:return:-1",
          "portal": "oth-annex-maintenance-0:b",
          "x": 40,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-0:b:return:1",
          "portal": "oth-annex-maintenance-0:b",
          "x": 168,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-1:b:return:-1",
          "portal": "oth-annex-maintenance-1:b",
          "x": 1660,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-maintenance-1:b:return:1",
          "portal": "oth-annex-maintenance-1:b",
          "x": 1788,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "drain",
      "name": "Canal de décantation",
      "zone": "mine",
      "style": "mine",
      "mode": "depth",
      "width": 2200,
      "depth": 180,
      "deck": "M-02B",
      "motif": "drain",
      "description": "Une dérivation humide relie le roulage au pompage. Le passage avant contourne les conduites sous pression.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "drain:prop:0",
          "type": "pump",
          "x": 390,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "drain:prop:1",
          "type": "pipe",
          "x": 810,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "drain:prop:2",
          "type": "minecart",
          "x": 1340,
          "y": 160,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "drain:prop:3",
          "type": "terminal",
          "x": 1820,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 3
        },
        {
          "id": "drain:dressing:0",
          "type": "rail",
          "x": 1060,
          "y": 165,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "drain:dressing:1",
          "type": "beam",
          "x": 1710,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        }
      ],
      "nodes": [],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "oth-annex-drain-0:b",
          "edge": "oth-annex-drain-0",
          "target": "haul",
          "x": 110,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-drain-1:b",
          "edge": "oth-annex-drain-1",
          "target": "pump",
          "x": 2090,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "service-mine:drain",
          "edge": "service-mine",
          "target": "vein",
          "kind": "door",
          "x": 395,
          "y": 88,
          "repair": "repair-mine",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.2,
        "pools": [
          {
            "x": 484,
            "y": 90,
            "radius": 300,
            "strength": 0.5
          },
          {
            "x": 1606,
            "y": 90,
            "radius": 330,
            "strength": 0.5
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "oth-annex-drain-0:b:return:-1",
          "portal": "oth-annex-drain-0:b",
          "x": 40,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-0:b:return:1",
          "portal": "oth-annex-drain-0:b",
          "x": 168,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-1:b:return:-1",
          "portal": "oth-annex-drain-1:b",
          "x": 2020,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-drain-1:b:return:1",
          "portal": "oth-annex-drain-1:b",
          "x": 2148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-mine:drain:return:-1",
          "portal": "service-mine:drain",
          "x": 325,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "service-mine:drain:return:1",
          "portal": "service-mine:drain",
          "x": 453,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "alcove",
      "name": "Alcôve des vestiges",
      "zone": "derelict",
      "style": "derelict",
      "mode": "depth",
      "width": 1940,
      "depth": 180,
      "deck": "X-03B",
      "motif": "alcove",
      "description": "Un renfoncement derrière les structures costales. Une ouverture rejoint le contournement ; aucune installation humaine dans la paroi.",
      "sourceStatus": "original-layout",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "alcove:prop:0",
          "type": "fossil",
          "x": 360,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "alcove:prop:1",
          "type": "rib",
          "x": 760,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "alcove:prop:2",
          "type": "resin",
          "x": 1190,
          "y": 155,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "alcove:prop:3",
          "type": "rock",
          "x": 1560,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 3
        },
        {
          "id": "alcove:dressing:0",
          "type": "rib",
          "x": 590,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "alcove:dressing:1",
          "type": "resin",
          "x": 1460,
          "y": 166,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "v03-alcove-0",
          "type": "bioTendrils",
          "x": 850,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0,
          "purpose": "Masse organique contre le fond ; aucun tuyau industriel."
        }
      ],
      "nodes": [],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "artNotes": "Fond dès y=0 du champ de jeu ; le HUD occupe une bande extérieure. Tri des objets et acteurs par le pied, avant-plans translucides près du joueur.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "portals": [
        {
          "id": "oth-annex-alcove-0:b",
          "edge": "oth-annex-alcove-0",
          "target": "fossils",
          "x": 110,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "oth-annex-alcove-1:b",
          "edge": "oth-annex-alcove-1",
          "target": "bypass",
          "x": 1830,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": true,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.14,
        "pools": [
          {
            "x": 931,
            "y": 60,
            "radius": 280,
            "strength": 0.25
          }
        ]
      },
      "designV03": {
        "circulation": "Axe y=88 conservé. Les ajouts solides occupent les bandes de stockage, pas les seuils.",
        "light": "L’éclairage est calculé aux mêmes coordonnées que les faisceaux visibles.",
        "navigation": "Même empreinte de collision pour joueur, accompagnant et menace ; contournement par points de passage.",
        "fog": "Les noms et les liaisons du plan restent masqués jusqu’à observation du seuil ou visite."
      },
      "walls": [
        {
          "id": "oth-annex-alcove-0:b:return:-1",
          "portal": "oth-annex-alcove-0:b",
          "x": 40,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-0:b:return:1",
          "portal": "oth-annex-alcove-0:b",
          "x": 168,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-1:b:return:-1",
          "portal": "oth-annex-alcove-1:b",
          "x": 1760,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "oth-annex-alcove-1:b:return:1",
          "portal": "oth-annex-alcove-1:b",
          "x": 1888,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "return_gallery",
      "name": "Galerie de retour",
      "zone": "mine",
      "style": "mine",
      "mode": "depth",
      "width": 1980,
      "depth": 180,
      "deck": "M-11",
      "motif": "return",
      "description": "Une conduite rompue remplit le caniveau de retour. La coursive arrière reste praticable ; au premier plan, les pas brassent une eau chargée de poussière.",
      "sourceStatus": "original-layout-v07",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "return_gallery:v07:0",
          "type": "beam",
          "x": 300,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "return_gallery:v07:1",
          "type": "pipe",
          "x": 550,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "return_gallery:v07:2",
          "type": "barrel",
          "x": 650,
          "y": 165,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "return_gallery:v07:3",
          "type": "cableSpool",
          "x": 820,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "return_gallery:v07:4",
          "type": "beam",
          "x": 1110,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "return_gallery:v07:5",
          "type": "pipe",
          "x": 1340,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "return_gallery:v07:6",
          "type": "minecart",
          "x": 1640,
          "y": 14,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "return_gallery:v07:7",
          "type": "ore",
          "x": 1740,
          "y": 163,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "return_gallery:v07:8",
          "type": "portableLamp",
          "x": 920,
          "y": 155,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "return_gallery:v07:9",
          "type": "rail",
          "x": 1460,
          "y": 170,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "return_gallery:v07:10",
          "type": "vent",
          "x": 720,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "return_gallery:v07:11",
          "type": "crate",
          "x": 1760,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        }
      ],
      "nodes": [],
      "portals": [
        {
          "id": "v07-haul-return:return_gallery",
          "edge": "v07-haul-return",
          "target": "haul",
          "x": 90,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-return-exchange:return_gallery",
          "edge": "v07-return-exchange",
          "target": "exchanger",
          "x": 1890,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-return-survey:return_gallery",
          "edge": "v07-return-survey",
          "target": "survey",
          "x": 1200,
          "y": 5,
          "kind": "door",
          "mount": {
            "type": "rear-wall",
            "organic": false,
            "depth": 0,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "lighting": {
        "ambient": 0.23,
        "pools": [
          {
            "x": 500,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          },
          {
            "x": 1470,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          }
        ]
      },
      "artNotes": "Plan original V0.7. Bandes avant/arrière habillées, pas de fond unique collé. Eau rendue aux coordonnées du caniveau. Le pied du joueur détermine le tri.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "v07-haul-return:return_gallery:return:-1",
          "portal": "v07-haul-return:return_gallery",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-haul-return:return_gallery:return:1",
          "portal": "v07-haul-return:return_gallery",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-return-exchange:return_gallery:return:-1",
          "portal": "v07-return-exchange:return_gallery",
          "x": 1820,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-return-exchange:return_gallery:return:1",
          "portal": "v07-return-exchange:return_gallery",
          "x": 1948,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "exchanger",
      "name": "Salle des échangeurs",
      "zone": "mine",
      "style": "industrial",
      "mode": "depth",
      "width": 2240,
      "depth": 180,
      "deck": "M-12",
      "motif": "exchange",
      "description": "Deux échangeurs occupent les bandes de stockage. Les commandes restent sur la passerelle ; le caniveau inondé descend au premier plan. Le témoin de pompage mesure le cycle réel.",
      "sourceStatus": "original-layout-v07",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "exchanger:v07:0",
          "type": "pump",
          "x": 340,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "exchanger:v07:1",
          "type": "generator",
          "x": 730,
          "y": 14,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "exchanger:v07:2",
          "type": "pipe",
          "x": 910,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "exchanger:v07:3",
          "type": "barrel",
          "x": 530,
          "y": 165,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "exchanger:v07:4",
          "type": "pump",
          "x": 1490,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "exchanger:v07:5",
          "type": "pipe",
          "x": 1760,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "exchanger:v07:6",
          "type": "valve",
          "x": 1590,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "exchanger:v07:7",
          "type": "workbench",
          "x": 1840,
          "y": 14,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "exchanger:v07:8",
          "type": "cableSpool",
          "x": 970,
          "y": 162,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "exchanger:v07:9",
          "type": "beam",
          "x": 160,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "exchanger:v07:10",
          "type": "beam",
          "x": 2090,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "exchanger:v07:11",
          "type": "extinguisher",
          "x": 2010,
          "y": 14,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "v09-exchanger-cart",
          "type": "oreTrolley",
          "x": 1350,
          "y": 135,
          "scale": 1,
          "solid": true,
          "variant": 1,
          "movable": "exchanger-cart",
          "purpose": "Obstacle mobile tenu à deux mains ; position persistante, sans dégâts d’écrasement."
        }
      ],
      "nodes": [],
      "portals": [
        {
          "id": "v07-return-exchange:exchanger",
          "edge": "v07-return-exchange",
          "target": "return_gallery",
          "x": 90,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-exchange-vein:exchanger",
          "edge": "v07-exchange-vein",
          "target": "vein",
          "x": 2150,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-store-exchange:exchanger",
          "edge": "v07-store-exchange",
          "target": "specimen_store",
          "x": 1820,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "service-vestibule",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "lighting": {
        "ambient": 0.3,
        "pools": [
          {
            "x": 500,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          },
          {
            "x": 1730,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          }
        ]
      },
      "artNotes": "Plan original V0.7. Bandes avant/arrière habillées, pas de fond unique collé. Eau rendue aux coordonnées du caniveau. Le pied du joueur détermine le tri.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "v07-return-exchange:exchanger:return:-1",
          "portal": "v07-return-exchange:exchanger",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-return-exchange:exchanger:return:1",
          "portal": "v07-return-exchange:exchanger",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-exchange-vein:exchanger:return:-1",
          "portal": "v07-exchange-vein:exchanger",
          "x": 2080,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-exchange-vein:exchanger:return:1",
          "portal": "v07-exchange-vein:exchanger",
          "x": 2208,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-store-exchange:exchanger:return:-1",
          "portal": "v07-store-exchange:exchanger",
          "x": 1750,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-store-exchange:exchanger:return:1",
          "portal": "v07-store-exchange:exchanger",
          "x": 1878,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "survey",
      "name": "Poste de relevé",
      "zone": "mine",
      "style": "server",
      "mode": "profile",
      "width": 1810,
      "depth": 180,
      "deck": "M-13",
      "motif": "survey",
      "description": "Un poste étroit isolé du bruit des pompes : écrans de niveaux, chemin de câbles et console d’enregistrement. Le lecteur reçoit un boîtier récupéré, pas un téléchargement à distance.",
      "sourceStatus": "original-layout-v07",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "survey:v07:0",
          "type": "rack",
          "x": 320,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "survey:v07:1",
          "type": "console",
          "x": 650,
          "y": 14,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "survey:v07:2",
          "type": "chair",
          "x": 730,
          "y": 160,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "survey:v07:3",
          "type": "terminal",
          "x": 1030,
          "y": 14,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "survey:v07:4",
          "type": "cable",
          "x": 860,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "survey:v07:5",
          "type": "cabinet",
          "x": 1300,
          "y": 160,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "survey:v07:6",
          "type": "rack",
          "x": 1500,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "survey:v07:7",
          "type": "pipe",
          "x": 480,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "survey:v07:8",
          "type": "vent",
          "x": 1190,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "survey:v07:9",
          "type": "bench",
          "x": 400,
          "y": 162,
          "scale": 1,
          "solid": false,
          "variant": 0
        }
      ],
      "nodes": [],
      "portals": [
        {
          "id": "v07-return-survey:survey",
          "edge": "v07-return-survey",
          "target": "return_gallery",
          "x": 90,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-survey-store:survey",
          "edge": "v07-survey-store",
          "target": "specimen_store",
          "x": 1720,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "lighting": {
        "ambient": 0.3,
        "pools": [
          {
            "x": 500,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          },
          {
            "x": 1300,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          }
        ]
      },
      "artNotes": "Plan original V0.7. Bandes avant/arrière habillées, pas de fond unique collé. Eau rendue aux coordonnées du caniveau. Le pied du joueur détermine le tri.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "v07-return-survey:survey:return:-1",
          "portal": "v07-return-survey:survey",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-return-survey:survey:return:1",
          "portal": "v07-return-survey:survey",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-survey-store:survey:return:-1",
          "portal": "v07-survey-store:survey",
          "x": 1650,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-survey-store:survey:return:1",
          "portal": "v07-survey-store:survey",
          "x": 1778,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "specimen_store",
      "name": "Réserve des prélèvements",
      "zone": "mine",
      "style": "industrial",
      "mode": "depth",
      "width": 1990,
      "depth": 180,
      "deck": "M-14",
      "motif": "samples",
      "description": "Des carottes minérales sous verre et une armoire d’enregistreurs. Aucun œuf extraterrestre n’y est exposé. L’armoire isolée reste verrouillée jusqu’au retour d’un niveau sec.",
      "sourceStatus": "original-layout-v07",
      "ambient": "amb_mine",
      "props": [
        {
          "id": "specimen_store:v07:0",
          "type": "sampleRack",
          "x": 330,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "specimen_store:v07:1",
          "type": "sampleRack",
          "x": 650,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "specimen_store:v07:2",
          "type": "sampleRack",
          "x": 1040,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "specimen_store:v07:3",
          "type": "sampleRack",
          "x": 1470,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "specimen_store:v07:4",
          "type": "cabinet",
          "x": 1180,
          "y": 162,
          "scale": 1,
          "solid": true,
          "variant": 1
        },
        {
          "id": "specimen_store:v07:5",
          "type": "crate",
          "x": 1630,
          "y": 165,
          "scale": 1,
          "solid": true,
          "variant": 2
        },
        {
          "id": "specimen_store:v07:6",
          "type": "pallet",
          "x": 730,
          "y": 164,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "specimen_store:v07:7",
          "type": "cable",
          "x": 1750,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "specimen_store:v07:8",
          "type": "portableLamp",
          "x": 930,
          "y": 14,
          "scale": 1,
          "solid": false,
          "variant": 2
        },
        {
          "id": "specimen_store:v07:9",
          "type": "barrel",
          "x": 1780,
          "y": 13,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "specimen_store:v07:10",
          "type": "vent",
          "x": 1370,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 1
        },
        {
          "id": "specimen_store:v07:11",
          "type": "beam",
          "x": 550,
          "y": 8,
          "scale": 1,
          "solid": false,
          "variant": 2
        }
      ],
      "nodes": [],
      "portals": [
        {
          "id": "v07-survey-store:specimen_store",
          "edge": "v07-survey-store",
          "target": "survey",
          "x": 90,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v07-store-exchange:specimen_store",
          "edge": "v07-store-exchange",
          "target": "exchanger",
          "x": 1900,
          "y": 88,
          "kind": "door",
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "parallax": [
        {
          "layer": "far",
          "factor": 0.08
        },
        {
          "layer": "structure",
          "factor": 0.32
        },
        {
          "layer": "wall",
          "factor": 0.7
        },
        {
          "layer": "floor-and-actors",
          "factor": 1
        },
        {
          "layer": "foreground",
          "factor": 1.12
        }
      ],
      "lighting": {
        "ambient": 0.3,
        "pools": [
          {
            "x": 500,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          },
          {
            "x": 1480,
            "y": 88,
            "radius": 330,
            "strength": 0.48
          }
        ]
      },
      "artNotes": "Plan original V0.7. Bandes avant/arrière habillées, pas de fond unique collé. Eau rendue aux coordonnées du caniveau. Le pied du joueur détermine le tri.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "v07-survey-store:specimen_store:return:-1",
          "portal": "v07-survey-store:specimen_store",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-survey-store:specimen_store:return:1",
          "portal": "v07-survey-store:specimen_store",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-store-exchange:specimen_store:return:-1",
          "portal": "v07-store-exchange:specimen_store",
          "x": 1830,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v07-store-exchange:specimen_store:return:1",
          "portal": "v07-store-exchange:specimen_store",
          "x": 1958,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "annexe originale du jeu, pas pièce canonique certifiée",
        "layout": "plan original non coté",
        "source": null
      }
    },
    {
      "id": "boarding",
      "name": "Vestibule d’embarquement",
      "width": 2440,
      "mode": "depth",
      "depth": 180,
      "deck": "D-01",
      "description": "Vestibule du Marion, bancs fixés au sol et racks. Les accès dessinent un chemin continu vers le sas, le bras puis le Samson.",
      "zone": "marion",
      "style": "ship",
      "motif": "airlock",
      "sourceStatus": "source-place-original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "boarding:v10:bench:510:15",
          "type": "bench",
          "x": 510,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "boarding:v10:bench:730:15",
          "type": "bench",
          "x": 730,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "boarding:v10:bench:1330:145",
          "type": "bench",
          "x": 1330,
          "y": 145,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "boarding:v10:rack:1910:12",
          "type": "rack",
          "x": 1910,
          "y": 12,
          "scale": 1,
          "solid": true,
          "variant": 0
        },
        {
          "id": "boarding:v10:strap:1750:140",
          "type": "strap",
          "x": 1750,
          "y": 140,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "boarding:v10:extinguisher:2060:15",
          "type": "extinguisher",
          "x": 2060,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "boarding:v10:terminal:320:18",
          "type": "terminal",
          "x": 320,
          "y": 18,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "boarding:v10:cabinet:1450:15",
          "type": "cabinet",
          "x": 1450,
          "y": 15,
          "scale": 1,
          "solid": true,
          "variant": 0
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 530,
          "y": 88
        },
        {
          "id": "b",
          "x": 1100,
          "y": 88
        },
        {
          "id": "c",
          "x": 1830,
          "y": 88
        }
      ],
      "portals": [
        {
          "id": "e12:boarding",
          "edge": "e12",
          "target": "hangar",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v10-boarding-airlock:boarding",
          "edge": "v10-boarding-airlock",
          "target": "docking_airlock",
          "kind": "door",
          "x": 2350,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 450,
            "y": 80,
            "radius": 330,
            "strength": 0.5
          },
          {
            "x": 1990,
            "y": 80,
            "radius": 330,
            "strength": 0.45
          }
        ]
      },
      "parallax": [],
      "artNotes": "Plan original fondé sur les fonctions attestées dans F02. Aucune dimension officielle.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "e12:boarding:return:-1",
          "portal": "e12:boarding",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "e12:boarding:return:1",
          "portal": "e12:boarding",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-boarding-airlock:boarding:return:-1",
          "portal": "v10-boarding-airlock:boarding",
          "x": 2280,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-boarding-airlock:boarding:return:1",
          "portal": "v10-boarding-airlock:boarding",
          "x": 2408,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction/lieu attesté dans un extrait",
        "layout": "plan original non coté",
        "source": "F02"
      }
    },
    {
      "id": "docking_airlock",
      "name": "Sas d’amarrage",
      "width": 1480,
      "mode": "profile",
      "depth": 180,
      "deck": "D-02",
      "description": "Sas situé entre le vestibule et le bras. Deux cloisons terminales, commande de pression et plancher continu.",
      "zone": "marion",
      "style": "ship",
      "motif": "airlock",
      "sourceStatus": "source-place-original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "docking_airlock:v10:valve:440:15",
          "type": "valve",
          "x": 440,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "docking_airlock:v10:pipe:750:10",
          "type": "pipe",
          "x": 750,
          "y": 10,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "docking_airlock:v10:beacon:1150:15",
          "type": "beacon",
          "x": 1150,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 400,
          "y": 88
        },
        {
          "id": "b",
          "x": 740.0,
          "y": 88
        },
        {
          "id": "c",
          "x": 1060,
          "y": 88
        }
      ],
      "portals": [
        {
          "id": "v10-boarding-airlock:docking_airlock",
          "edge": "v10-boarding-airlock",
          "target": "boarding",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v10-airlock-arm:docking_airlock",
          "edge": "v10-airlock-arm",
          "target": "docking_arm",
          "kind": "door",
          "x": 1390,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 450,
            "y": 80,
            "radius": 330,
            "strength": 0.5
          },
          {
            "x": 1030,
            "y": 80,
            "radius": 330,
            "strength": 0.45
          }
        ]
      },
      "parallax": [],
      "artNotes": "Plan original fondé sur les fonctions attestées dans F02. Aucune dimension officielle.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "v10-boarding-airlock:docking_airlock:return:-1",
          "portal": "v10-boarding-airlock:docking_airlock",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-boarding-airlock:docking_airlock:return:1",
          "portal": "v10-boarding-airlock:docking_airlock",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-airlock-arm:docking_airlock:return:-1",
          "portal": "v10-airlock-arm:docking_airlock",
          "x": 1320,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-airlock-arm:docking_airlock:return:1",
          "portal": "v10-airlock-arm:docking_airlock",
          "x": 1448,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction/lieu attesté dans un extrait",
        "layout": "plan original non coté",
        "source": "F02"
      }
    },
    {
      "id": "docking_arm",
      "name": "Bras d’amarrage du Samson",
      "width": 1900,
      "mode": "profile",
      "depth": 180,
      "deck": "D-03",
      "description": "Passerelle close entre sas du Marion et écoutille du Samson. Segments vitrés et supports de quai, aucune sortie libre vers le vide.",
      "zone": "marion",
      "style": "ship",
      "motif": "airlock",
      "sourceStatus": "source-place-original-layout",
      "ambient": "amb_ship",
      "props": [
        {
          "id": "docking_arm:v10:beam:420:12",
          "type": "beam",
          "x": 420,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "docking_arm:v10:beam:890:12",
          "type": "beam",
          "x": 890,
          "y": 12,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "docking_arm:v10:strap:1340:15",
          "type": "strap",
          "x": 1340,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        },
        {
          "id": "docking_arm:v10:beacon:1520:15",
          "type": "beacon",
          "x": 1520,
          "y": 15,
          "scale": 1,
          "solid": false,
          "variant": 0
        }
      ],
      "nodes": [
        {
          "id": "a",
          "x": 400,
          "y": 88
        },
        {
          "id": "b",
          "x": 950.0,
          "y": 88
        },
        {
          "id": "c",
          "x": 1480,
          "y": 88
        }
      ],
      "portals": [
        {
          "id": "v10-airlock-arm:docking_arm",
          "edge": "v10-airlock-arm",
          "target": "docking_airlock",
          "kind": "door",
          "x": 90,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        },
        {
          "id": "v10-arm-samson:docking_arm",
          "edge": "v10-arm-samson",
          "target": "samson",
          "kind": "door",
          "x": 1810,
          "y": 88,
          "mount": {
            "type": "terminal-alcove",
            "organic": false,
            "depth": 60,
            "width": 116,
            "source": "geometry-reconstruction"
          }
        }
      ],
      "lighting": {
        "ambient": 0.34,
        "pools": [
          {
            "x": 450,
            "y": 80,
            "radius": 330,
            "strength": 0.5
          },
          {
            "x": 1450,
            "y": 80,
            "radius": 330,
            "strength": 0.45
          }
        ]
      },
      "parallax": [],
      "artNotes": "Plan original fondé sur les fonctions attestées dans F02. Aucune dimension officielle.",
      "encounterNotes": "Géométrie partagée joueur/IA ; enquêtes adjacentes limitées aux liaisons explicitement autorisées.",
      "walls": [
        {
          "id": "v10-airlock-arm:docking_arm:return:-1",
          "portal": "v10-airlock-arm:docking_arm",
          "x": 20,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-airlock-arm:docking_arm:return:1",
          "portal": "v10-airlock-arm:docking_arm",
          "x": 148,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-arm-samson:docking_arm:return:-1",
          "portal": "v10-arm-samson:docking_arm",
          "x": 1740,
          "y": 0,
          "w": 12,
          "h": 60
        },
        {
          "id": "v10-arm-samson:docking_arm:return:1",
          "portal": "v10-arm-samson:docking_arm",
          "x": 1868,
          "y": 0,
          "w": 12,
          "h": 60
        }
      ],
      "fidelity": {
        "existence": "fonction/lieu attesté dans un extrait",
        "layout": "plan original non coté",
        "source": "F02"
      }
    }
  ],
  "edges": [
    {
      "id": "e01",
      "a": "bridge",
      "b": "comms",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e02",
      "a": "bridge",
      "b": "junction",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e03",
      "a": "junction",
      "b": "engineering",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e04",
      "a": "junction",
      "b": "medical",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e05",
      "a": "junction",
      "b": "airlock",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e06",
      "a": "airlock",
      "b": "hangar",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e07",
      "a": "hangar",
      "b": "breach",
      "kind": "door",
      "minChapter": 1
    },
    {
      "id": "e08",
      "a": "engineering",
      "b": "workshop",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e09",
      "a": "engineering",
      "b": "server",
      "kind": "door",
      "minChapter": 0
    },
    {
      "id": "e10",
      "a": "hangar",
      "b": "dock",
      "kind": "door",
      "minChapter": 2
    },
    {
      "id": "e11",
      "a": "dock",
      "b": "narcissus",
      "kind": "door",
      "minChapter": 2
    },
    {
      "id": "e12",
      "a": "hangar",
      "b": "boarding",
      "kind": "door",
      "minChapter": 3
    },
    {
      "id": "e13",
      "a": "samson",
      "b": "cockpit",
      "kind": "door",
      "minChapter": 3
    },
    {
      "id": "e14",
      "a": "cockpit",
      "b": "landing",
      "kind": "shuttle",
      "minChapter": 5,
      "blockedChapters": [
        6,
        7,
        8,
        9,
        10
      ]
    },
    {
      "id": "e15",
      "a": "landing",
      "b": "control",
      "kind": "door",
      "minChapter": 5
    },
    {
      "id": "e16",
      "a": "control",
      "b": "stores",
      "kind": "door",
      "minChapter": 5
    },
    {
      "id": "e17",
      "a": "control",
      "b": "lift_top",
      "kind": "door",
      "minChapter": 5
    },
    {
      "id": "e18",
      "a": "lift_top",
      "b": "lift_bottom",
      "kind": "lift",
      "minChapter": 6,
      "blockedChapters": [
        7,
        8,
        9,
        10
      ]
    },
    {
      "id": "e19",
      "a": "lift_bottom",
      "b": "haul",
      "kind": "door",
      "minChapter": 6
    },
    {
      "id": "e20",
      "a": "haul",
      "b": "pump",
      "kind": "door",
      "minChapter": 6
    },
    {
      "id": "e21",
      "a": "haul",
      "b": "refuge",
      "kind": "door",
      "minChapter": 6
    },
    {
      "id": "e22",
      "a": "haul",
      "b": "vein",
      "kind": "door",
      "minChapter": 6
    },
    {
      "id": "e23",
      "a": "vein",
      "b": "fissure",
      "kind": "door",
      "minChapter": 7
    },
    {
      "id": "e24",
      "a": "fissure",
      "b": "vestibule",
      "kind": "door",
      "minChapter": 8
    },
    {
      "id": "e25",
      "a": "vestibule",
      "b": "fossils",
      "kind": "door",
      "minChapter": 8
    },
    {
      "id": "e26",
      "a": "fossils",
      "b": "eggs",
      "kind": "door",
      "minChapter": 8
    },
    {
      "id": "e27",
      "a": "eggs",
      "b": "bypass",
      "kind": "door",
      "minChapter": 9
    },
    {
      "id": "e28",
      "a": "bypass",
      "b": "lift_east",
      "kind": "door",
      "minChapter": 9
    },
    {
      "id": "e29",
      "a": "lift_east",
      "b": "stores",
      "kind": "lift",
      "minChapter": 10
    },
    {
      "id": "e30",
      "a": "hangar",
      "b": "hold",
      "kind": "door",
      "minChapter": 12
    },
    {
      "id": "e31",
      "a": "hold",
      "b": "medical",
      "kind": "door",
      "minChapter": 12
    },
    {
      "id": "e32",
      "a": "pump",
      "b": "vein",
      "kind": "door",
      "minChapter": 7
    },
    {
      "id": "oth-annex-rec-0",
      "a": "junction",
      "b": "rec",
      "minChapter": 0,
      "kind": "door"
    },
    {
      "id": "oth-annex-rec-1",
      "a": "workshop",
      "b": "rec",
      "minChapter": 0,
      "kind": "door"
    },
    {
      "id": "oth-annex-maintenance-0",
      "a": "engineering",
      "b": "maintenance",
      "minChapter": 1,
      "kind": "door"
    },
    {
      "id": "oth-annex-maintenance-1",
      "a": "server",
      "b": "maintenance",
      "minChapter": 3,
      "kind": "door"
    },
    {
      "id": "oth-annex-drain-0",
      "a": "haul",
      "b": "drain",
      "minChapter": 7,
      "kind": "door"
    },
    {
      "id": "oth-annex-drain-1",
      "a": "pump",
      "b": "drain",
      "minChapter": 7,
      "kind": "door"
    },
    {
      "id": "oth-annex-alcove-0",
      "a": "fossils",
      "b": "alcove",
      "minChapter": 8,
      "kind": "door"
    },
    {
      "id": "oth-annex-alcove-1",
      "a": "bypass",
      "b": "alcove",
      "minChapter": 9,
      "kind": "door"
    },
    {
      "id": "service-medical",
      "a": "rec",
      "b": "medical",
      "kind": "door",
      "minChapter": 0,
      "requiresRepair": "repair-medical"
    },
    {
      "id": "service-cargo",
      "a": "workshop",
      "b": "hangar",
      "kind": "door",
      "minChapter": 3,
      "requiresRepair": "repair-cargo"
    },
    {
      "id": "service-mine",
      "a": "drain",
      "b": "vein",
      "kind": "door",
      "minChapter": 7,
      "requiresRepair": "repair-mine"
    },
    {
      "id": "v07-haul-return",
      "a": "haul",
      "b": "return_gallery",
      "minChapter": 7,
      "kind": "door",
      "sourceStatus": "original-layout-v07"
    },
    {
      "id": "v07-return-exchange",
      "a": "return_gallery",
      "b": "exchanger",
      "minChapter": 7,
      "kind": "door",
      "sourceStatus": "original-layout-v07"
    },
    {
      "id": "v07-exchange-vein",
      "a": "exchanger",
      "b": "vein",
      "minChapter": 7,
      "kind": "door",
      "sourceStatus": "original-layout-v07",
      "requiresDrain": true
    },
    {
      "id": "v07-return-survey",
      "a": "return_gallery",
      "b": "survey",
      "minChapter": 7,
      "kind": "door",
      "sourceStatus": "original-layout-v07"
    },
    {
      "id": "v07-survey-store",
      "a": "survey",
      "b": "specimen_store",
      "minChapter": 7,
      "kind": "door",
      "sourceStatus": "original-layout-v07"
    },
    {
      "id": "v07-store-exchange",
      "a": "specimen_store",
      "b": "exchanger",
      "minChapter": 7,
      "kind": "door",
      "sourceStatus": "original-layout-v07"
    },
    {
      "id": "v10-boarding-airlock",
      "a": "boarding",
      "b": "docking_airlock",
      "kind": "door",
      "minChapter": 3
    },
    {
      "id": "v10-airlock-arm",
      "a": "docking_airlock",
      "b": "docking_arm",
      "kind": "door",
      "minChapter": 3
    },
    {
      "id": "v10-arm-samson",
      "a": "docking_arm",
      "b": "samson",
      "kind": "door",
      "minChapter": 3
    }
  ],
  "props": [
    {
      "id": "terminal",
      "label": "Terminal fixe",
      "width": 22,
      "height": 48,
      "scaleMeters": [
        0.7,
        1.5
      ],
      "placement": "Mur ou socle orienté vers une zone accessible.",
      "kind": "interaction",
      "rule": "Lire, couper ou rerouter ; écran au-dessus de la main.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "chair",
      "label": "Siège",
      "width": 19,
      "height": 32,
      "scaleMeters": [
        0.6,
        1
      ],
      "placement": "Face à une console, jamais dans une ouverture.",
      "kind": "obstacle",
      "rule": "Empreinte étroite, contournement visible.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "console",
      "label": "Pupitre",
      "width": 51,
      "height": 35,
      "scaleMeters": [
        1.6,
        1.1
      ],
      "placement": "Mur de commande, dégagement frontal.",
      "kind": "obstacle",
      "rule": "Témoin de courant et clavier séparés.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "locker",
      "label": "Casier",
      "width": 26,
      "height": 64,
      "scaleMeters": [
        0.8,
        2
      ],
      "placement": "Contre une cloison ; porte ouvrable côté chemin.",
      "kind": "cover",
      "rule": "Accroupi à proximité, il masque la ligne de vue.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "bench",
      "label": "Banc",
      "width": 58,
      "height": 18,
      "scaleMeters": [
        1.8,
        0.55
      ],
      "placement": "Zone de repos, pas au pied d’une échelle.",
      "kind": "cover",
      "rule": "Cache basse, non invulnérable en plein sprint.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "rack",
      "label": "Rack informatique",
      "width": 32,
      "height": 77,
      "scaleMeters": [
        1,
        2.4
      ],
      "placement": "Mur technique, câble vers le plafond.",
      "kind": "cover",
      "rule": "Cache haute et source de lumière locale.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "cable",
      "label": "Faisceau de câbles",
      "width": 51,
      "height": 10,
      "scaleMeters": [
        1.6,
        0.3
      ],
      "placement": "Attaché à un rail, jamais flottant.",
      "kind": "decor",
      "rule": "Exclu des collisions au sol.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "pipe",
      "label": "Conduite",
      "width": 83,
      "height": 8,
      "scaleMeters": [
        2.6,
        0.25
      ],
      "placement": "Aux murs et en plafond ; raccords alignés.",
      "kind": "decor",
      "rule": "La portion supérieure ne bloque pas les pieds.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "crate",
      "label": "Caisse de fret",
      "width": 35,
      "height": 29,
      "scaleMeters": [
        1.1,
        0.9
      ],
      "placement": "Travée de chargement avec appui complet au sol.",
      "kind": "cover",
      "rule": "Contournable en profondeur, silhouette opaque.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "vent",
      "label": "Bouche de ventilation",
      "width": 29,
      "height": 19,
      "scaleMeters": [
        0.9,
        0.6
      ],
      "placement": "Cloison ou plafond ; pas d’ouverture sur un faux sol.",
      "kind": "decor",
      "rule": "Bruit de fond local.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "extinguisher",
      "label": "Extincteur",
      "width": 8,
      "height": 21,
      "scaleMeters": [
        0.25,
        0.65
      ],
      "placement": "Support mural près des risques électriques.",
      "kind": "decor",
      "rule": "Silhouette rouge verticale et pictogramme.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "generator",
      "label": "Génératrice",
      "width": 64,
      "height": 51,
      "scaleMeters": [
        2,
        1.6
      ],
      "placement": "Local de puissance, accès technique conservé.",
      "kind": "cover",
      "rule": "Masse fixe et fils menant au réseau.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "valve",
      "label": "Vanne",
      "width": 14,
      "height": 21,
      "scaleMeters": [
        0.45,
        0.65
      ],
      "placement": "Fixée sur une conduite.",
      "kind": "interaction",
      "rule": "Roue et indicateur visuel de fermeture.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "toolcart",
      "label": "Chariot à outils",
      "width": 32,
      "height": 27,
      "scaleMeters": [
        1,
        0.85
      ],
      "placement": "À côté d’un atelier ou d’un équipement en réparation.",
      "kind": "cover",
      "rule": "Roues, tiroirs et plateau différenciés.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "pallet",
      "label": "Palette",
      "width": 42,
      "height": 8,
      "scaleMeters": [
        1.3,
        0.25
      ],
      "placement": "Sous le fret et orientée vers le quai.",
      "kind": "decor",
      "rule": "Faible hauteur ; pas un mur invisible.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "forklift",
      "label": "Chariot élévateur",
      "width": 80,
      "height": 70,
      "scaleMeters": [
        2.5,
        2.2
      ],
      "placement": "Baie de fret avec rayon de circulation.",
      "kind": "cover",
      "rule": "Mât, fourches basses, roues, poste de conduite.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "barrel",
      "label": "Fût industriel",
      "width": 19,
      "height": 30,
      "scaleMeters": [
        0.6,
        0.95
      ],
      "placement": "Groupé près du matériel qu’il alimente.",
      "kind": "cover",
      "rule": "Pas de baril explosif systématique.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "debris",
      "label": "Débris structurels",
      "width": 51,
      "height": 21,
      "scaleMeters": [
        1.6,
        0.65
      ],
      "placement": "Dans l’axe d’un impact ou d’un effondrement.",
      "kind": "cover",
      "rule": "Bords inclinés et passage de contournement.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "workbench",
      "label": "Établi",
      "width": 58,
      "height": 32,
      "scaleMeters": [
        1.8,
        1
      ],
      "placement": "Mur de l’atelier, outils au-dessus.",
      "kind": "cover",
      "rule": "Lampe articulée et plan de travail.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "medpod",
      "label": "Unité médicale",
      "width": 74,
      "height": 38,
      "scaleMeters": [
        2.3,
        1.2
      ],
      "placement": "Infirmerie alimentée, accès latéral.",
      "kind": "cover",
      "rule": "Capot transparent, bras et tuyaux séparés.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "bed",
      "label": "Couchette",
      "width": 64,
      "height": 22,
      "scaleMeters": [
        2,
        0.7
      ],
      "placement": "Pièce médicale ou repos.",
      "kind": "cover",
      "rule": "Literie non aléatoire ; passage conservé.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "cabinet",
      "label": "Armoire médicale",
      "width": 27,
      "height": 54,
      "scaleMeters": [
        0.85,
        1.7
      ],
      "placement": "Près d’un poste de soins.",
      "kind": "cover",
      "rule": "Portes vitrées et cases internes.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "cryopod",
      "label": "Caisson de stase",
      "width": 80,
      "height": 45,
      "scaleMeters": [
        2.5,
        1.4
      ],
      "placement": "Navette, appuis et ombilic identifiables.",
      "kind": "cover",
      "rule": "Capot incliné, verrou et lueur douce.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "catbox",
      "label": "Coffre sécurisé de Jones",
      "width": 21,
      "height": 18,
      "scaleMeters": [
        0.65,
        0.55
      ],
      "placement": "Alcôve sûre du Narcissus.",
      "kind": "decor",
      "rule": "Jones reste hors combat ; aucun objectif de sacrifice.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "strap",
      "label": "Arrimage",
      "width": 58,
      "height": 5,
      "scaleMeters": [
        1.8,
        0.15
      ],
      "placement": "Fixé aux anneaux au sol du fret.",
      "kind": "decor",
      "rule": "Doit suivre les palettes et non traverser les pieds.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "beacon",
      "label": "Balise",
      "width": 8,
      "height": 42,
      "scaleMeters": [
        0.25,
        1.3
      ],
      "placement": "Bord de plateforme ou de passage dangereux.",
      "kind": "decor",
      "rule": "Lumière fixe, sans flash imposé.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "cell",
      "label": "Cellule énergétique",
      "width": 38,
      "height": 24,
      "scaleMeters": [
        1.2,
        0.75
      ],
      "placement": "Berceau isolant dans la réserve.",
      "kind": "interaction",
      "rule": "Objet porté fixé aux mains après collecte.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "winch",
      "label": "Treuil",
      "width": 54,
      "height": 48,
      "scaleMeters": [
        1.7,
        1.5
      ],
      "placement": "En tête ou sur le côté d’un puits.",
      "kind": "cover",
      "rule": "Câble relié à la cage et axe cohérent.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "beam",
      "label": "Étai",
      "width": 13,
      "height": 86,
      "scaleMeters": [
        0.4,
        2.7
      ],
      "placement": "Roche ou traverse, jamais au centre d’une porte.",
      "kind": "decor",
      "rule": "Structure porteuse jusqu’au plafond.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "rail",
      "label": "Rail minier",
      "width": 96,
      "height": 3,
      "scaleMeters": [
        3,
        0.08
      ],
      "placement": "Aligné sur la galerie et le chariot.",
      "kind": "decor",
      "rule": "Dessin au sol, aucun mur de collision.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "minecart",
      "label": "Benne minière",
      "width": 58,
      "height": 37,
      "scaleMeters": [
        1.8,
        1.15
      ],
      "placement": "Alignée sur des rails.",
      "kind": "cover",
      "rule": "Roues, bac et minerai visibles.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "ore",
      "label": "Trimonite extraite",
      "width": 35,
      "height": 21,
      "scaleMeters": [
        1.1,
        0.65
      ],
      "placement": "Benne ou front de taille.",
      "kind": "cover",
      "rule": "Minéral dense ; aucun pouvoir magique.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "pump",
      "label": "Pompe",
      "width": 64,
      "height": 48,
      "scaleMeters": [
        2,
        1.5
      ],
      "placement": "Réseau humide avec entrée et sortie.",
      "kind": "cover",
      "rule": "Deux tuyaux raccordés et manomètre.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "drill",
      "label": "Foreuse",
      "width": 102,
      "height": 64,
      "scaleMeters": [
        3.2,
        2
      ],
      "placement": "Face à la roche du front de taille.",
      "kind": "cover",
      "rule": "Chenilles, bras, tête de coupe et moteur.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "rock",
      "label": "Bloc rocheux",
      "width": 45,
      "height": 45,
      "scaleMeters": [
        1.4,
        1.4
      ],
      "placement": "Sol d’une galerie naturelle.",
      "kind": "cover",
      "rule": "Variantes déterministes ; pas de roche dans l’infirmerie.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "rib",
      "label": "Nervure de coque",
      "width": 32,
      "height": 90,
      "scaleMeters": [
        1,
        2.8
      ],
      "placement": "Architecture étrangère continue.",
      "kind": "decor",
      "rule": "Courbe porteuse, pas un mobilier humain recoloré.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "resin",
      "label": "Résine",
      "width": 32,
      "height": 48,
      "scaleMeters": [
        1,
        1.5
      ],
      "placement": "Fixée au mur, au sol ou à une nervure.",
      "kind": "cover",
      "rule": "Volutes organiques avec ancrage.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "fossil",
      "label": "Vestige non humain",
      "width": 58,
      "height": 35,
      "scaleMeters": [
        1.8,
        1.1
      ],
      "placement": "Strate ou alcôve, traitement archéologique.",
      "kind": "cover",
      "rule": "Interprétation visuelle ; espèce non identifiée.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "egg",
      "label": "Œuf",
      "width": 26,
      "height": 34,
      "scaleMeters": [
        0.8,
        1.05
      ],
      "placement": "Niche organique avec dégagement autour.",
      "kind": "hazard",
      "rule": "Activation uniquement par proximité, télégraphiée.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design"
    },
    {
      "id": "hideNiche",
      "width": 68,
      "height": 106,
      "solid": false,
      "role": "Repère de cachette accessible à proximité ; ne remplace pas une collision.",
      "label": "Alcôve de dissimulation",
      "kind": "interaction",
      "placement": "Repère de cachette accessible à proximité ; ne remplace pas une collision.",
      "rule": "Repère de cachette accessible à proximité ; ne remplace pas une collision.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        2.12,
        3.31
      ]
    },
    {
      "id": "cableSpool",
      "width": 56,
      "height": 50,
      "solid": true,
      "role": "Stock technique réservé aux locaux humains.",
      "label": "Touret de câble",
      "kind": "obstacle",
      "placement": "Stock technique réservé aux locaux humains.",
      "rule": "Stock technique réservé aux locaux humains.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        1.75,
        1.56
      ]
    },
    {
      "id": "sampleRack",
      "width": 58,
      "height": 66,
      "solid": true,
      "role": "Échantillonnage sur le front de taille.",
      "label": "Râtelier d’échantillons",
      "kind": "obstacle",
      "placement": "Échantillonnage sur le front de taille.",
      "rule": "Échantillonnage sur le front de taille.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        1.81,
        2.06
      ]
    },
    {
      "id": "portableLamp",
      "width": 30,
      "height": 71,
      "solid": false,
      "role": "Source de lumière locale correspondant au calcul de visibilité.",
      "label": "Balise de travail",
      "kind": "interaction",
      "placement": "Source de lumière locale correspondant au calcul de visibilité.",
      "rule": "Source de lumière locale correspondant au calcul de visibilité.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        0.94,
        2.22
      ]
    },
    {
      "id": "bioTendrils",
      "width": 87,
      "height": 81,
      "solid": true,
      "role": "Masse organique contre le fond ; aucun tuyau industriel.",
      "label": "Ancrage de nervures",
      "kind": "obstacle",
      "placement": "Masse organique contre le fond ; aucun tuyau industriel.",
      "rule": "Masse organique contre le fond ; aucun tuyau industriel.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        2.72,
        2.53
      ]
    },
    {
      "id": "serviceHatch",
      "width": 82,
      "height": 91,
      "solid": false,
      "role": "Habillage de mur ; non présentée comme un passage utilisable.",
      "label": "Trappe de service",
      "kind": "interaction",
      "placement": "Habillage de mur ; non présentée comme un passage utilisable.",
      "rule": "Habillage de mur ; non présentée comme un passage utilisable.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        2.56,
        2.84
      ]
    },
    {
      "id": "supplyChest",
      "width": 43,
      "height": 31,
      "solid": false,
      "role": "Couvercle ouvert et contenu retiré après collecte.",
      "label": "Caisse de réserve",
      "kind": "interaction",
      "placement": "Couvercle ouvert et contenu retiré après collecte.",
      "rule": "Couvercle ouvert et contenu retiré après collecte.",
      "artStatus": "procedural-original",
      "sourceStatus": "game-design",
      "scaleMeters": [
        1.34,
        0.97
      ]
    },
    {
      "id": "serviceTrolley",
      "label": "Servante de maintenance mobile",
      "width": 64,
      "height": 56,
      "scaleMeters": [
        2,
        1.75
      ],
      "placement": "Aire de manutention balisée des locaux humains.",
      "kind": "cover",
      "rule": "Roues, freins et deux poignées. La position du chariot commande le dessin, la collision et l’occultation.",
      "artStatus": "procedural-original",
      "sourceStatus": "original-gameplay-v09"
    },
    {
      "id": "oreTrolley",
      "label": "Benne de manutention mobile",
      "width": 84,
      "height": 64,
      "scaleMeters": [
        2.625,
        2
      ],
      "placement": "Aire de manutention balisée des locaux humains.",
      "kind": "cover",
      "rule": "Roues, freins et deux poignées. La position du chariot commande le dessin, la collision et l’occultation.",
      "artStatus": "procedural-original",
      "sourceStatus": "original-gameplay-v09"
    }
  ],
  "chapters": [
    {
      "id": "oth-c01",
      "index": 0,
      "title": "Silence sur la ligne",
      "actor": "hoop",
      "startRoom": "bridge",
      "objectives": [
        {
          "id": "oth-c01-o1",
          "room": "bridge",
          "node": "a",
          "action": "inspect",
          "label": "Vérifier la liaison avec la mine",
          "hint": "Lisez le tableau de navigation.",
          "after": "Le Marion ne reçoit plus les équipes au sol.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c01-o2",
          "room": "comms",
          "node": "b",
          "action": "circuit",
          "label": "Rétablir le relais local",
          "hint": "Séparez la balise de la ligne endommagée.",
          "after": "La portée est courte. Quelqu’un doit encore pouvoir nous entendre.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c01-o3",
          "room": "engineering",
          "node": "c",
          "action": "repair",
          "label": "Stabiliser le bus de secours",
          "hint": "Travaillez au panneau de distribution.",
          "after": "L’alimentation tient. Pour l’instant.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 0,
      "intro": "Lisez le tableau de navigation."
    },
    {
      "id": "oth-c02",
      "index": 1,
      "title": "La Delilah",
      "actor": "hoop",
      "startRoom": "engineering",
      "objectives": [
        {
          "id": "oth-c02-o1",
          "room": "airlock",
          "node": "b",
          "action": "valve",
          "label": "Isoler les conduites du quai",
          "hint": "Fermez la vanne, sans vider la réserve respirable.",
          "after": "La conduite du quai est isolée.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c02-o2",
          "room": "breach",
          "node": "a",
          "action": "seal",
          "label": "Fermer la cloison d’impact",
          "hint": "Les tôles protègent du souffle, pas de la créature.",
          "after": "La brèche est derrière la cloison.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c02-o3",
          "room": "hangar",
          "node": "c",
          "action": "inspect",
          "label": "Vérifier l’amarrage du Samson",
          "hint": "Approchez le pupitre de fret.",
          "after": "Le Samson tient encore au quai. Son intérieur n’est pas sûr.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 0,
      "intro": "Fermez la vanne, sans vider la réserve respirable."
    },
    {
      "id": "oth-c03",
      "index": 2,
      "title": "Une navette à la dérive",
      "actor": "ripley",
      "startRoom": "hangar",
      "objectives": [
        {
          "id": "oth-c03-o1",
          "room": "dock",
          "node": "b",
          "action": "circuit",
          "label": "Alimenter le collier d’amarrage",
          "hint": "Privilégiez les verrous, pas le chargement.",
          "after": "Le passage est alimenté.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c03-o2",
          "room": "narcissus",
          "node": "a",
          "action": "inspect",
          "label": "Contrôler la cryostase",
          "hint": "Le coffre de Jones reste fermé et sécurisé.",
          "after": "Jones reste ici, à l’abri.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c03-o3",
          "room": "medical",
          "node": "b",
          "action": "inspect",
          "label": "Récupérer le nécessaire de terrain",
          "hint": "La zone médicale donne un point de reprise.",
          "after": "Nous descendrons équipés, pas armés comme une escouade.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 0,
      "intro": "Privilégiez les verrous, pas le chargement."
    },
    {
      "id": "oth-c04",
      "index": 3,
      "title": "Ce qu’il nous reste",
      "actor": "hoop",
      "startRoom": "medical",
      "objectives": [
        {
          "id": "oth-c04-o1",
          "room": "workshop",
          "node": "a",
          "action": "repair",
          "label": "Préparer le chalumeau",
          "hint": "Le jet repousse brièvement ; ce n’est pas une arme lourde.",
          "after": "Le réservoir est plein. Évitez les longues rafales.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c04-o2",
          "room": "server",
          "node": "b",
          "action": "inspect",
          "label": "Lire le diagnostic de la navette",
          "hint": "N’acceptez pas un état réseau comme une preuve physique.",
          "after": "Il manque une cellule compatible.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c04-o3",
          "room": "samson",
          "node": "a",
          "action": "seal",
          "label": "Séparer les travées de fret",
          "hint": "Un compartiment à la fois.",
          "after": "La première travée est fermée.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 1,
      "intro": "Le jet repousse brièvement ; ce n’est pas une arme lourde."
    },
    {
      "id": "oth-c05",
      "index": 4,
      "title": "Le vestibule du Samson",
      "actor": "ripley",
      "startRoom": "boarding",
      "objectives": [
        {
          "id": "oth-c05-o1",
          "room": "boarding",
          "node": "b",
          "action": "lure",
          "label": "Détourner le contact du vestibule",
          "hint": "Gardez les portes arrière accessibles.",
          "after": "Le contact quitte les sièges ; un passage de repli se dégage.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c05-o2",
          "room": "boarding",
          "node": "c",
          "action": "seal",
          "label": "Isoler le vestibule endommagé",
          "hint": "Rejoignez la commande avant de réarmer le Samson.",
          "after": "Le vestibule est isolé. Les fenêtres abîmées restent derrière la cloison.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c05-o3",
          "room": "cockpit",
          "node": "b",
          "action": "circuit",
          "label": "Réarmer la commande de vol",
          "hint": "La navigation doit rester isolée du réseau du Marion.",
          "after": "La commande locale répond.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 1,
      "intro": "Posez un leurre et laissez un chemin de repli."
    },
    {
      "id": "oth-c06",
      "index": 5,
      "title": "Sous la tempête",
      "actor": "hoop",
      "startRoom": "cockpit",
      "objectives": [
        {
          "id": "oth-c06-o1",
          "room": "cockpit",
          "node": "c",
          "action": "repair",
          "label": "Préparer la descente",
          "hint": "Contrôlez les commandes avant le transfert.",
          "after": "La route vers LV-178 est ouverte.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c06-o2",
          "room": "landing",
          "node": "b",
          "action": "inspect",
          "label": "Lire les balises de la concession",
          "hint": "Cherchez le poste derrière le sas.",
          "after": "Les balises dessinent encore une route.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c06-o3",
          "room": "control",
          "node": "a",
          "action": "circuit",
          "label": "Remettre le poste sous tension",
          "hint": "Alimentez le puits depuis le secours local.",
          "after": "Le plan des galeries est lisible.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 1,
      "intro": "Contrôlez les commandes avant le transfert."
    },
    {
      "id": "oth-c07",
      "index": 6,
      "title": "Le puits principal",
      "actor": "hoop",
      "startRoom": "control",
      "objectives": [
        {
          "id": "oth-c07-o1",
          "room": "lift_top",
          "node": "b",
          "action": "repair",
          "label": "Déverrouiller la cage",
          "hint": "Vérifiez le frein de service avant la descente.",
          "after": "La cage peut descendre.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c07-o2",
          "room": "lift_bottom",
          "node": "a",
          "action": "inspect",
          "label": "Sortir de la cage endommagée",
          "hint": "Le second puits doit offrir une autre issue.",
          "after": "La remontée par cette cage est compromise.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c07-o3",
          "room": "haul",
          "node": "b",
          "action": "circuit",
          "label": "Rétablir le balisage minier",
          "hint": "Le balisage ne remet pas le treuil en service.",
          "after": "Les balises indiquent la galerie est.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 2,
      "intro": "Vérifiez le frein de service avant la descente."
    },
    {
      "id": "oth-c08",
      "index": 7,
      "title": "La roche travaille",
      "actor": "hoop",
      "startRoom": "haul",
      "objectives": [
        {
          "id": "oth-c08-o1",
          "room": "pump",
          "node": "a",
          "action": "valve",
          "label": "Purger le collecteur",
          "hint": "Le manomètre baisse seulement sur la bonne conduite.",
          "after": "Le passage n’est plus sous pression.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c08-o2",
          "room": "refuge",
          "node": "b",
          "action": "inspect",
          "label": "Prendre les réserves du refuge",
          "hint": "Un détour calme permet de préparer la suite.",
          "after": "Des réserves. Pas assez pour rester.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c08-o3",
          "room": "vein",
          "node": "c",
          "action": "repair",
          "label": "Écarter le bras de la foreuse",
          "hint": "La machine doit rester contre le front de taille.",
          "after": "Une faille passe derrière la foreuse.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 2,
      "intro": "Le manomètre baisse seulement sur la bonne conduite."
    },
    {
      "id": "oth-c09",
      "index": 8,
      "title": "Sous la mine",
      "actor": "ripley",
      "startRoom": "vein",
      "objectives": [
        {
          "id": "oth-c09-o1",
          "room": "fissure",
          "node": "b",
          "action": "inspect",
          "label": "Suivre l’ouverture dans la roche",
          "hint": "Les étais humains s’arrêtent ici.",
          "after": "La coque n’appartient pas à la concession.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c09-o2",
          "room": "vestibule",
          "node": "a",
          "action": "inspect",
          "label": "Repérer les accès de l’épave",
          "hint": "Regardez les volumes avant d’avancer.",
          "after": "Il reste un passage entre les nervures.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c09-o3",
          "room": "fossils",
          "node": "b",
          "action": "inspect",
          "label": "Documenter les vestiges",
          "hint": "Ne donnez pas un nom certain à ce qui ne l’est pas.",
          "after": "Ces restes ne sont pas humains.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 2,
      "intro": "Les étais humains s’arrêtent ici."
    },
    {
      "id": "oth-c10",
      "index": 9,
      "title": "Ne les réveillez pas",
      "actor": "ripley",
      "startRoom": "fossils",
      "objectives": [
        {
          "id": "oth-c10-o1",
          "room": "eggs",
          "node": "a",
          "action": "lure",
          "label": "Dégager le passage de la chambre",
          "hint": "Un leurre éloigne l’adulte, pas les œufs.",
          "after": "Le couloir se libère quelques instants.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c10-o2",
          "room": "eggs",
          "node": "c",
          "action": "inspect",
          "label": "Identifier le passage de service",
          "hint": "Contournez les niches ; économisez le feu.",
          "after": "La suture de la coque mène vers la mine.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c10-o3",
          "room": "bypass",
          "node": "b",
          "action": "seal",
          "label": "Isoler le passage derrière le groupe",
          "hint": "La cloison ne transforme pas la ruche en lieu sûr.",
          "after": "Le passage est fermé. Il faut continuer.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "Un leurre éloigne l’adulte, pas les œufs."
    },
    {
      "id": "oth-c11",
      "index": 10,
      "title": "La seconde cage",
      "actor": "hoop",
      "startRoom": "bypass",
      "objectives": [
        {
          "id": "oth-c11-o1",
          "room": "lift_east",
          "node": "a",
          "action": "repair",
          "label": "Remettre le frein de cage",
          "hint": "Cette cage est distincte de celle du puits principal.",
          "after": "La remontée est possible par ce puits.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c11-o2",
          "room": "stores",
          "node": "b",
          "action": "carry",
          "label": "Prendre une cellule compatible",
          "hint": "Une charge portée interdit le sprint.",
          "after": "La cellule est fixée au harnais.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c11-o3",
          "room": "control",
          "node": "c",
          "action": "install",
          "label": "Brancher le berceau de transport",
          "hint": "Ne consommez pas la cellule dans le réseau du poste.",
          "after": "La cellule est prête pour le retour.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "Cette cage est distincte de celle du puits principal."
    },
    {
      "id": "oth-c12",
      "index": 11,
      "title": "Quitter la concession",
      "actor": "hoop",
      "startRoom": "control",
      "objectives": [
        {
          "id": "oth-c12-o1",
          "room": "stores",
          "node": "a",
          "action": "circuit",
          "label": "Isoler les réserves condamnées",
          "hint": "La cellule de secours reste sur son berceau.",
          "after": "La séquence d’abandon est armée.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c12-o2",
          "room": "landing",
          "node": "c",
          "action": "seal",
          "label": "Fermer le dernier accès au site",
          "hint": "La carte conserve les lieux abandonnés.",
          "after": "La concession n’est plus une route de repli.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c12-o3",
          "room": "cockpit",
          "node": "a",
          "action": "repair",
          "label": "Rejoindre l’orbite",
          "hint": "Utilisez le passage de transfert vers le Samson.",
          "after": "Le Marion dérive toujours.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "La cellule de secours reste sur son berceau."
    },
    {
      "id": "oth-c13",
      "index": 12,
      "title": "Le passager restant",
      "actor": "hoop",
      "startRoom": "cockpit",
      "objectives": [
        {
          "id": "oth-c13-o1",
          "room": "hangar",
          "node": "b",
          "action": "inspect",
          "label": "Vérifier les traces du quai",
          "hint": "Ne prenez pas le silence pour une absence.",
          "after": "Quelque chose est resté à bord.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c13-o2",
          "room": "hold",
          "node": "a",
          "action": "lure",
          "label": "Attirer la présence dans la soute",
          "hint": "Gardez la commande de cloison entre vous et elle.",
          "after": "Le leurre résonne dans le fret.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c13-o3",
          "room": "hold",
          "node": "c",
          "action": "seal",
          "label": "Condamner la soute de quarantaine",
          "hint": "Le confinement enlève cette menace du secteur.",
          "after": "La soute est perdue. La route vers l’infirmerie reste libre.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "Ne prenez pas le silence pour une absence."
    },
    {
      "id": "oth-c14",
      "index": 13,
      "title": "L’infirmerie ne répond plus",
      "actor": "hoop",
      "startRoom": "hold",
      "objectives": [
        {
          "id": "oth-c14-o1",
          "room": "medical",
          "node": "a",
          "action": "repair",
          "label": "Rétablir l’alimentation médicale",
          "hint": "Le secours physique est indépendant du terminal.",
          "after": "Le matériel de soin est alimenté.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c14-o2",
          "room": "medical",
          "node": "c",
          "action": "inspect",
          "label": "Accompagner Ripley dans l’unité médicale",
          "hint": "Restez auprès de l’unité jusqu’à la fin du programme.",
          "after": "Le programme de l’unité est terminé. Ripley reste inconsciente.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c14-o3",
          "room": "medical",
          "node": "b",
          "action": "inspect",
          "label": "Vérifier l’alerte de l’unité médicale",
          "hint": "Revenez au pupitre médical, près du lit.",
          "after": "Le réseau a repris le contrôle. Kasyanov ne répond plus. Il faut évacuer Ripley.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "Le secours physique est indépendant du terminal."
    },
    {
      "id": "oth-c15",
      "index": 14,
      "title": "Couper Ash",
      "actor": "hoop",
      "startRoom": "server",
      "objectives": [
        {
          "id": "oth-c15-o1",
          "room": "narcissus",
          "node": "b",
          "action": "install",
          "label": "Installer Ripley et la cellule de retour",
          "hint": "Rejoignez le Narcissus en portant Ripley. Le sprint est indisponible.",
          "after": "Ripley est en stase avec Jones. La cellule de retour est branchée.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c15-o2",
          "room": "narcissus",
          "node": "c",
          "action": "purge",
          "label": "Purger la copie d’Ash",
          "hint": "Le purificateur local doit être isolé du réseau avant de lancer la purge.",
          "after": "Ash ne répond plus. La commande automatique des attaches ne fonctionne pas.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c15-o3",
          "room": "dock",
          "node": "c",
          "action": "inspect",
          "label": "Contrôler les verrous d’amarrage",
          "hint": "La commande automatique reste bloquée.",
          "after": "Le largage devra être manuel.",
          "hold": 0.65,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "Confirmez l’isolement local avant la purge."
    },
    {
      "id": "oth-c16",
      "index": 15,
      "title": "Dernière transmission",
      "actor": "hoop",
      "startRoom": "dock",
      "objectives": [
        {
          "id": "oth-c16-o1",
          "room": "dock",
          "node": "a",
          "action": "release",
          "label": "Libérer le Narcissus",
          "hint": "La commande est sur le Marion. Ripley et Jones restent dans la navette.",
          "after": "La navette s’éloigne. Il faut rejoindre le Samson.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c16-o2",
          "room": "samson",
          "node": "b",
          "action": "repair",
          "label": "Fermer le Samson",
          "hint": "Préparez la dernière cabine encore accessible.",
          "after": "La coque tient. La radio aussi.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        },
        {
          "id": "oth-c16-o3",
          "room": "cockpit",
          "node": "c",
          "action": "transmit",
          "label": "Émettre un appel de détresse",
          "hint": "Aucun sauvetage futur n’est affirmé.",
          "after": "Le message part. Aucune réponse, pour l’instant.",
          "hold": 1.25,
          "sourceStatus": "original-gameplay"
        }
      ],
      "sourceStatus": "original-adaptation-sequence",
      "threat": 3,
      "intro": "La commande est sur le Marion. Ripley et Jones restent dans la navette."
    }
  ],
  "cast": [
    {
      "id": "hoop",
      "name": "Chris « Hoop » Hooper",
      "role": "Ingénieur / protagoniste",
      "design": "Réparations, transport, lecture des réseaux. Le joueur conserve les mêmes outils de survie.",
      "status": "source-character",
      "sources": [
        "S1",
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "ripley",
      "name": "Ellen Ripley",
      "role": "Protagoniste",
      "design": "Séquences d’exploration et de confinement. Aucune invulnérabilité ; échec puis reprise plutôt qu’une nouvelle mort canonique.",
      "status": "source-character",
      "sources": [
        "S1",
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "ash",
      "name": "Ash",
      "role": "Antagoniste informatique",
      "design": "Actions sur le réseau et les systèmes, pas de corps de synthétique ajouté. Messages nouveaux, jamais présentés comme des citations.",
      "status": "source-character",
      "sources": [
        "S3",
        "S4"
      ]
    },
    {
      "id": "kasyanov",
      "name": "Kasyanov",
      "role": "Équipage — médical",
      "design": "Présences scénarisées et pertes suivies ; modèle visuel civil provisoire, chorégraphie intégrale non livrée.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "sneddon",
      "name": "Sneddon",
      "role": "Équipage",
      "design": "Conséquences de l’histoire conservées dans le dossier, sans proposer une guérison universelle.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "baxter",
      "name": "Baxter",
      "role": "Équipage",
      "design": "Présence scénarisée et accompagnement physique du refuge vers le front de taille en V0.3 ; pas de statut de survie futur inventé.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "lachance",
      "name": "Lachance",
      "role": "Équipage — pilotage",
      "design": "La navette est un lieu relié, pas un véhicule de combat libre.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "welford",
      "name": "Welford",
      "role": "Équipage",
      "design": "Présences scénarisées et pertes suivies ; modèle visuel civil provisoire, chorégraphie intégrale non livrée.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "powell",
      "name": "Powell",
      "role": "Équipage",
      "design": "Présences scénarisées et pertes suivies ; modèle visuel civil provisoire, chorégraphie intégrale non livrée.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "garcia",
      "name": "Garcia",
      "role": "Équipage",
      "design": "Présences scénarisées et pertes suivies ; modèle visuel civil provisoire, chorégraphie intégrale non livrée.",
      "status": "source-character",
      "sources": [
        "S3"
      ],
      "appearanceStatus": "interprétation visuelle provisoire"
    },
    {
      "id": "jones",
      "name": "Jones",
      "role": "Passager protégé",
      "design": "Reste dans le Narcissus ; absence d’ennemis et de dégâts dans son espace.",
      "status": "source-character",
      "sources": [
        "S3"
      ]
    },
    {
      "id": "jordan",
      "name": "Lucy Jordan",
      "role": "Commandement",
      "sourceStatus": "source-character",
      "appearanceStatus": "interprétation visuelle provisoire"
    }
  ],
  "codex": [
    {
      "id": "cast-hoop",
      "category": "Équipage",
      "title": "Chris « Hoop » Hooper",
      "summary": "Ingénieur / protagoniste",
      "text": "Les réparations passent par lui. Quand les commandes centrales deviennent douteuses, il reste les circuits locaux et ce qu’on peut remettre en état à la main.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S1",
        "S3"
      ],
      "productionNote": "Réparations, transport, lecture des réseaux. Le joueur conserve les mêmes outils de survie."
    },
    {
      "id": "cast-ripley",
      "category": "Équipage",
      "title": "Ellen Ripley",
      "summary": "Protagoniste",
      "text": "Elle connaît la menace que les autres essaient encore de comprendre. Cette connaissance aide à choisir une issue ; elle ne rend aucun passage sûr.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S1",
        "S3"
      ],
      "productionNote": "Séquences d’exploration et de confinement. Aucune invulnérabilité ; échec puis reprise plutôt qu’une nouvelle mort canonique."
    },
    {
      "id": "cast-ash",
      "category": "Équipage",
      "title": "Ash",
      "summary": "Antagoniste informatique",
      "text": "Une instruction du réseau n’est pas une preuve de sécurité. Isolez la liaison avant de faire confiance à un ordre qui semble trop commode.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3",
        "S4"
      ],
      "productionNote": "Actions sur le réseau et les systèmes, pas de corps de synthétique ajouté. Messages nouveaux, jamais présentés comme des citations."
    },
    {
      "id": "cast-kasyanov",
      "category": "Équipage",
      "title": "Kasyanov",
      "summary": "Équipage — médical",
      "text": "L’infirmerie dépend autant de ses instruments que de son alimentation. Un appareil sous tension peut encore recevoir une commande dangereuse.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Présence narrative au dossier. Pas d’IA de compagnon complète livrée dans cette version."
    },
    {
      "id": "cast-sneddon",
      "category": "Équipage",
      "title": "Sneddon",
      "summary": "Équipage",
      "text": "Le danger ne s’arrête pas au sas. Après un contact, un retour au calme ne suffit pas à lever la quarantaine.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Conséquences de l’histoire conservées dans le dossier, sans proposer une guérison universelle."
    },
    {
      "id": "cast-baxter",
      "category": "Équipage",
      "title": "Baxter",
      "summary": "Équipage",
      "text": "Dans les profondeurs, rester groupés devient difficile dès que les accès se ferment. Gardez toujours une seconde issue en tête.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Événements du groupe à développer en scènes ; pas d’invention d’un statut de survie canonique."
    },
    {
      "id": "cast-lachance",
      "category": "Équipage",
      "title": "Lachance",
      "summary": "Équipage — pilotage",
      "text": "Le Samson reste une navette de transport. Préparer son départ demande une alimentation fiable, pas une ligne de tir.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "La navette est un lieu relié, pas un véhicule de combat libre."
    },
    {
      "id": "cast-welford",
      "category": "Équipage",
      "title": "Welford",
      "summary": "Équipage",
      "text": "Les coursives de service ne sont pas toutes surveillées. Un passage libre sur le plan peut déjà abriter quelque chose.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Dossier présent ; chorégraphie individuelle encore à produire."
    },
    {
      "id": "cast-powell",
      "category": "Équipage",
      "title": "Powell",
      "summary": "Équipage",
      "text": "Lors d’un retrait, vérifiez le compartiment derrière vous avant de condamner une porte. Le silence du réseau ne signifie pas que tout le monde est passé.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Dossier présent ; chorégraphie individuelle encore à produire."
    },
    {
      "id": "cast-garcia",
      "category": "Équipage",
      "title": "Garcia",
      "summary": "Équipage",
      "text": "Après l’impact, le Marion n’est plus le même navire. Chaque détour coûte du temps et peut mener à un accès coupé.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Dossier présent ; chorégraphie individuelle encore à produire."
    },
    {
      "id": "cast-jones",
      "category": "Équipage",
      "title": "Jones",
      "summary": "Passager protégé",
      "text": "La caisse de transport reste dans le Narcissus, à l’écart des secteurs exposés. Ne transformez pas une évacuation en nouveau risque.",
      "unlockRoom": "narcissus",
      "sourceStatus": "source-character",
      "sources": [
        "S3"
      ],
      "productionNote": "Reste dans le Narcissus ; absence d’ennemis et de dégâts dans son espace."
    },
    {
      "id": "room-bridge",
      "category": "Lieux",
      "title": "Passerelle du Marion",
      "summary": "A-01",
      "text": "La passerelle centralise les échanges avec la concession. Le premier problème n’est pas une alarme : c’est l’absence de réponse.",
      "unlockRoom": "bridge",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Grande baie orbitale, consoles orientées vers la planète, commandement surélevé derrière une coursive praticable."
    },
    {
      "id": "room-comms",
      "category": "Lieux",
      "title": "Relais des communications",
      "summary": "A-02",
      "text": "Le relais local est le dernier lien utilisable quand la chaîne principale se tait. Vérifiez la ligne avant de relancer un appel.",
      "unlockRoom": "comms",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Antenne sectionnée visible à travers la baie. Les racks longent le mur ; le chemin central reste dégagé."
    },
    {
      "id": "room-junction",
      "category": "Lieux",
      "title": "Coursive des équipages",
      "summary": "A-03",
      "text": "Les accès de l’équipage se rejoignent ici. Retenez les directions de l’infirmerie, de la distribution électrique et du hangar.",
      "unlockRoom": "junction",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Trois accès de fond mènent à des pièces différentes. Les conduites suivent les cloisons et ne traversent pas les portes."
    },
    {
      "id": "room-engineering",
      "category": "Lieux",
      "title": "Distribution électrique",
      "summary": "B-01",
      "text": "Le bus de secours maintient les services essentiels. Les commandes centrales et les commandes locales ne doivent pas partager la même panne.",
      "unlockRoom": "engineering",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Bus de puissance à gauche, échangeurs à droite, vannes sous les tuyaux. Deux passages entourent les machines."
    },
    {
      "id": "room-airlock",
      "category": "Lieux",
      "title": "Sas de confinement",
      "summary": "B-02",
      "text": "Le sas sépare la partie habitée des dégâts du hangar. Une fermeture sert autant à contenir une menace qu’à préserver l’air restant.",
      "unlockRoom": "airlock",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Deux portes étanches encadrent une zone de purge. Un hublot permet de lire l’état du compartiment suivant."
    },
    {
      "id": "room-hangar",
      "category": "Lieux",
      "title": "Hangar des navettes",
      "summary": "C-01",
      "text": "Les navettes et l’accès au Narcissus passent par ce secteur. Il faut le retraverser au retour de LV-178 : ne le considérez jamais comme définitivement sûr.",
      "unlockRoom": "hangar",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Volume à trois bandes praticables. Palan suspendu, travées de chargement et navette en fond hors collision."
    },
    {
      "id": "room-breach",
      "category": "Lieux",
      "title": "Brèche de la Delilah",
      "summary": "C-02",
      "text": "La Delilah a laissé une rupture dans le navire. La priorité est de contenir les dégâts, pas d’explorer chaque débris.",
      "unlockRoom": "breach",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Tôle froissée en arrière-plan, câble arraché au premier plan, ligne de fuite derrière les écrans pare-feu."
    },
    {
      "id": "room-workshop",
      "category": "Lieux",
      "title": "Atelier de bord",
      "summary": "B-03",
      "text": "Les outils de maintenance sont les premières ressources disponibles. Préparez le chalumeau avant d’en avoir besoin dans un passage étroit.",
      "unlockRoom": "workshop",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Établi et outillage regroupés ; consommables rangés sur des plateaux plutôt que posés au milieu des portes."
    },
    {
      "id": "room-medical",
      "category": "Lieux",
      "title": "Infirmerie",
      "summary": "A-04",
      "text": "Les appareils doivent rester alimentés sans accepter les ordres du réseau compromis. Le secours local et la commande distante sont deux choses différentes.",
      "unlockRoom": "medical",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Unité médicale alimentée par un bus local visible ; lits et rideaux créent des caches sans bloquer l’allée."
    },
    {
      "id": "room-server",
      "category": "Lieux",
      "title": "Cœur informatique",
      "summary": "B-04",
      "text": "Le cœur informatique relie les systèmes du Marion. Une purge sans isolation laisse une voie de retour au programme que vous cherchez à supprimer.",
      "unlockRoom": "server",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Racks à deux hauteurs et câbles en plafond. Le sectionneur mécanique reste distinct du terminal compromis."
    },
    {
      "id": "room-dock",
      "category": "Lieux",
      "title": "Amarrage du Narcissus",
      "summary": "C-03",
      "text": "L’amarrage relie le Marion au Narcissus. Après la libération des attaches, cette voie ne doit plus être comptée comme un accès de secours.",
      "unlockRoom": "dock",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Passerelle d’embarquement, bras d’arrimage et connexion ombilicale convergent vers une seule navette."
    },
    {
      "id": "room-narcissus",
      "category": "Lieux",
      "title": "Narcissus — cryostase",
      "summary": "N-01",
      "text": "La navette conserve un espace protégé pour Ripley et Jones. Son départ exige encore une cellule et la libération des attaches.",
      "unlockRoom": "narcissus",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Cockpit compact, alcôve de cryostase et coffre sécurisé de Jones. Aucun adversaire n’entre dans cette pièce."
    },
    {
      "id": "room-samson",
      "category": "Lieux",
      "title": "Samson — soute",
      "summary": "S-01",
      "text": "La soute du Samson est un espace clos. Un leurre et une fermeture bien choisis valent mieux qu’une poursuite entre les charges.",
      "unlockRoom": "samson",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Rampe à gauche, palette de carburant et attaches au sol ; cockpit relié par une vraie porte de fond."
    },
    {
      "id": "room-cockpit",
      "category": "Lieux",
      "title": "Samson — cockpit",
      "summary": "S-02",
      "text": "Le poste de pilotage relie les préparatifs à bord aux transferts vers la concession. Le retour ne peut pas être engagé tant que la préparation au sol n’est pas terminée.",
      "unlockRoom": "cockpit",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Deux sièges et tableau de vol ; le panorama change uniquement quand le transfert entre orbite et sol est autorisé."
    },
    {
      "id": "room-landing",
      "category": "Lieux",
      "title": "LV-178 — aire d’atterrissage",
      "summary": "L-01",
      "text": "L’aire d’atterrissage reste le repère du retour. La poussière atténue les distances ; le poste de la concession permet de retrouver l’entrée des installations.",
      "unlockRoom": "landing",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Plateforme ancrée dans le sable, balises alignées sur les bords, roche en couches au-delà du périmètre."
    },
    {
      "id": "room-control",
      "category": "Lieux",
      "title": "Poste de la concession",
      "summary": "L-02",
      "text": "Les commandes de la concession desservent les réserves et le puits principal. C’est le point de passage entre le site extérieur et les profondeurs.",
      "unlockRoom": "control",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Salle préfabriquée à double paroi, carte des puits et vestiaire près du sas ; réserve électrique sous abri."
    },
    {
      "id": "room-stores",
      "category": "Lieux",
      "title": "Réserve des cellules",
      "summary": "L-03",
      "text": "La réserve abrite la cellule recherchée. La sortie secondaire débouche de ce côté ; gardez libre le berceau destiné au retour.",
      "unlockRoom": "stores",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Cellules sur berceaux isolés, table de contrôle au fond ; aucun carburant dans le passage de l’ascenseur."
    },
    {
      "id": "room-lift_top",
      "category": "Lieux",
      "title": "Puits principal — tête",
      "summary": "L-04",
      "text": "La tête du puits donne accès au réseau inférieur. Une fois la descente engagée, il ne faut pas supposer que la même cage pourra vous remonter.",
      "unlockRoom": "lift_top",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Cage verticale et guide-câbles. La descente change réellement de salle et de niveau dans la carte."
    },
    {
      "id": "room-lift_bottom",
      "category": "Lieux",
      "title": "Puits principal — fond",
      "summary": "M-01",
      "text": "L’état de la cage se vérifie ici. Si le puits principal est perdu, les galeries deviennent la seule route vers une autre remontée.",
      "unlockRoom": "lift_bottom",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Cage accidentée au fond, galerie de dégagement en avant ; poussière et faisceaux révèlent une profondeur non jouable."
    },
    {
      "id": "room-haul",
      "category": "Lieux",
      "title": "Galerie de roulage",
      "summary": "M-02",
      "text": "La galerie de roulage distribue le front de taille, le pompage et l’abri. Les masses industrielles coupent les lignes de vue, mais le bruit porte encore.",
      "unlockRoom": "haul",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Rails continus dans la même bande, convoyeur au fond, refuges dans des niches balisées."
    },
    {
      "id": "room-pump",
      "category": "Lieux",
      "title": "Station de pompage",
      "summary": "M-03",
      "text": "Le réseau de pompage dessert la mine. Ses vannes sont des commandes locales ; une instruction distante ne suffit pas à garantir leur état.",
      "unlockRoom": "pump",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Pompes sur socles, caniveaux et passerelles de maintenance ; la purge ferme une conduite identifiée."
    },
    {
      "id": "room-refuge",
      "category": "Lieux",
      "title": "Abri des mineurs",
      "summary": "M-04",
      "text": "L’abri offre un répit et des fournitures laissées sur place. Profitez de cette halte pour préparer le trajet suivant, pas pour oublier ce qui vous suit.",
      "unlockRoom": "refuge",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Bancs, casiers et bouteilles de secours. Alcôve calme facultative, distincte d’une sortie de mission."
    },
    {
      "id": "room-vein",
      "category": "Lieux",
      "title": "Front de trimonite",
      "summary": "M-05",
      "text": "Le front de trimonite marque la limite du travail humain. La voie qui se poursuit au-delà n’a pas été aménagée comme les galeries précédentes.",
      "unlockRoom": "vein",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Foreuse arrêtée face au front de taille ; minerai uniquement dans la roche ou les bennes, pas en loot flottant."
    },
    {
      "id": "room-fissure",
      "category": "Lieux",
      "title": "Faille d’accès",
      "summary": "M-06",
      "text": "Cette ouverture relie la mine aux structures enfouies. Le passage est étroit : la profondeur ne permettra pas de contourner un contact.",
      "unlockRoom": "fissure",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Les étais humains s’arrêtent avant une coque étrangère. Passage bas qui oblige à réduire le bruit."
    },
    {
      "id": "room-vestibule",
      "category": "Lieux",
      "title": "Épave enfouie — seuil",
      "summary": "D-01",
      "text": "Les formes de la coque ne répondent plus au langage des installations minières. Ce qui ressemble à une nervure peut dessiner un passage.",
      "unlockRoom": "vestibule",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Architecture étrangère à nervures asymétriques ; aucune console humaine ne pousse dans la coque."
    },
    {
      "id": "room-fossils",
      "category": "Lieux",
      "title": "Chambre des vestiges",
      "summary": "D-02",
      "text": "Des vestiges occupent cette chambre. Rien, ici, ne suffit à identifier avec certitude les constructeurs de l’épave.",
      "unlockRoom": "fossils",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Restes fossilisés de constructeurs inconnus. La forme est une interprétation, pas un modèle officiel."
    },
    {
      "id": "room-eggs",
      "category": "Lieux",
      "title": "Chambre d’incubation",
      "summary": "D-03",
      "text": "Gardez vos distances avec les membranes. Une ouverture laisse très peu de temps pour reculer avant que la menace ne change de forme.",
      "unlockRoom": "eggs",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Œufs placés dans des niches, résine sur supports ; un chemin lisible les contourne sans imposer une extermination."
    },
    {
      "id": "room-bypass",
      "category": "Lieux",
      "title": "Suture de la coque",
      "summary": "D-04",
      "text": "Cette suture de la coque donne accès à un autre chemin. Avancer oblige à quitter la route par laquelle le groupe est entré.",
      "unlockRoom": "bypass",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Chemin latéral étroit entre deux nervures, plan profond réservé aux silhouettes, sans ennemis touchables hors plan."
    },
    {
      "id": "room-lift_east",
      "category": "Lieux",
      "title": "Puits secondaire — cage",
      "summary": "M-07",
      "text": "La cage secondaire rejoint les réserves du site. C’est une autre remontée, pas un raccourci vers le puits principal endommagé.",
      "unlockRoom": "lift_east",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Sortie par cage distincte du puits saboté ; rails, treuil et câbles sont raccordés au plafond."
    },
    {
      "id": "room-hold",
      "category": "Lieux",
      "title": "Soute de quarantaine",
      "summary": "C-04",
      "text": "La quarantaine sert à empêcher le dernier contact de gagner les compartiments habités. Vérifiez la fermeture avant de rejoindre l’infirmerie.",
      "unlockRoom": "hold",
      "sourceStatus": "original-layout",
      "sources": [],
      "productionNote": "Cloisons coupe-feu et compartiment de fret. Le dernier danger ne réapparaît pas après son confinement."
    },
    {
      "id": "prop-terminal",
      "category": "Matériel",
      "title": "Terminal fixe",
      "summary": "Équipement et repères du site",
      "text": "Un écran allumé n’atteste pas de la fiabilité de l’ordre affiché. Lisez la provenance de la commande.",
      "unlockRoom": "bridge",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Lire, couper ou rerouter ; écran au-dessus de la main."
    },
    {
      "id": "prop-chair",
      "category": "Matériel",
      "title": "Siège",
      "summary": "Équipement et repères du site",
      "text": "Les sièges restent près des postes de travail. Contournez-les plutôt que de vous enfermer entre le mobilier et une cloison.",
      "unlockRoom": "bridge",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Empreinte étroite, contournement visible."
    },
    {
      "id": "prop-console",
      "category": "Matériel",
      "title": "Pupitre",
      "summary": "Équipement et repères du site",
      "text": "Un pupitre commande un service précis. Vérifiez le témoin du secours local avant d’actionner la ligne.",
      "unlockRoom": "bridge",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Témoin de courant et clavier séparés."
    },
    {
      "id": "prop-locker",
      "category": "Matériel",
      "title": "Casier",
      "summary": "Équipement et repères du site",
      "text": "La masse d’un casier peut couper une ligne de vue. Elle ne fait pas disparaître les bruits de pas.",
      "unlockRoom": "bridge",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Accroupi à proximité, il masque la ligne de vue."
    },
    {
      "id": "prop-bench",
      "category": "Matériel",
      "title": "Banc",
      "summary": "Équipement et repères du site",
      "text": "Les bancs encombrent le bord des zones de repos. Ne choisissez pas une cachette sans regarder sa sortie.",
      "unlockRoom": "bridge",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Cache basse, non invulnérable en plein sprint."
    },
    {
      "id": "prop-rack",
      "category": "Matériel",
      "title": "Rack informatique",
      "summary": "Équipement et repères du site",
      "text": "Les racks regroupent les liaisons du bord. Couper une alimentation et isoler une liaison ne produisent pas le même résultat.",
      "unlockRoom": "comms",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Cache haute et source de lumière locale."
    },
    {
      "id": "prop-cable",
      "category": "Matériel",
      "title": "Faisceau de câbles",
      "summary": "Équipement et repères du site",
      "text": "Un câble indique parfois où passe encore l’énergie. Ne tirez pas dessus sans savoir ce qu’il alimente.",
      "unlockRoom": "comms",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Exclu des collisions au sol."
    },
    {
      "id": "prop-pipe",
      "category": "Matériel",
      "title": "Conduite",
      "summary": "Équipement et repères du site",
      "text": "Suivez les conduites pour comprendre un secteur technique. Un coude de tuyauterie n’est pas une protection fiable contre une poursuite.",
      "unlockRoom": "junction",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "La portion supérieure ne bloque pas les pieds."
    },
    {
      "id": "prop-crate",
      "category": "Matériel",
      "title": "Caisse de fret",
      "summary": "Équipement et repères du site",
      "text": "Les caisses cassent les longues lignes de vue. Leur protection cesse dès que la menace les contourne.",
      "unlockRoom": "junction",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Contournable en profondeur, silhouette opaque."
    },
    {
      "id": "prop-vent",
      "category": "Matériel",
      "title": "Bouche de ventilation",
      "summary": "Équipement et repères du site",
      "text": "Une grille ne permet pas de voir tout ce qui circule derrière la paroi. Ne vous fiez pas au seul silence de la pièce.",
      "unlockRoom": "junction",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Bruit de fond local."
    },
    {
      "id": "prop-extinguisher",
      "category": "Matériel",
      "title": "Extincteur",
      "summary": "Équipement et repères du site",
      "text": "Les moyens de sécurité du bord sont faits pour des accidents industriels. Leur présence ne transforme pas le secteur en abri.",
      "unlockRoom": "junction",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Silhouette rouge verticale et pictogramme."
    },
    {
      "id": "prop-generator",
      "category": "Matériel",
      "title": "Génératrice",
      "summary": "Équipement et repères du site",
      "text": "Une alimentation de secours vaut surtout par son indépendance. Évitez de la reconnecter au circuit déjà compromis.",
      "unlockRoom": "engineering",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Masse fixe et fils menant au réseau."
    },
    {
      "id": "prop-valve",
      "category": "Matériel",
      "title": "Vanne",
      "summary": "Équipement et repères du site",
      "text": "La position d’une vanne concerne le circuit qui lui est attaché. Une fermeture improvisée peut supprimer votre propre issue.",
      "unlockRoom": "engineering",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Roue et indicateur visuel de fermeture."
    },
    {
      "id": "prop-toolcart",
      "category": "Matériel",
      "title": "Chariot à outils",
      "summary": "Équipement et repères du site",
      "text": "Les chariots regroupent l’outillage. Laissez leur côté de travail accessible et ne les confondez pas avec une issue.",
      "unlockRoom": "comms",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Roues, tiroirs et plateau différenciés."
    },
    {
      "id": "prop-pallet",
      "category": "Matériel",
      "title": "Palette",
      "summary": "Équipement et repères du site",
      "text": "Une palette marque une zone de manutention. Conservez une bande de circulation devant les charges.",
      "unlockRoom": "hangar",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Faible hauteur ; pas un mur invisible."
    },
    {
      "id": "prop-forklift",
      "category": "Matériel",
      "title": "Chariot élévateur",
      "summary": "Équipement et repères du site",
      "text": "Un engin de manutention n’est pas une arme. Sa masse peut surtout servir à couper la vue ou à reconnaître une zone de stockage.",
      "unlockRoom": "hangar",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Mât, fourches basses, roues, poste de conduite."
    },
    {
      "id": "prop-barrel",
      "category": "Matériel",
      "title": "Fût industriel",
      "summary": "Équipement et repères du site",
      "text": "Les fûts signalent un stockage industriel. Gardez un passage entre les charges et la sortie.",
      "unlockRoom": "hangar",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Pas de baril explosif systématique."
    },
    {
      "id": "prop-debris",
      "category": "Matériel",
      "title": "Débris structurels",
      "summary": "Équipement et repères du site",
      "text": "Les dégâts changent les repères. Un morceau de coque n’est pas une porte, même lorsqu’un jour apparaît derrière lui.",
      "unlockRoom": "breach",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Bords inclinés et passage de contournement."
    },
    {
      "id": "prop-workbench",
      "category": "Matériel",
      "title": "Établi",
      "summary": "Équipement et repères du site",
      "text": "L’établi permet de préparer les outils avant le départ. Une réparation réussie ici évite une manipulation au contact de la menace.",
      "unlockRoom": "workshop",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Lampe articulée et plan de travail."
    },
    {
      "id": "prop-medpod",
      "category": "Matériel",
      "title": "Unité médicale",
      "summary": "Équipement et repères du site",
      "text": "Le module dépend d’une alimentation et d’une commande. Préserver l’une n’oblige pas à accepter les ordres de l’autre.",
      "unlockRoom": "medical",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Capot transparent, bras et tuyaux séparés."
    },
    {
      "id": "prop-bed",
      "category": "Matériel",
      "title": "Couchette",
      "summary": "Équipement et repères du site",
      "text": "Un lit médical offre un point de repos, pas une quarantaine. Les accès de la pièce doivent être traités séparément.",
      "unlockRoom": "medical",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Literie non aléatoire ; passage conservé."
    },
    {
      "id": "prop-cabinet",
      "category": "Matériel",
      "title": "Armoire médicale",
      "summary": "Équipement et repères du site",
      "text": "Une armoire masque ce qui se trouve derrière elle. Elle peut aider à rompre la vue, mais également cacher une approche.",
      "unlockRoom": "medical",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Portes vitrées et cases internes."
    },
    {
      "id": "prop-cryopod",
      "category": "Matériel",
      "title": "Caisson de stase",
      "summary": "Équipement et repères du site",
      "text": "La cryostase suppose une installation stable. La préparation de la navette doit être terminée avant le départ.",
      "unlockRoom": "narcissus",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Capot incliné, verrou et lueur douce."
    },
    {
      "id": "prop-catbox",
      "category": "Matériel",
      "title": "Coffre sécurisé de Jones",
      "summary": "Équipement et repères du site",
      "text": "La caisse de Jones reste à bord du Narcissus. Aucun objectif ne demande de l’emporter dans la mine.",
      "unlockRoom": "narcissus",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Jones reste hors combat ; aucun objectif de sacrifice."
    },
    {
      "id": "prop-strap",
      "category": "Matériel",
      "title": "Arrimage",
      "summary": "Équipement et repères du site",
      "text": "Les sangles retiennent les charges du transport. Dans un compartiment endommagé, vérifiez ce qui reste effectivement arrimé.",
      "unlockRoom": "samson",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Doit suivre les palettes et non traverser les pieds."
    },
    {
      "id": "prop-beacon",
      "category": "Matériel",
      "title": "Balise",
      "summary": "Équipement et repères du site",
      "text": "Un signal local aide à attirer l’attention ailleurs. Le répit est bref ; décidez de votre déplacement avant de l’émettre.",
      "unlockRoom": "landing",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Lumière fixe, sans flash imposé."
    },
    {
      "id": "prop-cell",
      "category": "Matériel",
      "title": "Cellule énergétique",
      "summary": "Équipement et repères du site",
      "text": "La cellule doit être transportée jusqu’à son berceau. Son poids empêche de courir tant que vous la portez.",
      "unlockRoom": "stores",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Objet porté fixé aux mains après collecte."
    },
    {
      "id": "prop-winch",
      "category": "Matériel",
      "title": "Treuil",
      "summary": "Équipement et repères du site",
      "text": "Le treuil commande une charge ou une cage. Vérifiez le trajet de retour avant de dépendre de sa seule ligne.",
      "unlockRoom": "lift_top",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Câble relié à la cage et axe cohérent."
    },
    {
      "id": "prop-beam",
      "category": "Matériel",
      "title": "Étai",
      "summary": "Équipement et repères du site",
      "text": "Les renforts soutiennent la structure et découpent les passages. Regardez des deux côtés avant de traverser une travée.",
      "unlockRoom": "lift_top",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Structure porteuse jusqu’au plafond."
    },
    {
      "id": "prop-rail",
      "category": "Matériel",
      "title": "Rail minier",
      "summary": "Équipement et repères du site",
      "text": "La voie indique un ancien trajet de travail. Suivez aussi les accès latéraux : le passage principal peut être condamné.",
      "unlockRoom": "lift_bottom",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Dessin au sol, aucun mur de collision."
    },
    {
      "id": "prop-minecart",
      "category": "Matériel",
      "title": "Benne minière",
      "summary": "Équipement et repères du site",
      "text": "Les wagonnets suivent les voies de roulage. Les rails offrent un repère, pas la garantie d’un accès encore ouvert.",
      "unlockRoom": "haul",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Roues, bac et minerai visibles."
    },
    {
      "id": "prop-ore",
      "category": "Matériel",
      "title": "Trimonite extraite",
      "summary": "Équipement et repères du site",
      "text": "La trimonite justifie l’exploitation du site. Sa présence ne dit rien de ce qui a été découvert sous la concession.",
      "unlockRoom": "haul",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Minéral dense ; aucun pouvoir magique."
    },
    {
      "id": "prop-pump",
      "category": "Matériel",
      "title": "Pompe",
      "summary": "Équipement et repères du site",
      "text": "Une pompe appartient à un réseau de conduites. Les vannes voisines permettent de comprendre ce qu’elle dessert.",
      "unlockRoom": "pump",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Deux tuyaux raccordés et manomètre."
    },
    {
      "id": "prop-drill",
      "category": "Matériel",
      "title": "Foreuse",
      "summary": "Équipement et repères du site",
      "text": "Le forage appartient à la mine. Remettre son alimentation en état ne rend pas les profondeurs moins dangereuses.",
      "unlockRoom": "vein",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Chenilles, bras, tête de coupe et moteur."
    },
    {
      "id": "prop-rock",
      "category": "Matériel",
      "title": "Bloc rocheux",
      "summary": "Équipement et repères du site",
      "text": "Les masses rocheuses raccourcissent les perspectives. Ce qu’elles cachent ne devient visible qu’au dernier moment.",
      "unlockRoom": "fissure",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Variantes déterministes ; pas de roche dans l’infirmerie."
    },
    {
      "id": "prop-rib",
      "category": "Matériel",
      "title": "Nervure de coque",
      "summary": "Équipement et repères du site",
      "text": "Ces nervures appartiennent à la coque enfouie. Ne leur attribuez pas automatiquement la fonction d’une structure humaine.",
      "unlockRoom": "vestibule",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Courbe porteuse, pas un mobilier humain recoloré."
    },
    {
      "id": "prop-resin",
      "category": "Matériel",
      "title": "Résine",
      "summary": "Équipement et repères du site",
      "text": "La résine confond les contours et réduit les repères. Gardez à l’esprit l’ouverture par laquelle vous êtes entré.",
      "unlockRoom": "vestibule",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Volutes organiques avec ancrage."
    },
    {
      "id": "prop-fossil",
      "category": "Matériel",
      "title": "Vestige non humain",
      "summary": "Équipement et repères du site",
      "text": "Les vestiges ne donnent pas de nom à leurs constructeurs. Consignez ce qui est visible sans compléter les lacunes par une certitude.",
      "unlockRoom": "vestibule",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Interprétation visuelle ; espèce non identifiée."
    },
    {
      "id": "prop-egg",
      "category": "Matériel",
      "title": "Œuf",
      "summary": "Équipement et repères du site",
      "text": "Une membrane qui bouge est un avertissement. Reculez sans attendre de voir ce qui en sort.",
      "unlockRoom": "eggs",
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Activation uniquement par proximité, télégraphiée."
    },
    {
      "id": "sys-survival",
      "category": "Survie",
      "title": "Rester en vie",
      "summary": "Marcher produit moins de bruit que courir. Accroupi, le champ de vision adverse se réduit. Une cache coupe réellement la ligne de vue.",
      "text": "Marchez quand vous le pouvez. Une course attire l’attention ; s’accroupir aide à rester discret. Rompre la vue permet de quitter la dernière position où l’on vous a repéré.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Le prédateur voit sur son plan, entend dans sa salle et cherche la dernière position connue. Il ne lit pas les objectifs du joueur."
    },
    {
      "id": "sys-torch",
      "category": "Survie",
      "title": "Le chalumeau",
      "summary": "Une courte flamme force l’adulte à reculer. Le combustible ne revient pas à chaque porte.",
      "text": "Le chalumeau repousse à courte distance. Les flammes ne remplacent pas une issue, et le réservoir ne se remplit pas tout seul.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Portée 250 unités, test de profondeur 65, recul 2,4 s, coût 9 unités. Aucun tir à travers un objet solide."
    },
    {
      "id": "sys-decoy",
      "category": "Survie",
      "title": "Le leurre",
      "summary": "Le bruit attire une présence proche. Le leurre n’endort pas les œufs.",
      "text": "Lancez le leurre avant de vous déplacer. Profitez du bruit pour changer de trajectoire ; l’effet ne dure pas.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Durée 5 s ; position au sol devant le joueur ; quantité persistante."
    },
    {
      "id": "sys-repair",
      "category": "Survie",
      "title": "Réparer sous pression",
      "summary": "Restez au panneau pendant la manipulation. Bouger ou être attaqué interrompt le travail.",
      "text": "Restez près de la commande le temps de l’intervention. Bouger ou subir un contact interrompt la manipulation.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Durées 0,65 à 1,25 s ; état réversible jusqu’à la validation ; progression ordonnée."
    },
    {
      "id": "sys-circuit",
      "category": "Survie",
      "title": "Réseaux séparés",
      "summary": "Le choix local doit préserver le secours vital. Un mauvais branchement fait du bruit et ne valide rien.",
      "text": "Gardez le secours local séparé du réseau compromis. Une erreur fait du bruit, mais vous pouvez reprendre la manipulation.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Trois choix contextualisés, validation par identifiant et non index visuel ; dialogue en pause pour lecture accessible."
    },
    {
      "id": "sys-depth",
      "category": "Survie",
      "title": "Couloirs et travées",
      "summary": "Les grands espaces se parcourent aussi d’avant en arrière. Les passages étroits reviennent à une vue latérale.",
      "text": "Dans une travée, avancez ou reculez pour contourner une masse. Dans un passage étroit, il faudra surtout choisir entre avancer et faire demi-tour.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Coordonnée y au sol 0–180, profil verrouillé à 88. Tri de profondeur sur le pied pour toutes les masses."
    },
    {
      "id": "sys-doors",
      "category": "Survie",
      "title": "Une porte, un lieu",
      "summary": "Chaque porte nomme sa destination. Les ascenseurs changent le niveau ; le Samson relie le sol et l’orbite.",
      "text": "Chaque porte mène à une autre pièce. Le passage emprunté à l’aller reste votre repère au retour, sauf lorsqu’un incident le condamne.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Graphe à liens explicites, points d’arrivée réciproques, pas de téléportation de chapitre."
    },
    {
      "id": "sys-carry",
      "category": "Survie",
      "title": "La cellule",
      "summary": "Porter la cellule ralentit le déplacement et empêche le sprint. La charge est visible.",
      "text": "La cellule ralentit celui qui la porte. Rejoignez son berceau avant de reprendre un déplacement rapide.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Identité conservée entre portes ; installation requiert la prise préalable."
    },
    {
      "id": "sys-journal",
      "category": "Survie",
      "title": "Le carnet de bord",
      "summary": "Le carnet conserve les lieux visités et l’ordre des opérations. Il peut être consulté à l’arrêt.",
      "text": "Le carnet rassemble ce qui a été découvert. Le plan et les notes permettent de préparer la suite sans laisser la menace avancer pendant la lecture.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Pause réelle ; aucune progression de menace pendant la lecture."
    },
    {
      "id": "sys-checkpoint",
      "category": "Survie",
      "title": "Point de reprise",
      "summary": "La progression se conserve après une action ou une porte. Une perte de connaissance permet de reprendre.",
      "text": "Le carnet conserve les interventions terminées et les passages franchis. Vous pouvez aussi en exporter une copie depuis les réglages.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Sauvegarde dédiée, versionnée, taille limitée, nombres bornés, écriture sous try/catch."
    },
    {
      "id": "sys-noise",
      "category": "Survie",
      "title": "Bruits utiles",
      "summary": "Regardez la conduite, le contacteur et les pieds de la créature. Le son aide, mais rien ne dépend uniquement de lui.",
      "text": "Les signaux sonores sont facultatifs. Les indications du bord signalent aussi une présence proche lorsque le son est coupé.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Audio de synthèse original facultatif ; témoins de présence et messages équivalents."
    },
    {
      "id": "sys-camera",
      "category": "Survie",
      "title": "Lire la pièce",
      "summary": "La caméra suit sans tourner le ciel. Les objets de premier plan s’effacent près du personnage.",
      "text": "Repérez d’abord la sortie et les masses qui coupent la vue. Une grande salle n’est utile que si vous savez comment la traverser.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Aucun HUD sur le canvas ; cadrage horizontal borné au secteur ; calques déterministes."
    },
    {
      "id": "sys-eggs",
      "category": "Survie",
      "title": "Niches d’incubation",
      "summary": "Contourner un œuf évite une mauvaise rencontre. Approcher une niche active un avertissement avant l’éclosion.",
      "text": "Un œuf déjà ouvert ne se referme pas quand vous quittez la salle. Gardez la trace des niches dont la membrane a cédé.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Proximité et délai, une naissance par œuf, état enregistré entre visites."
    },
    {
      "id": "sys-ash",
      "category": "Survie",
      "title": "Le réseau compromis",
      "summary": "Une confirmation affichée à l’écran n’est pas une preuve de fermeture. Cherchez le verrou physique.",
      "text": "Ash agit par les systèmes. Isoler une commande est parfois plus utile que la remettre immédiatement sous tension.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "Pannes annoncées et choix de circuits ; pas de contrôle omnipotent du personnage."
    },
    {
      "id": "sys-map",
      "category": "Survie",
      "title": "Le plan du site",
      "summary": "Le plan différencie les pièces découvertes, les portes fermées et les changements de niveau.",
      "text": "Le plan indique le premier passage vers l’objectif. Il ne permet pas de traverser à distance un secteur encore dangereux.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "La cible suivante et le premier passage à prendre sont calculés dans le graphe actif."
    },
    {
      "id": "sys-ending",
      "category": "Survie",
      "title": "Quitter les ombres",
      "summary": "La dernière transmission termine cette chronique, sans inventer une réponse de secours.",
      "text": "Le dernier appel de Hoop n’obtient pas de réponse dans cette chronique. Ne confondez pas une transmission réussie avec la confirmation d’un sauvetage.",
      "unlockRoom": null,
      "sourceStatus": "game-design",
      "sources": [],
      "productionNote": "La conclusion littéraire est distincte des futures variantes originales de Tantalus Frontier."
    },
    {
      "id": "room-rec",
      "category": "Lieux",
      "title": "BeeBee’s — carré de repos",
      "summary": "Le comptoir, les tables et le passe-plats laissent une allée centrale. Deux accès rejoignent la coursive et l’atelier.",
      "text": "Les deux issues se rejoignent sur le plan. Le mobilier laisse libre la voie de circulation.",
      "unlockRoom": "rec",
      "sourceStatus": "original-layout"
    },
    {
      "id": "room-maintenance",
      "category": "Lieux",
      "title": "Galerie des auxiliaires",
      "summary": "Un chemin technique relie la machinerie à la baie des serveurs. Le collecteur possède une vanne locale et une fuite temporisée.",
      "text": "Les deux issues se rejoignent sur le plan. Le mobilier laisse libre la voie de circulation.",
      "unlockRoom": "maintenance",
      "sourceStatus": "original-layout"
    },
    {
      "id": "room-drain",
      "category": "Lieux",
      "title": "Canal de décantation",
      "summary": "Une dérivation humide relie le roulage au pompage. Le passage avant contourne les conduites sous pression.",
      "text": "Les deux issues se rejoignent sur le plan. Le mobilier laisse libre la voie de circulation.",
      "unlockRoom": "drain",
      "sourceStatus": "original-layout"
    },
    {
      "id": "room-alcove",
      "category": "Lieux",
      "title": "Alcôve des vestiges",
      "summary": "Un renfoncement derrière les structures costales. Une ouverture rejoint le contournement ; aucune installation humaine dans la paroi.",
      "text": "Les deux issues se rejoignent sur le plan. Le mobilier laisse libre la voie de circulation.",
      "unlockRoom": "alcove",
      "sourceStatus": "original-layout"
    },
    {
      "id": "marion-note-01",
      "category": "Traces",
      "title": "Une chaise de trop",
      "summary": "Baxter a laissé une tasse derrière le comptoir. Le fond a séché. Il faudra lui rappeler de dormir avant sa prochaine garde.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-01",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-02",
      "category": "Traces",
      "title": "La même chanson",
      "summary": "Le lecteur saute toujours au même endroit. Personne ne le répare : pour une fois, quelque chose à bord nous prévient avant de se répéter.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-02",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-03",
      "category": "Traces",
      "title": "Liste de quart",
      "summary": "Relais minier : sans réponse. Demande de vérification transmise. Ne pas effacer la dernière heure de réception.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-03",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-04",
      "category": "Traces",
      "title": "Retour de courant",
      "summary": "Une ligne coupée au pupitre peut rester alimentée par le secours. Isoler ici avant de toucher au contacteur.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-04",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-05",
      "category": "Traces",
      "title": "Un ordre en double",
      "summary": "La même demande de redémarrage est revenue avec deux identifiants. Le collecteur, lui, n’a qu’une seule vanne.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-05",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-06",
      "category": "Traces",
      "title": "Priorité au patient",
      "summary": "Le pupitre distant n’a pas à décider qui entre dans l’unité. Garder le contrôle local tant que le réseau reste incertain.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-06",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-07",
      "category": "Traces",
      "title": "Outils de travail",
      "summary": "Ce matériel n’a jamais été prévu pour tenir une ligne de défense. Les réservoirs sont petits. Les recharges le sont aussi.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-07",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-08",
      "category": "Traces",
      "title": "Avant le départ",
      "summary": "Retirer l’assistance du réseau. Contrôler les attaches. Attendre le signal de la soute. Le pilote veut entendre des voix, pas des voyants.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-08",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-09",
      "category": "Traces",
      "title": "Poussière sur les balises",
      "summary": "La balise orientale disparaît quand le vent tourne. Garder le bâtiment dans le dos jusqu’au premier abri.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-09",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-10",
      "category": "Traces",
      "title": "Le second chemin",
      "summary": "Le collecteur est bruyant mais sa dérivation rejoint le roulage. Si la pompe tombe, ne pas revenir sous la conduite.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-10",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-11",
      "category": "Traces",
      "title": "Niveau haut",
      "summary": "Les marques sur la paroi sont au-dessus de nos genoux. Ce n’est pas le ruissellement d’aujourd’hui.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-11",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-12",
      "category": "Traces",
      "title": "Il reste une réserve",
      "summary": "Le casier de terrain contient ce qu’il reste du dernier quart. Prendre seulement ce qu’on peut porter.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-12",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-13",
      "category": "Traces",
      "title": "Un bruit sans machine",
      "summary": "La foreuse était arrêtée. J’ai encore senti les vibrations dans les semelles.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-13",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-14",
      "category": "Traces",
      "title": "Ce ne sont pas nos os",
      "summary": "Les proportions ne correspondent à rien dans les fiches du bord. Ne pas donner de nom à ce qu’on n’a pas compris.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-14",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-15",
      "category": "Traces",
      "title": "Un passage sans outil",
      "summary": "La paroi s’incurve vers une seconde ouverture. Pas de serrure, pas de commande : seulement une brèche assez large pour passer.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-15",
      "sourceStatus": "original-writing"
    },
    {
      "id": "marion-note-16",
      "category": "Traces",
      "title": "Près de la caisse",
      "summary": "Jones est là. Le compartiment est calme. Fermer derrière soi, doucement.",
      "text": "Transcription conservée dans le carnet personnel.",
      "unlockRecord": "marion-note-16",
      "sourceStatus": "original-writing"
    },
    {
      "id": "cast-jordan",
      "category": "Équipage",
      "title": "Lucy Jordan",
      "summary": "Commandement du Marion",
      "text": "Le relais local et les équipes de quart passent par la passerelle.",
      "unlockRoom": "bridge",
      "sourceStatus": "source-character"
    },
    {
      "id": "survival-hide-junction",
      "category": "Survie",
      "title": "Renfoncement des gaines",
      "summary": "Une cachette repérée dans Coursive des équipages.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "junction"
    },
    {
      "id": "survival-hide-engineering",
      "category": "Survie",
      "title": "Baie de maintenance",
      "summary": "Une cachette repérée dans Distribution électrique.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "engineering"
    },
    {
      "id": "survival-hide-samson",
      "category": "Survie",
      "title": "Renfoncement entre les berceaux",
      "summary": "Une cachette repérée dans Samson — soute.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "samson"
    },
    {
      "id": "survival-hide-haul",
      "category": "Survie",
      "title": "Abri de signalisation",
      "summary": "Une cachette repérée dans Galerie de roulage.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "haul"
    },
    {
      "id": "survival-hide-pump",
      "category": "Survie",
      "title": "Niche du collecteur",
      "summary": "Une cachette repérée dans Station de pompage.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "pump"
    },
    {
      "id": "survival-hide-vein",
      "category": "Survie",
      "title": "Baie du convoyeur",
      "summary": "Une cachette repérée dans Front de trimonite.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "vein"
    },
    {
      "id": "survival-hide-vestibule",
      "category": "Survie",
      "title": "Renfoncement des nervures",
      "summary": "Une cachette repérée dans Épave enfouie — seuil.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "vestibule"
    },
    {
      "id": "survival-hide-fossils",
      "category": "Survie",
      "title": "Creux derrière les vestiges",
      "summary": "Une cachette repérée dans Chambre des vestiges.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "fossils"
    },
    {
      "id": "survival-hide-hold",
      "category": "Survie",
      "title": "Alcôve de quarantaine",
      "summary": "Une cachette repérée dans Soute de quarantaine.",
      "text": "Restez près du renfoncement, maintenez E, puis attendez. Un mouvement vous fait ressortir. L’entrée est refusée sous le regard d’une créature. Le point n’est pas une invulnérabilité permanente.",
      "unlockRoom": "hold"
    },
    {
      "id": "survival-companion-orders",
      "category": "Survie",
      "title": "Personne derrière la porte",
      "summary": "G alterne entre suivre et attendre.",
      "text": "Le compagnon rejoint le seuil avant de traverser. À plus de 240 unités, le passage est retardé. Il n’est pas téléporté depuis une autre pièce. Après un ordre d’attente, revenez dans sa salle pour le rappeler."
    },
    {
      "id": "survival-local-light",
      "category": "Survie",
      "title": "La lumière vous expose",
      "summary": "La posture, la lampe, les éclairages locaux et le bruit influencent la détection.",
      "text": "Une source de lumière n’éclaire pas toute une salle de façon uniforme. Coupez votre lampe, accroupissez-vous et placez une masse entre vous et la créature. L’indication de présence ne donne pas sa position exacte."
    },
    {
      "id": "survival-attack-windup",
      "category": "Survie",
      "title": "Le bref recul",
      "summary": "Une attaque est annoncée avant le contact.",
      "text": "La créature prend appui avant de frapper. Sortez de portée pendant ce bref délai. Une flamme ou un obstacle coupe l’attaque ; l’esquive ne garantit pas la fuite suivante."
    },
    {
      "id": "survival-chart",
      "category": "Survie",
      "title": "Un plan incomplet",
      "summary": "La carte s’écrit pendant le déplacement.",
      "text": "Seules les pièces visitées sont nommées. Un accès observé peut signaler une zone inconnue, mais ne livre ni son contenu ni ses sorties. Les détours non observés ne sont pas dessinés."
    },
    {
      "id": "system-light-junction",
      "category": "Survie",
      "title": "Éclairage de la coursive",
      "summary": "Isoler les rampes de la coursive ; le balisage de secours reste alimenté.",
      "text": "Maintenez E devant le coffret pour isoler ou rétablir les rampes. Le balisage de secours reste visible. Votre lampe demeure indépendante. Ce commutateur ne valide aucun objectif."
    },
    {
      "id": "system-light-engineering",
      "category": "Survie",
      "title": "Rampes des auxiliaires",
      "summary": "Commande d’éclairage distincte de la distribution des objectifs.",
      "text": "Maintenez E devant le coffret pour isoler ou rétablir les rampes. Le balisage de secours reste visible. Votre lampe demeure indépendante. Ce commutateur ne valide aucun objectif."
    },
    {
      "id": "system-light-workshop",
      "category": "Survie",
      "title": "Éclairage de l’atelier",
      "summary": "Permet de contrôler localement les rampes sans interrompre le chalumeau.",
      "text": "Maintenez E devant le coffret pour isoler ou rétablir les rampes. Le balisage de secours reste visible. Votre lampe demeure indépendante. Ce commutateur ne valide aucun objectif."
    },
    {
      "id": "system-light-haul",
      "category": "Survie",
      "title": "Rampes de roulage",
      "summary": "Conserver la signalétique et couper seulement les rampes de la galerie.",
      "text": "Maintenez E devant le coffret pour isoler ou rétablir les rampes. Le balisage de secours reste visible. Votre lampe demeure indépendante. Ce commutateur ne valide aucun objectif."
    },
    {
      "id": "system-light-pump",
      "category": "Survie",
      "title": "Éclairage du pompage",
      "summary": "Commande hors de la zone de pression ; indépendante des vannes.",
      "text": "Maintenez E devant le coffret pour isoler ou rétablir les rampes. Le balisage de secours reste visible. Votre lampe demeure indépendante. Ce commutateur ne valide aucun objectif."
    },
    {
      "id": "system-light-hold",
      "category": "Survie",
      "title": "Rampes de la soute",
      "summary": "Circuit de lumière indépendant de la fermeture de confinement.",
      "text": "Maintenez E devant le coffret pour isoler ou rétablir les rampes. Le balisage de secours reste visible. Votre lampe demeure indépendante. Ce commutateur ne valide aucun objectif."
    },
    {
      "id": "system-noise-workshop",
      "category": "Survie",
      "title": "Compresseur d’essai",
      "summary": "Relancer un compresseur fixé à l’établi pour couvrir le déplacement.",
      "text": "Maintenez E pour lancer un cycle de dix secondes. La machine attire un adulte qui ne vous voit pas ; elle ne masque pas un contact direct à très courte portée. Dix-huit secondes de refroidissement suivent le cycle. Aucun leurre portatif n’est consommé."
    },
    {
      "id": "system-noise-haul",
      "category": "Survie",
      "title": "Vibreur de trémie",
      "summary": "Déclenche un essai sonore à la trémie, sans modifier les objectifs.",
      "text": "Maintenez E pour lancer un cycle de dix secondes. La machine attire un adulte qui ne vous voit pas ; elle ne masque pas un contact direct à très courte portée. Dix-huit secondes de refroidissement suivent le cycle. Aucun leurre portatif n’est consommé."
    },
    {
      "id": "system-noise-pump",
      "category": "Survie",
      "title": "Cycle de rinçage",
      "summary": "Une pompe en dérivation peut détourner un adulte hors de sa ligne de vue.",
      "text": "Maintenez E pour lancer un cycle de dix secondes. La machine attire un adulte qui ne vous voit pas ; elle ne masque pas un contact direct à très courte portée. Dix-huit secondes de refroidissement suivent le cycle. Aucun leurre portatif n’est consommé."
    },
    {
      "id": "system-noise-drain",
      "category": "Survie",
      "title": "Soufflante de décantation",
      "summary": "Lancer dix secondes de soufflerie, puis attendre son refroidissement.",
      "text": "Maintenez E pour lancer un cycle de dix secondes. La machine attire un adulte qui ne vous voit pas ; elle ne masque pas un contact direct à très courte portée. Dix-huit secondes de refroidissement suivent le cycle. Aucun leurre portatif n’est consommé."
    },
    {
      "id": "survival-trail",
      "category": "Survie",
      "title": "La porte derrière vous",
      "summary": "Une sortie repérée peut être suivie.",
      "text": "Un adulte alerté peut marcher jusqu’à une ouverture et la franchir. Il n’apprend pas votre position après votre départ. Gagner une pièce supplémentaire ou se cacher peut lui faire perdre votre trace. Les ascenseurs, navettes et espaces de répit ne sont pas traversés par cette poursuite."
    },
    {
      "id": "survival-bulkhead",
      "category": "Survie",
      "title": "Retenir une cloison",
      "summary": "Maintenir B devant un seuil équipé.",
      "text": "Le verrou mécanique tient quatorze secondes sans pression. Un adulte qui atteint la cloison peut la forcer en cinq secondes et demie ; le mécanisme reste alors endommagé trente-cinq secondes. B permet de rouvrir et E offre une libération de secours. Attendez le passage de votre compagnon avant de fermer."
    },
    {
      "id": "survival-services",
      "category": "Survie",
      "title": "Lire les services locaux",
      "summary": "K ouvre un relevé, sans télécommande.",
      "text": "Le tableau liste seulement les commandes de la pièce et les cloisons observées. Lumières et machines se manipulent sur place. Les délais s’arrêtent pendant la lecture des menus."
    },
    {
      "id": "survival-persist-hunt",
      "category": "Survie",
      "title": "Reprendre sous pression",
      "summary": "Le carnet conserve les délais restants.",
      "text": "L’import conserve les verrous, les commandes et la traversée d’un adulte en cours. Il ne crée pas un deuxième spécimen. Les anciennes sauvegardes sans ces données restent acceptées."
    },
    {
      "id": "oth-v05-01",
      "category": "Survie",
      "title": "Écouter sans radar",
      "summary": "Maintenez V : le personnage s’arrête pour distinguer les bruits.",
      "text": "La simulation continue. Les indications donnent une direction approximative, pas une position ni un nombre de créatures. Relâchez V avant de marcher ou d’agir."
    },
    {
      "id": "oth-v05-02",
      "category": "Survie",
      "title": "Un seuil transmet le bruit",
      "summary": "Une machine ou un leurre peut attirer une présence depuis la pièce voisine.",
      "text": "Seuls les treize passages de traque autorisés transmettent cette enquête. Un adulte déjà instancié peut rejoindre le seuil ; aucun ennemi supplémentaire n’est créé par le son."
    },
    {
      "id": "oth-v05-03",
      "category": "Survie",
      "title": "Une seule pièce de portée",
      "summary": "Le bruit ne fournit pas de chemin jusqu’à votre nouvelle position.",
      "text": "L’enquête mémorise le lieu du bruit au moment où il a été perçu. Elle ne propage pas le signal à une deuxième pièce. Une cloison fermée bloque le départ de cette enquête sonore."
    },
    {
      "id": "oth-v05-04",
      "category": "Survie",
      "title": "Le bruit couvre le bruit",
      "summary": "Un moteur lancé peut masquer des pas pendant l’écoute.",
      "text": "Le ronflement dominant empêche de distinguer les contacts plus faibles dans sa portée. Couper la lampe n’arrête pas une machine ; attendez la fin du cycle."
    },
    {
      "id": "oth-v05-05",
      "category": "Survie",
      "title": "Ne répétez pas le même piège",
      "summary": "Un adulte retient temporairement les emplacements des faux signaux qu’il a inspectés.",
      "text": "Après deux inspections achevées dans une même bande de sol, un nouveau leurre à cet endroit est ignoré. Déplacez la diversion. Ce souvenir s’efface après quatre-vingts secondes de simulation."
    },
    {
      "id": "oth-v05-06",
      "category": "Survie",
      "title": "Un leurre ne rend pas invisible",
      "summary": "Une cible directement vue reste prioritaire sur un faux signal.",
      "text": "Rompez d’abord le regard, puis utilisez la diversion. La flamme peut toujours interrompre une attaque ; la mémoire des leurres ne réduit pas cet effet."
    },
    {
      "id": "oth-v05-07",
      "category": "Survie",
      "title": "Un lancer, une charge",
      "summary": "R maintenu ne vide plus automatiquement votre réserve.",
      "text": "Relâchez puis appuyez à nouveau pour un deuxième lancer. Le petit boîtier s’arrête devant un obstacle solide ; il ne peut plus atterrir à travers un meuble."
    },
    {
      "id": "oth-v05-08",
      "category": "Survie",
      "title": "Le signal reste sur place",
      "summary": "Un leurre conserve son cycle après votre départ de la pièce.",
      "text": "Les cinq secondes continuent hors champ. Son emplacement reste celui du lancer. Le bruit peut engager une enquête voisine, mais ne vous suit pas au passage."
    },
    {
      "id": "oth-v05-09",
      "category": "Traces",
      "title": "Les boîtiers épuisés",
      "summary": "Un leurre terminé laisse son boîtier au sol.",
      "text": "Le boîtier est un repère visuel persistant, pas une nouvelle munition récupérable. Douze traces au maximum sont gardées dans chaque pièce, les plus anciennes étant retirées."
    },
    {
      "id": "oth-v05-10",
      "category": "Traces",
      "title": "Traces de chaleur",
      "summary": "Le chalumeau laisse une marque sombre sur le sol proche.",
      "text": "Ces traces changent le décor, pas les collisions et pas les dégâts. Elles ne constituent pas une nappe de feu ni une réserve de carburant."
    },
    {
      "id": "oth-v05-11",
      "category": "Traces",
      "title": "Griffures sur le verrou",
      "summary": "Une rupture de cloison marque les deux faces du passage.",
      "text": "Les marques subsistent au-delà du réarmement. La porte conserve les durées mécaniques de son verrou ; la trace seule ne la condamne pas."
    },
    {
      "id": "oth-v05-12",
      "category": "Survie",
      "title": "Un avertissement à voix basse",
      "summary": "Un compagnon proche remarque une menace dans sa ligne de vue.",
      "text": "Son avertissement est local et temporisé, pas une connaissance de toutes les pièces. À l’arrêt ou accroupi, il prend une posture prudente ; quand vous vous éloignez, il continue de suivre."
    },
    {
      "id": "oth-v05-13",
      "category": "Survie",
      "title": "Attendre reste un ordre",
      "summary": "Un compagnon laissé sur place ne part pas seul au bruit.",
      "text": "Il peut se baisser face à une menace visible, sans quitter son poste. Revenez dans sa pièce pour modifier son ordre. Les issues narratives ne sont pas modifiées."
    },
    {
      "id": "oth-v05-14",
      "category": "Survie",
      "title": "Journal acoustique",
      "summary": "Le carnet peut relever les sons que vous avez vous-même produits.",
      "text": "Le relevé affiche la pièce connue et le type de bruit. Il ne confirme pas qu’une créature l’a entendu. Les traces de terrain sont enregistrées séparément des objectifs."
    },
    {
      "id": "oth-v05-15",
      "category": "Survie",
      "title": "Écoute accessible",
      "summary": "Les indications visuelles restent présentes lorsque le son est coupé.",
      "text": "Le bouton V des commandes tactiles utilise la même action que le clavier. Les panneaux de lecture arrêtent les sons simulés, les enquêtes et les cycles."
    },
    {
      "id": "oth-v05-16",
      "category": "Survie",
      "title": "Votre regard ne traverse pas les murs",
      "summary": "Les compagnons n’annoncent que des menaces qu’ils peuvent voir.",
      "text": "Les obstacles solides coupent leur ligne de vue. L’écoute, en revanche, peut percevoir un mouvement étouffé à un seuil proche sans en révéler le nom."
    },
    {
      "id": "oth-v06-01",
      "title": "Les pièces du Marion",
      "category": "Matériel",
      "summary": "Huit casiers de maintenance sont dispersés dans les installations humaines.",
      "text": "Chaque casier livre trois pièces une seule fois. Les composants sont distincts du carburant et des leurres. Aucun objectif principal ne demande cette réserve.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-02",
      "title": "Un détour, pas une obligation",
      "category": "Survie",
      "summary": "Les trois nouvelles liaisons sont facultatives.",
      "text": "Le chemin principal reste praticable sans pièce ni réparation. Le puits endommagé et les fenêtres de navette ne sont pas contournés par ces travaux.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-03",
      "title": "Remettre une porte en service",
      "category": "Matériel",
      "summary": "Déposer, remplacer, tester : trois gestes séparés.",
      "text": "Maintenir E au seuil. Relâcher entre deux étapes. La seconde consomme trois pièces uniquement lorsqu’elle se termine ; une interruption avant ce terme ne coûte rien.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-04",
      "title": "Un travail partagé entre deux faces",
      "category": "Matériel",
      "summary": "Le même mécanisme dessert les deux côtés d’une liaison.",
      "text": "L’étape validée est conservée. Reprendre depuis l’autre côté continue le même travail, sans deuxième paiement ni porte indépendante.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-05",
      "title": "Le bruit de l’outil",
      "category": "Survie",
      "summary": "Réparer ne met pas la pièce en pause.",
      "text": "Le mouvement, une flamme, un coup reçu ou une interruption casse le geste en cours. Les étapes terminées restent acquises ; un bruit de machine est émis pendant le travail.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-06",
      "title": "Réassembler plutôt que fabriquer à distance",
      "category": "Matériel",
      "summary": "L’établi du Marion et celui de la concession réemploient les pièces.",
      "text": "Approcher de l’établi puis E donne accès aux trois recettes. Le sac ouvert ailleurs n’est pas une station de fabrication. Le panneau met le monde en pause pendant le choix.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-07",
      "title": "Garder des composants pour le retour",
      "category": "Survie",
      "summary": "Neuf pièces suffisent aux trois portes ; vingt-quatre sont récupérables au total.",
      "text": "Les recettes partagent cette réserve finie. Il n’y a pas de recyclage infini. Dépenser toutes ses pièces ferme certaines options de maintenance, jamais la progression principale.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-08",
      "title": "Pas de perte au plafond",
      "category": "Matériel",
      "summary": "Une recette est refusée lorsque son résultat dépasserait la capacité.",
      "text": "Vider d’abord un emplacement ou utiliser un consommable. Le refus ne consomme aucune pièce. Les kits, leurres et carburant gardent leurs limites antérieures.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "oth-v06-09",
      "title": "Coursive sanitaire",
      "category": "Lieux",
      "summary": "Un passage humain relie BeeBee’s à l’infirmerie.",
      "text": "Disposition originale pour cette adaptation. Le seuil n’est utilisable qu’après une réparation complète, quelle que soit la face choisie.",
      "sourceStatus": "original-gameplay",
      "unlockRoom": "rec"
    },
    {
      "id": "oth-v06-10",
      "title": "Liaison de manutention",
      "category": "Lieux",
      "summary": "La desserte de chariots relie l’atelier au hangar.",
      "text": "La disponibilité respecte le chapitre d’ouverture. Elle ne libère ni le Narcissus ni les étapes d’embarquement.",
      "sourceStatus": "original-gameplay",
      "unlockRoom": "workshop"
    },
    {
      "id": "oth-v06-11",
      "title": "Traverse de décantation",
      "category": "Lieux",
      "summary": "Une liaison supplémentaire rejoint le front de trimonite.",
      "text": "Un adulte peut y enquêter ou suivre un passage lorsque la porte est remise en service. Une traverse fermée n’émet aucune information magique.",
      "sourceStatus": "original-gameplay",
      "unlockRoom": "drain"
    },
    {
      "id": "oth-v06-12",
      "title": "Le relevé de proximité",
      "category": "Survie",
      "summary": "Le plan local situe vos pieds, le mobilier et les accès déjà observés.",
      "text": "Il ne place aucun ennemi. Les commandes et casiers apparaissent après observation de proximité ; une destination inconnue n’est pas nommée avant la visite.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "v07-note-1",
      "category": "Traces",
      "title": "Trait de niveau",
      "summary": "Note retrouvée dans la boucle des échangeurs.",
      "text": "Le trait le plus haut date d’avant l’arrêt du convoyeur. Personne n’a voulu noter le premier débordement. J’ai laissé le volant rouge fermé à moitié ; les deux conduites ne doivent plus débiter ensemble.",
      "unlockRecord": "v07-note-1"
    },
    {
      "id": "v07-note-2",
      "category": "Traces",
      "title": "Consigne effacée",
      "summary": "Note retrouvée dans la boucle des échangeurs.",
      "text": "Le groupe ne sert qu’à vider les caniveaux. Une fois lancé, il s’arrête au niveau bas. Le témoin du passage de service partage son contact : impossible de l’ouvrir tant que le seuil baigne.",
      "unlockRecord": "v07-note-2"
    },
    {
      "id": "v07-note-3",
      "category": "Traces",
      "title": "Mémoire locale",
      "summary": "Note retrouvée dans la boucle des échangeurs.",
      "text": "On me demande chaque matin un relevé propre. La concession tourne avec du matériel qui oublie l’heure dès qu’une ligne tombe. Je garde donc le boîtier témoin hors du réseau.",
      "unlockRecord": "v07-note-3"
    },
    {
      "id": "v07-note-4",
      "category": "Traces",
      "title": "Inventaire des prélèvements",
      "summary": "Note retrouvée dans la boucle des échangeurs.",
      "text": "Les cylindres contiennent de la roche, pas des réponses. L’équipe a descendu un autre appareil vers le front de taille. Je conserve son dernier relevé dans l’armoire, à l’abri de l’eau.",
      "unlockRecord": "v07-note-4"
    },
    {
      "id": "v07-pump-record",
      "category": "Traces",
      "title": "Le relevé des heures perdues",
      "summary": "Copie locale de l’enregistreur de la concession.",
      "text": "Deux coupures successives ont désynchronisé les pompes et le convoyeur. Le boîtier n’enregistre ni voix ni image : seulement un arrêt, une reprise trop courte, puis le contact de niveau. Hoop annote la copie : « Au moins, cette fois, on saura pourquoi ça s’est arrêté. »",
      "unlockRecord": "v07-pump-record"
    },
    {
      "id": "v07-place-return_gallery",
      "category": "Lieux",
      "title": "Galerie de retour",
      "summary": "Une conduite rompue remplit le caniveau de retour. La coursive arrière reste praticable ; au premier plan, les pas brassent une eau chargée de poussière.",
      "text": "Détour facultatif original. Les circulations et équipements sont propres à cette adaptation, pas des plans officiels du roman.",
      "unlockRoom": "return_gallery"
    },
    {
      "id": "v07-place-exchanger",
      "category": "Lieux",
      "title": "Salle des échangeurs",
      "summary": "Deux échangeurs occupent les bandes de stockage. Les commandes restent sur la passerelle ; le caniveau inondé descend au premier plan. Le témoin de pompage mesure le cycle réel.",
      "text": "Détour facultatif original. Les circulations et équipements sont propres à cette adaptation, pas des plans officiels du roman.",
      "unlockRoom": "exchanger"
    },
    {
      "id": "v07-place-survey",
      "category": "Lieux",
      "title": "Poste de relevé",
      "summary": "Un poste étroit isolé du bruit des pompes : écrans de niveaux, chemin de câbles et console d’enregistrement. Le lecteur reçoit un boîtier récupéré, pas un téléchargement à distance.",
      "text": "Détour facultatif original. Les circulations et équipements sont propres à cette adaptation, pas des plans officiels du roman.",
      "unlockRoom": "survey"
    },
    {
      "id": "v07-place-specimen_store",
      "category": "Lieux",
      "title": "Réserve des prélèvements",
      "summary": "Des carottes minérales sous verre et une armoire d’enregistreurs. Aucun œuf extraterrestre n’y est exposé. L’armoire isolée reste verrouillée jusqu’au retour d’un niveau sec.",
      "text": "Détour facultatif original. Les circulations et équipements sont propres à cette adaptation, pas des plans officiels du roman.",
      "unlockRoom": "specimen_store"
    },
    {
      "id": "v07-rule-0",
      "category": "Survie",
      "title": "Travailler sans suspendre le monde",
      "summary": "Le maintien E près des commandes ne suspend pas les menaces. Un déplacement, un coup, une flamme ou une écoute interrompt le geste incomplet. Les étapes terminées sont gardées.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "v07-rule-1",
      "category": "Survie",
      "title": "Cycle de niveau",
      "summary": "Dix-huit secondes de simulation après le démarrage. Les deux caniveaux descendent ensemble ; les lectures mettent aussi le cycle en pause. Une sortie de salle ne le remet pas à zéro.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "v07-rule-2",
      "category": "Survie",
      "title": "Passer par la bande sèche",
      "summary": "La bande avant inondée ralentit et rend les pas bruyants. La bande arrière reste sèche. L’eau n’inflige aucun dommage de noyade et ne crée aucune créature.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "v07-rule-3",
      "category": "Survie",
      "title": "Boîtier sanglé",
      "summary": "Le boîtier récupéré est transporté au dos. Il réduit l’allure et empêche le sprint jusqu’au lecteur. Un support local permet de le poser et de revenir le reprendre.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "v07-rule-4",
      "category": "Survie",
      "title": "Relevé facultatif",
      "summary": "Le pompage ouvre une liaison de service. La copie du boîtier ajoute un document, pas un objet obligatoire ni une nouvelle conclusion au récit principal.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "v07-rule-5",
      "category": "Survie",
      "title": "Compagnon sur passerelle",
      "summary": "Un accompagnant traverse les nouvelles liaisons selon son ordre précédent. Le poste de relevé offre une pause tactique mais pas une nouvelle issue narrative.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "v07-rule-6",
      "category": "Survie",
      "title": "Cartographie du caniveau",
      "summary": "Le plan de la salle courante indique la zone humide et son niveau. Il ne révèle pas les adultes hors de vue ni les pièces non visitées.",
      "text": "Règle de jeu originale introduite dans la V0.7."
    },
    {
      "id": "sequence-marion",
      "category": "Chronique",
      "title": "Avant le silence",
      "summary": "Séquence du carnet, disponible après 0 interventions principales.",
      "text": "CARNET DU MARION — La mine ne répond plus. Le travail commence par une liaison à rétablir, pas par une arme à charger. HOOP — On vérifie les lignes une par une. Personne ne descend seul. REPRISE — Rejoignez la console de transmission. Les commandes du terrain restent celles de la chronique.",
      "unlockCompleted": 0
    },
    {
      "id": "sequence-delilah",
      "category": "Chronique",
      "title": "La Delilah",
      "summary": "Séquence du carnet, disponible après 5 interventions principales.",
      "text": "HOOP — La Delilah a frappé. La passerelle ne répond plus. Jordan ne répond plus. CARNET — Derrière les tôles disjointes, les voyants de secours remplacent les appels de la passerelle. HOOP — Il reste une voie dans les conduites. Ne touchez pas les bords de la brèche.",
      "unlockCompleted": 5
    },
    {
      "id": "sequence-ripley",
      "category": "Chronique",
      "title": "Une survivante",
      "summary": "Séquence du carnet, disponible après 9 interventions principales.",
      "text": "CARNET — L’écoutille du Narcissus est ouverte. Le silence de sa cabine ne ressemble pas à celui du Marion. RIPLEY — Avant de repartir, montrez-moi tous les accès de cette navette. HOOP — Nous commençons par l’atelier. Le matériel doit fonctionner sans le réseau.",
      "unlockCompleted": 9
    },
    {
      "id": "sequence-descent",
      "category": "Chronique",
      "title": "La route sous les nuages",
      "summary": "Séquence du carnet, disponible après 16 interventions principales.",
      "text": "CARNET — La commande de descente répond. Les balises de la concession deviennent les seuls repères. HOOP — Gardez cette fréquence. Nous en aurons besoin pour retrouver le retour. CARNET — Le transfert reste à effectuer par le passage de la navette. Cette séquence ne déplace pas le joueur.",
      "unlockCompleted": 16
    },
    {
      "id": "sequence-cage",
      "category": "Chronique",
      "title": "Le puits ne répond plus",
      "summary": "Séquence du carnet, disponible après 20 interventions principales.",
      "text": "CARNET — La cage termine sa course dans un bruit de métal. Le câble se tend, puis ne répond plus. HOOP — Cette cage ne remontera pas. Le second puits est notre seule sortie. CARNET — Le parcours de retour change. Le balisage minier reste à remettre en service.",
      "unlockCompleted": 20
    },
    {
      "id": "sequence-bones",
      "category": "Chronique",
      "title": "Ce qui était là avant",
      "summary": "Séquence du carnet, disponible après 27 interventions principales.",
      "text": "CARNET — Les faisceaux quittent la roche pour suivre des formes que la concession n’a pas construites. RIPLEY — Ces restes n’étaient pas humains. Nous devons quitter cette chambre. HOOP — Gardez la route de la mine derrière vous. Ne vous dispersez pas entre les nervures.",
      "unlockCompleted": 27
    },
    {
      "id": "sequence-baxter",
      "category": "Chronique",
      "title": "La seconde cage",
      "summary": "Séquence du carnet, disponible après 31 interventions principales.",
      "text": "HOOP — Baxter ! ... La cage continue de monter. Il n’est plus avec nous. CARNET — Le nom reste dans le registre. L’emplacement près de la grille reste vide. HOOP — Il faut encore la cellule de retour. Elle est dans le magasin.",
      "unlockCompleted": 31
    },
    {
      "id": "sequence-sneddon",
      "category": "Chronique",
      "title": "La dernière cloison",
      "summary": "Séquence du carnet, disponible après 39 interventions principales.",
      "text": "HOOP — Sneddon a condamné la soute de l’intérieur. Après l’éclair, plus aucun mouvement. CARNET — La quarantaine reste fermée. Les silhouettes cessent de se découper derrière le métal. HOOP — L’infirmerie est encore accessible. On continue par là.",
      "unlockCompleted": 39
    },
    {
      "id": "sequence-medical",
      "category": "Chronique",
      "title": "La commande détournée",
      "summary": "Séquence du carnet, disponible après 42 interventions principales.",
      "text": "CARNET — Le programme de l’unité est terminé. Ripley ne se réveille pas. HOOP — La commande vient de changer toute seule. Kasyanov ne répond plus. Je ramène Ripley au Narcissus. CARNET — Ripley doit être portée jusqu’à la navette. Cette évacuation se joue sur le terrain.",
      "unlockCompleted": 42
    },
    {
      "id": "sequence-ash",
      "category": "Chronique",
      "title": "La copie effacée",
      "summary": "Séquence du carnet, disponible après 44 interventions principales.",
      "text": "CARNET — La liaison extérieure est isolée. La purge locale ne reçoit plus de nouvelle copie. HOOP — La copie a disparu. Mais les attaches automatiques sont mortes avec elle. Je dois revenir au quai. CARNET — Le terminal ne répond plus aux ordres distants. Les verrous mécaniques attendent encore une main.",
      "unlockCompleted": 44
    },
    {
      "id": "sequence-release",
      "category": "Chronique",
      "title": "Le collier s’ouvre",
      "summary": "Séquence du carnet, disponible après 46 interventions principales.",
      "text": "HOOP — Le collier est ouvert. Le Narcissus s’éloigne. CARNET — Ripley et Jones restent à bord de la navette libérée. Le quai ne retient plus que ses attaches. HOOP — Le Samson. Il faut rejoindre sa radio.",
      "unlockCompleted": 46
    },
    {
      "id": "sequence-signal",
      "category": "Chronique",
      "title": "Aucune réponse",
      "summary": "Séquence du carnet, disponible après 48 interventions principales.",
      "text": "CARNET — L’appel de détresse a été émis. Le journal conserve la transmission. HOOP — Je répète le message sur la fréquence de secours. CARNET — Aucune réponse n’est confirmée. Le récit s’arrête ici ; le silence n’est pas une preuve de sauvetage.",
      "unlockCompleted": 48
    },
    {
      "id": "replay-v8",
      "category": "Survie",
      "title": "Une répétition n’efface pas la route",
      "summary": "Les chapitres enregistrés se rejouent dans un emplacement séparé.",
      "text": "Le carnet principal, ses points de reprise et ses entrées de chapitre ne sont pas écrasés en répétition. Les ressources et l’état du monde viennent du véritable instantané. Aucun ancien chapitre manquant n’est reconstruit automatiquement."
    },
    {
      "id": "sequences-v8",
      "category": "Survie",
      "title": "Reprendre le fil",
      "summary": "Les séquences sont facultatives et suspendent la simulation.",
      "text": "Entrée ou espace passe au tableau suivant ; Échap termine la séquence. Les textes sont originaux à cette adaptation. Désactiver leur ouverture automatique ne supprime ni objectifs, ni événements, ni accès à la galerie."
    },
    {
      "id": "v09-manutention",
      "category": "Survie",
      "title": "À bout de bras",
      "summary": "Approchez d’une poignée et maintenez X pour prendre la servante.",
      "text": "Les flèches ou les touches de marche poussent et tirent pendant X. Relâcher serre les freins. La simulation continue ; ni télécommande, ni remise en place magique."
    },
    {
      "id": "v09-deux-mains",
      "category": "Survie",
      "title": "Les deux mains prises",
      "summary": "Le chariot interdit le sprint et le chalumeau pendant la prise.",
      "text": "Une action incompatible libère les poignées. Il faut relâcher X avant de reprendre. Le portage d’une cellule, de Ripley ou de l’enregistreur empêche la prise."
    },
    {
      "id": "v09-butées",
      "category": "Survie",
      "title": "Un débattement balisé",
      "summary": "Le matériel ne quitte pas son aire de manutention.",
      "text": "Les limites, les meubles et les accès réservés arrêtent la translation. Ce système cinématique n’est pas une simulation libre de toute la masse du chariot."
    },
    {
      "id": "v09-vivants",
      "category": "Survie",
      "title": "Personne sous les roues",
      "summary": "Un corps sur le trajet empêche le déplacement.",
      "text": "Le compagnon et les créatures ne sont ni poussés, ni écrasés. Une attaque interrompt la prise. Seules les collisions et les lignes de vue sont modifiées par la benne."
    },
    {
      "id": "v09-roues",
      "category": "Survie",
      "title": "Les roues résonnent",
      "summary": "Déplacer une benne fait du bruit, même lentement.",
      "text": "Les grincements peuvent lancer une enquête dans la pièce voisine autorisée, à partir d’un adulte déjà présent. Une benne immobile ne produit pas ce bruit."
    },
    {
      "id": "v09-itinéraire-mobile",
      "category": "Survie",
      "title": "Un autre chemin",
      "summary": "Les corps contournent la position actuelle du matériel.",
      "text": "Le graphe de contournement est recalculé si le chariot bouge. La position est propre au carnet de campagne ou de répétition ; les plans de production indiquent seulement le stationnement initial."
    },
    {
      "id": "v09-cartes-mobiles",
      "category": "Matériel",
      "title": "Relevé de manutention",
      "summary": "N affiche les chariots observés et leur position actuelle.",
      "text": "Le panneau ne déplace rien. Le plan M dessine leur emprise, sans révéler les ennemis. Une silhouette occultée à l’écran ne change pas la solidité réelle de la benne."
    },
    {
      "id": "v09-freins",
      "category": "Matériel",
      "title": "Freins de retenue",
      "summary": "Relâcher X bloque la servante à son emplacement.",
      "text": "Une pause, une perte de focus, une reprise de carnet ou un changement de session rendent aussi les mains libres. Le matériel ne revient pas automatiquement à son ancien emplacement."
    },
    {
      "id": "v09-workshop-cart",
      "category": "Matériel",
      "title": "Servante de l’atelier",
      "summary": "Matériel mobile de Atelier de bord.",
      "text": "Saisir une des poignées avec X. Le mouvement, la ligne de vue et le plan utilisent la même position. Les roues peuvent avertir une créature. Aucun composant de maintenance n’est consommé.",
      "unlockRoom": "workshop"
    },
    {
      "id": "v09-stores-cart",
      "category": "Matériel",
      "title": "Servante des réserves",
      "summary": "Matériel mobile de Réserve des cellules.",
      "text": "Saisir une des poignées avec X. Le mouvement, la ligne de vue et le plan utilisent la même position. Les roues peuvent avertir une créature. Aucun composant de maintenance n’est consommé.",
      "unlockRoom": "stores"
    },
    {
      "id": "v09-haul-cart",
      "category": "Matériel",
      "title": "Benne de roulage",
      "summary": "Matériel mobile de Galerie de roulage.",
      "text": "Saisir une des poignées avec X. Le mouvement, la ligne de vue et le plan utilisent la même position. Les roues peuvent avertir une créature. Aucun composant de maintenance n’est consommé.",
      "unlockRoom": "haul"
    },
    {
      "id": "v09-pump-cart",
      "category": "Matériel",
      "title": "Servante de pompage",
      "summary": "Matériel mobile de Station de pompage.",
      "text": "Saisir une des poignées avec X. Le mouvement, la ligne de vue et le plan utilisent la même position. Les roues peuvent avertir une créature. Aucun composant de maintenance n’est consommé.",
      "unlockRoom": "pump"
    },
    {
      "id": "v09-exchanger-cart",
      "category": "Matériel",
      "title": "Benne des échangeurs",
      "summary": "Matériel mobile de Salle des échangeurs.",
      "text": "Saisir une des poignées avec X. Le mouvement, la ligne de vue et le plan utilisent la même position. Les roues peuvent avertir une créature. Aucun composant de maintenance n’est consommé.",
      "unlockRoom": "exchanger"
    },
    {
      "id": "v09-hold-cart",
      "category": "Matériel",
      "title": "Benne de quarantaine",
      "summary": "Matériel mobile de Soute de quarantaine.",
      "text": "Saisir une des poignées avec X. Le mouvement, la ligne de vue et le plan utilisent la même position. Les roues peuvent avertir une créature. Aucun composant de maintenance n’est consommé.",
      "unlockRoom": "hold"
    },
    {
      "id": "place-boarding",
      "category": "Lieux",
      "title": "Vestibule d’embarquement",
      "summary": "D-01",
      "text": "Vestibule du Marion, bancs fixés au sol et racks. Les accès dessinent un chemin continu vers le sas, le bras puis le Samson.",
      "sourceStatus": "source-place-original-layout",
      "sources": [
        "F02"
      ],
      "unlockRoom": "boarding"
    },
    {
      "id": "place-docking_airlock",
      "category": "Lieux",
      "title": "Sas d’amarrage",
      "summary": "D-02",
      "text": "Sas situé entre le vestibule et le bras. Deux cloisons terminales, commande de pression et plancher continu.",
      "sourceStatus": "source-place-original-layout",
      "sources": [
        "F02"
      ],
      "unlockRoom": "docking_airlock"
    },
    {
      "id": "place-docking_arm",
      "category": "Lieux",
      "title": "Bras d’amarrage du Samson",
      "summary": "D-03",
      "text": "Passerelle close entre sas du Marion et écoutille du Samson. Segments vitrés et supports de quai, aucune sortie libre vers le vide.",
      "sourceStatus": "source-place-original-layout",
      "sources": [
        "F02"
      ],
      "unlockRoom": "docking_arm"
    },
    {
      "id": "v10-tool-torch",
      "category": "Matériel",
      "title": "Torche à plasma",
      "summary": "Équipement d’intervention",
      "text": "Repousse et brûle à courte portée. Préparation narrative à l’atelier conservée. Puissance et réserve : équilibrage original.",
      "sourceStatus": "primaire",
      "sources": [
        "F02"
      ],
      "unlockRoom": "boarding"
    },
    {
      "id": "v10-tool-pick",
      "category": "Matériel",
      "title": "Pic à sable",
      "summary": "Équipement d’intervention",
      "text": "Long outil de taille : frappe devant soi. Très près d’un adulte, le sang acide rend la riposte dangereuse.",
      "sourceStatus": "primaire",
      "sources": [
        "F02"
      ],
      "unlockRoom": "boarding"
    },
    {
      "id": "v10-tool-thumper",
      "category": "Matériel",
      "title": "Charge thumper",
      "summary": "Équipement d’intervention",
      "text": "Outil minier bruyant. Trois impacts peuvent abattre un adulte dans cet équilibrage ; ni cadence ni munitions ne sont des valeurs officielles.",
      "sourceStatus": "primaire",
      "sources": [
        "F02"
      ],
      "unlockRoom": "boarding"
    },
    {
      "id": "v10-tool-net",
      "category": "Matériel",
      "title": "Filet à âme métallique",
      "summary": "Équipement d’intervention",
      "text": "Enveloppe une cible proche pendant quatre secondes. Le lancer individuel est une adaptation du grand filet fixé dans le récit, pas sa reproduction 1:1.",
      "sourceStatus": "primaire",
      "sources": [
        "F02"
      ],
      "unlockRoom": "boarding"
    },
    {
      "id": "v10-tool-acid",
      "category": "Matériel",
      "title": "Projecteur d’acide minier",
      "summary": "Équipement d’intervention",
      "text": "Jet de courte portée. Présence signalée par une critique ; mécanisme, portée et dommages restent originaux. Aucun mélange ou procédé réel décrit.",
      "sourceStatus": "secondaire",
      "sources": [
        "F03"
      ],
      "unlockRoom": "boarding"
    },
    {
      "id": "v10-rule-224",
      "category": "Survie",
      "title": "Portes ancrées",
      "summary": "Marion · repères",
      "text": "Les accès reposent sur un mur arrière ou un petit vestibule raccordé ; leurs retours latéraux ont une empreinte physique.",
      "sourceStatus": "game-design",
      "sources": [],
      "unlockRoom": "bridge"
    },
    {
      "id": "v10-rule-225",
      "category": "Survie",
      "title": "Le sang reste dangereux",
      "summary": "Marion · repères",
      "text": "Blesser un adulte peut laisser une flaque corrosive. Le recul avant la riposte est aussi important que le choix de l’outil.",
      "sourceStatus": "game-design",
      "sources": [],
      "unlockRoom": "bridge"
    },
    {
      "id": "v10-rule-226",
      "category": "Survie",
      "title": "Récit et reconstruction",
      "summary": "Marion · repères",
      "text": "Un nom issu du récit ne transforme pas le plan reconstitué de cette pièce en plan officiel. Les annexes de maintenance sont des ajouts du jeu.",
      "sourceStatus": "game-design",
      "sources": [],
      "unlockRoom": "bridge"
    },
    {
      "id": "v10-rule-227",
      "category": "Survie",
      "title": "L’équipage est civil",
      "summary": "Marion · repères",
      "text": "Les tenues, coiffures et morphologies sont différenciées sans ajouter d’armures de Marines. Ash reste une présence informatique, pas un corps dans les coursives.",
      "sourceStatus": "game-design",
      "sources": [],
      "unlockRoom": "bridge"
    }
  ],
  "sources": [
    {
      "id": "S1",
      "title": "Titan Books — Alien: Out of the Shadows",
      "url": "https://titanbooks.com/7683-alien-out-of-the-shadows-book-1/",
      "type": "publisher",
      "supports": "Auteur, œuvre, Marion, LV-178, trimonite, Ripley et point de départ.",
      "checked": "2026-09-29"
    },
    {
      "id": "S2",
      "title": "Audible France — La sortie des profondeurs",
      "url": "https://www.audible.fr/pd/Alien-La-sortie-des-profondeurs-Le-Pilote-Livre-Audio/B01N35S1PY",
      "type": "publisher",
      "supports": "Titre français de la dramatique et attribution Tim Lebbon / Dirk Maggs.",
      "checked": "2026-09-29"
    },
    {
      "id": "S3",
      "title": "Alien: Out of the Shadows — synopsis de travail",
      "url": "https://en.wikipedia.org/wiki/Alien%3A_Out_of_the_Shadows",
      "type": "secondary",
      "supports": "Chronologie et grandes conséquences narratives. Source secondaire, pas audit ligne à ligne du roman.",
      "checked": "2026-09-29"
    },
    {
      "id": "S4",
      "title": "AVP Galaxy — comparaison de la dramatique",
      "url": "https://www.avpgalaxy.net/literature/reviews/alien-out-of-the-shadows-audio-drama/",
      "type": "secondary",
      "supports": "Différences de présentation d’Ash entre roman et audio ; limites et écarts signalés.",
      "checked": "2026-09-29"
    }
  ],
  "canon": {
    "reference": "Out of the Shadows — roman comme référence narrative ; audio signalé séparément",
    "year": 2159,
    "anchors": [
      "Le Marion exploite LV-178 ; les navettes Samson et Delilah sont liées à la crise.",
      "Hoop et Ripley participent à la tentative de fuite.",
      "Ash agit sous forme informatique.",
      "La recherche d’une cellule conduit sous la surface, puis dans une épave enfouie.",
      "Jones reste protégé dans le Narcissus.",
      "Le dénouement inclut le départ de Ripley, la suppression d’Ash et la transmission de Hoop."
    ],
    "exclusions": [
      "Pas de campagne militaire USCM.",
      "Pas de Reine de fin ajoutée comme fait du roman.",
      "Pas de rapprochement imposé entre constructeurs fossiles et Ingénieurs.",
      "Pas de sauvetage futur de Hoop affirmé.",
      "Pas de mélange avec Sea of Sorrows."
    ],
    "caveat": "Adaptation jouable non officielle. Le texte intégral du roman et de la dramatique n’a pas été audité ligne à ligne ; les plans, dialogues, interactions et séquences de suivi sont des créations de jeu. Mise en scène individuelle et art définitif encore partiels en V0.3.",
    "sources": [
      "S1",
      "S2",
      "S3",
      "S4"
    ],
    "v02_notes": [
      "Nouvelles répliques et positions de PNJ originales ; aucun dialogue du roman ou de la dramatique reproduit.",
      "Annexes originales, pas plans officiels du Marion.",
      "Pertes suggérées par signal et état, pas cinématiques intégrales du livre."
    ],
    "v03_notes": [
      "Trois séquences de suivi originales, sans réécriture des issues narratives.",
      "Carte à découverte locale et éclairages de gameplay, non plans ni comportement officiels du roman."
    ]
  },
  "edition": "Le Marion, pièce par pièce",
  "stateSchema": 10,
  "interactables": [
    {
      "id": "marion-note-01",
      "kind": "archive",
      "room": "rec",
      "x": 600,
      "y": 88,
      "title": "Une chaise de trop",
      "body": "Baxter a laissé une tasse derrière le comptoir. Le fond a séché. Il faudra lui rappeler de dormir avant sa prochaine garde.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-02",
      "kind": "archive",
      "room": "rec",
      "x": 1250,
      "y": 88,
      "title": "La même chanson",
      "body": "Le lecteur saute toujours au même endroit. Personne ne le répare : pour une fois, quelque chose à bord nous prévient avant de se répéter.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-03",
      "kind": "archive",
      "room": "bridge",
      "x": 1500,
      "y": 88,
      "title": "Liste de quart",
      "body": "Relais minier : sans réponse. Demande de vérification transmise. Ne pas effacer la dernière heure de réception.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-04",
      "kind": "archive",
      "room": "maintenance",
      "x": 700,
      "y": 88,
      "title": "Retour de courant",
      "body": "Une ligne coupée au pupitre peut rester alimentée par le secours. Isoler ici avant de toucher au contacteur.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-05",
      "kind": "archive",
      "room": "maintenance",
      "x": 1450,
      "y": 88,
      "title": "Un ordre en double",
      "body": "La même demande de redémarrage est revenue avec deux identifiants. Le collecteur, lui, n’a qu’une seule vanne.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-06",
      "kind": "archive",
      "room": "medical",
      "x": 910,
      "y": 88,
      "title": "Priorité au patient",
      "body": "Le pupitre distant n’a pas à décider qui entre dans l’unité. Garder le contrôle local tant que le réseau reste incertain.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-07",
      "kind": "archive",
      "room": "workshop",
      "x": 1140,
      "y": 88,
      "title": "Outils de travail",
      "body": "Ce matériel n’a jamais été prévu pour tenir une ligne de défense. Les réservoirs sont petits. Les recharges le sont aussi.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-08",
      "kind": "archive",
      "room": "cockpit",
      "x": 1080,
      "y": 88,
      "title": "Avant le départ",
      "body": "Retirer l’assistance du réseau. Contrôler les attaches. Attendre le signal de la soute. Le pilote veut entendre des voix, pas des voyants.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-09",
      "kind": "archive",
      "room": "landing",
      "x": 1950,
      "y": 88,
      "title": "Poussière sur les balises",
      "body": "La balise orientale disparaît quand le vent tourne. Garder le bâtiment dans le dos jusqu’au premier abri.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-10",
      "kind": "archive",
      "room": "drain",
      "x": 680,
      "y": 88,
      "title": "Le second chemin",
      "body": "Le collecteur est bruyant mais sa dérivation rejoint le roulage. Si la pompe tombe, ne pas revenir sous la conduite.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-11",
      "kind": "archive",
      "room": "drain",
      "x": 1620,
      "y": 88,
      "title": "Niveau haut",
      "body": "Les marques sur la paroi sont au-dessus de nos genoux. Ce n’est pas le ruissellement d’aujourd’hui.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-12",
      "kind": "archive",
      "room": "refuge",
      "x": 1210,
      "y": 88,
      "title": "Il reste une réserve",
      "body": "Le casier de terrain contient ce qu’il reste du dernier quart. Prendre seulement ce qu’on peut porter.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-13",
      "kind": "archive",
      "room": "vein",
      "x": 1700,
      "y": 88,
      "title": "Un bruit sans machine",
      "body": "La foreuse était arrêtée. J’ai encore senti les vibrations dans les semelles.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-14",
      "kind": "archive",
      "room": "alcove",
      "x": 640,
      "y": 88,
      "title": "Ce ne sont pas nos os",
      "body": "Les proportions ne correspondent à rien dans les fiches du bord. Ne pas donner de nom à ce qu’on n’a pas compris.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-15",
      "kind": "archive",
      "room": "alcove",
      "x": 1450,
      "y": 88,
      "title": "Un passage sans outil",
      "body": "La paroi s’incurve vers une seconde ouverture. Pas de serrure, pas de commande : seulement une brèche assez large pour passer.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-note-16",
      "kind": "archive",
      "room": "narcissus",
      "x": 1080,
      "y": 88,
      "title": "Près de la caisse",
      "body": "Jones est là. Le compartiment est calme. Fermer derrière soi, doucement.",
      "prop": "terminal",
      "hold": 0.65
    },
    {
      "id": "marion-cache-01",
      "kind": "cache",
      "room": "rec",
      "x": 1450,
      "y": 88,
      "title": "Trousse de terrain",
      "resource": "kits",
      "amount": 1,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "marion-cache-02",
      "kind": "cache",
      "room": "workshop",
      "x": 1320,
      "y": 88,
      "title": "Recharge de chalumeau",
      "resource": "fuel",
      "amount": 25,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true,
      "placementRule": "Retrait des seuils : dégagement horizontal supérieur à 150 unités pour séparer la commande de la porte."
    },
    {
      "id": "marion-cache-03",
      "kind": "cache",
      "room": "maintenance",
      "x": 1170,
      "y": 88,
      "title": "Balises sonores",
      "resource": "decoys",
      "amount": 2,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "marion-cache-04",
      "kind": "cache",
      "room": "control",
      "x": 1400,
      "y": 88,
      "title": "Trousse de terrain",
      "resource": "kits",
      "amount": 1,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "marion-cache-05",
      "kind": "cache",
      "room": "drain",
      "x": 1100,
      "y": 88,
      "title": "Recharge de chalumeau",
      "resource": "fuel",
      "amount": 20,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "marion-cache-06",
      "kind": "cache",
      "room": "refuge",
      "x": 1460,
      "y": 88,
      "title": "Balises sonores",
      "resource": "decoys",
      "amount": 2,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "marion-cache-07",
      "kind": "cache",
      "room": "stores",
      "x": 1650,
      "y": 88,
      "title": "Recharge de chalumeau",
      "resource": "fuel",
      "amount": 25,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "marion-cache-08",
      "kind": "cache",
      "room": "medical",
      "x": 1120,
      "y": 88,
      "title": "Trousse de terrain",
      "resource": "kits",
      "amount": 1,
      "prop": "cabinet",
      "hold": 0.9,
      "renderAfterCollection": true
    },
    {
      "id": "valve-aux-steam",
      "kind": "valve",
      "room": "maintenance",
      "x": 760,
      "y": 88,
      "title": "Fermer la dérivation",
      "hazard": "aux-steam",
      "prop": "valve",
      "hold": 1
    },
    {
      "id": "valve-drain-steam",
      "kind": "valve",
      "room": "drain",
      "x": 1000,
      "y": 88,
      "title": "Fermer la dérivation",
      "hazard": "drain-steam",
      "prop": "valve",
      "hold": 1
    },
    {
      "id": "valve-pump-steam",
      "kind": "valve",
      "room": "pump",
      "x": 1410,
      "y": 88,
      "title": "Fermer la dérivation",
      "hazard": "pump-steam",
      "prop": "valve",
      "hold": 1
    },
    {
      "id": "hide-junction",
      "kind": "hide",
      "room": "junction",
      "x": 1090,
      "y": 88,
      "hold": 0.35,
      "title": "Renfoncement des gaines",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "hide-engineering",
      "kind": "hide",
      "room": "engineering",
      "x": 1320,
      "y": 88,
      "hold": 0.35,
      "title": "Baie de maintenance",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "hide-samson",
      "kind": "hide",
      "room": "samson",
      "x": 1300,
      "y": 88,
      "hold": 0.35,
      "title": "Renfoncement entre les berceaux",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "hide-haul",
      "kind": "hide",
      "room": "haul",
      "x": 1970,
      "y": 88,
      "hold": 0.35,
      "title": "Abri de signalisation",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12,
      "placementRule": "Retrait des seuils : dégagement horizontal supérieur à 150 unités pour séparer la commande de la porte."
    },
    {
      "id": "hide-pump",
      "kind": "hide",
      "room": "pump",
      "x": 1660,
      "y": 88,
      "hold": 0.35,
      "title": "Niche du collecteur",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12,
      "placementRule": "Retrait des seuils : dégagement horizontal supérieur à 150 unités pour séparer la commande de la porte."
    },
    {
      "id": "hide-vein",
      "kind": "hide",
      "room": "vein",
      "x": 1690,
      "y": 88,
      "hold": 0.35,
      "title": "Baie du convoyeur",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "hide-vestibule",
      "kind": "hide",
      "room": "vestibule",
      "x": 1580,
      "y": 88,
      "hold": 0.35,
      "title": "Renfoncement des nervures",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "hide-fossils",
      "kind": "hide",
      "room": "fossils",
      "x": 1460,
      "y": 88,
      "hold": 0.35,
      "title": "Creux derrière les vestiges",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "hide-hold",
      "kind": "hide",
      "room": "hold",
      "x": 1610,
      "y": 88,
      "hold": 0.35,
      "title": "Alcôve de quarantaine",
      "body": "Éteignez la lampe et glissez-vous dans l’ombre. Une créature qui vous voit entrer ne sera pas trompée.",
      "visualY": 12
    },
    {
      "id": "light-junction",
      "room": "junction",
      "x": 1520,
      "y": 130,
      "kind": "light",
      "title": "Éclairage de la coursive",
      "hold": 0.5,
      "purpose": "Isoler les rampes de la coursive ; le balisage de secours reste alimenté.",
      "sourceStatus": "original-gameplay",
      "runSeconds": null,
      "coolSeconds": null
    },
    {
      "id": "light-engineering",
      "room": "engineering",
      "x": 1150,
      "y": 130,
      "kind": "light",
      "title": "Rampes des auxiliaires",
      "hold": 0.5,
      "purpose": "Commande d’éclairage distincte de la distribution des objectifs.",
      "sourceStatus": "original-gameplay",
      "runSeconds": null,
      "coolSeconds": null
    },
    {
      "id": "light-workshop",
      "room": "workshop",
      "x": 300,
      "y": 130,
      "kind": "light",
      "title": "Éclairage de l’atelier",
      "hold": 0.5,
      "purpose": "Permet de contrôler localement les rampes sans interrompre le chalumeau.",
      "sourceStatus": "original-gameplay",
      "runSeconds": null,
      "coolSeconds": null
    },
    {
      "id": "light-haul",
      "room": "haul",
      "x": 2140,
      "y": 140,
      "kind": "light",
      "title": "Rampes de roulage",
      "hold": 0.5,
      "purpose": "Conserver la signalétique et couper seulement les rampes de la galerie.",
      "sourceStatus": "original-gameplay",
      "runSeconds": null,
      "coolSeconds": null
    },
    {
      "id": "light-pump",
      "room": "pump",
      "x": 1160,
      "y": 140,
      "kind": "light",
      "title": "Éclairage du pompage",
      "hold": 0.5,
      "purpose": "Commande hors de la zone de pression ; indépendante des vannes.",
      "sourceStatus": "original-gameplay",
      "runSeconds": null,
      "coolSeconds": null
    },
    {
      "id": "light-hold",
      "room": "hold",
      "x": 1260,
      "y": 135,
      "kind": "light",
      "title": "Rampes de la soute",
      "hold": 0.5,
      "purpose": "Circuit de lumière indépendant de la fermeture de confinement.",
      "sourceStatus": "original-gameplay",
      "runSeconds": null,
      "coolSeconds": null
    },
    {
      "id": "noise-workshop",
      "room": "workshop",
      "x": 1780,
      "y": 140,
      "kind": "machine",
      "title": "Compresseur d’essai",
      "hold": 0.8,
      "purpose": "Relancer un compresseur fixé à l’établi pour couvrir le déplacement.",
      "sourceStatus": "original-gameplay",
      "runSeconds": 10,
      "coolSeconds": 18
    },
    {
      "id": "noise-haul",
      "room": "haul",
      "x": 510,
      "y": 140,
      "kind": "machine",
      "title": "Vibreur de trémie",
      "hold": 0.8,
      "purpose": "Déclenche un essai sonore à la trémie, sans modifier les objectifs.",
      "sourceStatus": "original-gameplay",
      "runSeconds": 10,
      "coolSeconds": 18
    },
    {
      "id": "noise-pump",
      "room": "pump",
      "x": 410,
      "y": 145,
      "kind": "machine",
      "title": "Cycle de rinçage",
      "hold": 0.8,
      "purpose": "Une pompe en dérivation peut détourner un adulte hors de sa ligne de vue.",
      "sourceStatus": "original-gameplay",
      "runSeconds": 10,
      "coolSeconds": 18
    },
    {
      "id": "noise-drain",
      "room": "drain",
      "x": 1330,
      "y": 135,
      "kind": "machine",
      "title": "Soufflante de décantation",
      "hold": 0.8,
      "purpose": "Lancer dix secondes de soufflerie, puis attendre son refroidissement.",
      "sourceStatus": "original-gameplay",
      "runSeconds": 10,
      "coolSeconds": 18
    },
    {
      "id": "salvage-01",
      "kind": "salvage",
      "room": "engineering",
      "x": 350,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-02",
      "kind": "salvage",
      "room": "maintenance",
      "x": 400,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-03",
      "kind": "salvage",
      "room": "breach",
      "x": 885,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-04",
      "kind": "salvage",
      "room": "rec",
      "x": 355,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-05",
      "kind": "salvage",
      "room": "stores",
      "x": 935,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-06",
      "kind": "salvage",
      "room": "control",
      "x": 300,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-07",
      "kind": "salvage",
      "room": "refuge",
      "x": 280,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "salvage-08",
      "kind": "salvage",
      "room": "drain",
      "x": 1855,
      "y": 88,
      "hold": 0.9,
      "amount": 3,
      "title": "Pièces de maintenance",
      "purpose": "Récupération unique de trois composants ; le casier reste ouvert et vide.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "fabricator-workshop",
      "kind": "fabricator",
      "room": "workshop",
      "x": 930,
      "y": 88,
      "hold": 0.5,
      "title": "Établi du Marion",
      "purpose": "Réassembler les pièces trouvées en ressources de survie, uniquement à cet établi.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "fabricator-refuge",
      "kind": "fabricator",
      "room": "refuge",
      "x": 710,
      "y": 88,
      "hold": 0.5,
      "title": "Établi de la concession",
      "purpose": "Réassembler les pièces trouvées en ressources de survie, uniquement à cet établi.",
      "sourceStatus": "original-gameplay"
    },
    {
      "id": "v07-isolate",
      "kind": "excursion",
      "operation": "isolate",
      "room": "return_gallery",
      "x": 440,
      "y": 130,
      "hold": 1.1,
      "title": "Fermer l’arrivée rompue",
      "purpose": "Intervention physique facultative, sans pause. L’arrivée est fermée. La conduite de retour doit encore être ouverte.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-bypass",
      "kind": "excursion",
      "operation": "bypass",
      "room": "exchanger",
      "x": 590,
      "y": 88,
      "hold": 1.3,
      "title": "Ouvrir la dérivation de retour",
      "purpose": "Intervention physique facultative, sans pause. Le circuit dispose maintenant d’une sortie. Le démarreur des pompes est prêt.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-prime",
      "kind": "excursion",
      "operation": "prime",
      "room": "exchanger",
      "x": 1200,
      "y": 88,
      "hold": 1.5,
      "title": "Démarrer le cycle de pompage",
      "purpose": "Intervention physique facultative, sans pause. Les pompes tournent. Le niveau descend ; elles continuent si vous quittez la salle.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-unlock",
      "kind": "excursion",
      "operation": "unlock",
      "room": "specimen_store",
      "x": 440,
      "y": 88,
      "hold": 1.1,
      "title": "Déverrouiller l’armoire sèche",
      "purpose": "Intervention physique facultative, sans pause. Le verrou de l’armoire s’efface. L’enregistreur attend dans son berceau.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-recover",
      "kind": "excursion",
      "operation": "recover",
      "room": "specimen_store",
      "x": 870,
      "y": 88,
      "hold": 1,
      "title": "Sangler l’enregistreur",
      "purpose": "Intervention physique facultative, sans pause. Le boîtier est sanglé au dos. Le lecteur du poste de relevé permettra de l’ouvrir.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-dock",
      "kind": "excursion",
      "operation": "dock",
      "room": "survey",
      "x": 570,
      "y": 88,
      "hold": 1,
      "title": "Brancher l’enregistreur au lecteur",
      "purpose": "Intervention physique facultative, sans pause. Le lecteur reconnaît le boîtier. Réglez le déphasage sur la console suivante.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-calibrate",
      "kind": "excursion",
      "operation": "calibrate",
      "room": "survey",
      "x": 1080,
      "y": 88,
      "hold": 2,
      "title": "Rétablir la synchronisation",
      "purpose": "Intervention physique facultative, sans pause. La chronologie tient. Il reste à copier le relevé dans le carnet.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-transmit",
      "kind": "excursion",
      "operation": "transmit",
      "room": "survey",
      "x": 1470,
      "y": 88,
      "hold": 1.4,
      "title": "Copier le relevé de la concession",
      "purpose": "Intervention physique facultative, sans pause. Les relevés de pompage sont conservés. Aucun appel de détresse extérieur n’a été émis.",
      "sourceStatus": "original-gameplay-v07"
    },
    {
      "id": "v07-note-1",
      "kind": "archive",
      "room": "return_gallery",
      "x": 1480,
      "y": 88,
      "hold": 0.5,
      "title": "Trait de niveau",
      "body": "Le trait le plus haut date d’avant l’arrêt du convoyeur. Personne n’a voulu noter le premier débordement. J’ai laissé le volant rouge fermé à moitié ; les deux conduites ne doivent plus débiter ensemble.",
      "sourceStatus": "original-writing-v07"
    },
    {
      "id": "v07-note-2",
      "kind": "archive",
      "room": "exchanger",
      "x": 1560,
      "y": 88,
      "hold": 0.5,
      "title": "Consigne effacée",
      "body": "Le groupe ne sert qu’à vider les caniveaux. Une fois lancé, il s’arrête au niveau bas. Le témoin du passage de service partage son contact : impossible de l’ouvrir tant que le seuil baigne.",
      "sourceStatus": "original-writing-v07"
    },
    {
      "id": "v07-note-3",
      "kind": "archive",
      "room": "survey",
      "x": 300,
      "y": 88,
      "hold": 0.5,
      "title": "Mémoire locale",
      "body": "On me demande chaque matin un relevé propre. La concession tourne avec du matériel qui oublie l’heure dès qu’une ligne tombe. Je garde donc le boîtier témoin hors du réseau.",
      "sourceStatus": "original-writing-v07"
    },
    {
      "id": "v07-note-4",
      "kind": "archive",
      "room": "specimen_store",
      "x": 1410,
      "y": 88,
      "hold": 0.5,
      "title": "Inventaire des prélèvements",
      "body": "Les cylindres contiennent de la roche, pas des réponses. L’équipe a descendu un autre appareil vers le front de taille. Je conserve son dernier relevé dans l’armoire, à l’abri de l’eau.",
      "sourceStatus": "original-writing-v07"
    },
    {
      "id": "v10-rack",
      "kind": "armament",
      "room": "boarding",
      "x": 440,
      "y": 88,
      "title": "Râtelier d’intervention",
      "hold": 0.65,
      "kit": "mining",
      "minChapter": 3
    },
    {
      "id": "v10-acid-rack",
      "kind": "armament",
      "room": "stores",
      "x": 1380,
      "y": 88,
      "title": "Casier du projecteur minier",
      "hold": 0.65,
      "kit": "acid",
      "minChapter": 7
    }
  ],
  "hazards": [
    {
      "id": "aux-steam",
      "room": "maintenance",
      "x": 990,
      "y": 88,
      "width": 100,
      "period": 8,
      "on": 2.4,
      "valveX": 760,
      "valveY": 88,
      "minChapter": 1
    },
    {
      "id": "drain-steam",
      "room": "drain",
      "x": 1450,
      "y": 30,
      "width": 150,
      "period": 7,
      "on": 2.7,
      "valveX": 1000,
      "valveY": 88,
      "minChapter": 7
    },
    {
      "id": "pump-steam",
      "room": "pump",
      "x": 1660,
      "y": 30,
      "width": 130,
      "period": 9,
      "on": 3,
      "valveX": 1410,
      "valveY": 88,
      "minChapter": 7
    }
  ],
  "crewPlacements": [
    {
      "id": "crew-jordan-0-bridge",
      "character": "jordan",
      "room": "bridge",
      "x": 850,
      "y": 105,
      "start": 0,
      "end": 3,
      "pose": "work"
    },
    {
      "id": "crew-baxter-0-comms",
      "character": "baxter",
      "room": "comms",
      "x": 650,
      "y": 88,
      "start": 0,
      "end": 3,
      "pose": "work"
    },
    {
      "id": "crew-welford-0-workshop",
      "character": "welford",
      "room": "workshop",
      "x": 1000,
      "y": 105,
      "start": 0,
      "end": 12,
      "pose": "work"
    },
    {
      "id": "crew-powell-0-engineering",
      "character": "powell",
      "room": "engineering",
      "x": 1000,
      "y": 105,
      "start": 0,
      "end": 12,
      "pose": "work"
    },
    {
      "id": "crew-kasyanov-0-medical",
      "character": "kasyanov",
      "room": "medical",
      "x": 1550,
      "y": 105,
      "start": 0,
      "end": 12,
      "pose": "work"
    },
    {
      "id": "crew-garcia-6-medical",
      "character": "garcia",
      "room": "medical",
      "x": 540,
      "y": 105,
      "start": 6,
      "end": 12,
      "pose": "work"
    },
    {
      "id": "crew-ripley-6-narcissus",
      "character": "ripley",
      "room": "narcissus",
      "x": 330,
      "y": 16,
      "start": 6,
      "end": 9,
      "pose": "rest"
    },
    {
      "id": "crew-sneddon-9-server",
      "character": "sneddon",
      "room": "server",
      "x": 1290,
      "y": 88,
      "start": 9,
      "end": 12,
      "pose": "work"
    },
    {
      "id": "crew-lachance-12-cockpit",
      "character": "lachance",
      "room": "cockpit",
      "x": 570,
      "y": 88,
      "start": 12,
      "end": 18,
      "pose": "work"
    },
    {
      "id": "crew-garcia-12-hangar",
      "character": "garcia",
      "room": "hangar",
      "x": 1920,
      "y": 105,
      "start": 12,
      "end": 14,
      "pose": "work"
    },
    {
      "id": "crew-baxter-21-refuge",
      "character": "baxter",
      "room": "refuge",
      "x": 650,
      "y": 105,
      "start": 21,
      "end": 24,
      "pose": "work"
    },
    {
      "id": "crew-sneddon-21-vein",
      "character": "sneddon",
      "room": "vein",
      "x": 1900,
      "y": 105,
      "start": 21,
      "end": 24,
      "pose": "work"
    },
    {
      "id": "crew-hoop-24-vestibule",
      "character": "hoop",
      "room": "vestibule",
      "x": 990,
      "y": 105,
      "start": 24,
      "end": 27,
      "pose": "work"
    },
    {
      "id": "crew-baxter-24-fossils",
      "character": "baxter",
      "room": "fossils",
      "x": 1600,
      "y": 105,
      "start": 24,
      "end": 27,
      "pose": "work"
    },
    {
      "id": "crew-kasyanov-27-bypass",
      "character": "kasyanov",
      "room": "bypass",
      "x": 1580,
      "y": 88,
      "start": 27,
      "end": 30,
      "pose": "injured"
    },
    {
      "id": "crew-sneddon-27-bypass",
      "character": "sneddon",
      "room": "bypass",
      "x": 1840,
      "y": 88,
      "start": 27,
      "end": 30,
      "pose": "rest"
    },
    {
      "id": "crew-baxter-30-lift_east",
      "character": "baxter",
      "room": "lift_east",
      "x": 910,
      "y": 88,
      "start": 30,
      "end": 31,
      "pose": "injured"
    },
    {
      "id": "crew-ripley-31-stores",
      "character": "ripley",
      "room": "stores",
      "x": 960,
      "y": 105,
      "start": 31,
      "end": 36,
      "pose": "injured"
    },
    {
      "id": "crew-lachance-33-cockpit",
      "character": "lachance",
      "room": "cockpit",
      "x": 570,
      "y": 88,
      "start": 33,
      "end": 36,
      "pose": "work"
    },
    {
      "id": "crew-lachance-36-hangar",
      "character": "lachance",
      "room": "hangar",
      "x": 1810,
      "y": 105,
      "start": 36,
      "end": 37,
      "pose": "work"
    },
    {
      "id": "crew-sneddon-37-hold",
      "character": "sneddon",
      "room": "hold",
      "x": 1830,
      "y": 105,
      "start": 37,
      "end": 39,
      "pose": "injured"
    },
    {
      "id": "crew-kasyanov-39-medical",
      "character": "kasyanov",
      "room": "medical",
      "x": 970,
      "y": 105,
      "start": 39,
      "end": 42,
      "pose": "injured"
    },
    {
      "id": "crew-ripley-39-medical",
      "character": "ripley",
      "room": "medical",
      "x": 1702,
      "y": 18,
      "start": 39,
      "end": 42,
      "pose": "rest"
    },
    {
      "id": "crew-ripley-43-narcissus",
      "character": "ripley",
      "room": "narcissus",
      "x": 330,
      "y": 16,
      "start": 43,
      "end": 48,
      "pose": "rest"
    },
    {
      "id": "v10-crew-welford",
      "character": "welford",
      "room": "boarding",
      "x": 650,
      "y": 112,
      "start": 12,
      "end": 14,
      "pose": "work"
    },
    {
      "id": "v10-crew-powell",
      "character": "powell",
      "room": "boarding",
      "x": 930,
      "y": 112,
      "start": 12,
      "end": 14,
      "pose": "work"
    },
    {
      "id": "v10-crew-kasyanov",
      "character": "kasyanov",
      "room": "boarding",
      "x": 1550,
      "y": 112,
      "start": 12,
      "end": 14,
      "pose": "work"
    },
    {
      "id": "v10-crew-hoop",
      "character": "hoop",
      "room": "boarding",
      "x": 2020,
      "y": 112,
      "start": 12,
      "end": 14,
      "pose": "work"
    }
  ],
  "dialogues": {
    "jordan": [
      [
        "Jordan",
        "Le relais ne répond plus. Vérifiez les auxiliaires avant de rappeler la mine."
      ],
      [
        "Hoop",
        "Je passe par les commandes locales."
      ]
    ],
    "baxter": [
      [
        "Baxter",
        "Le silence est trop propre. Même la porteuse a disparu."
      ],
      [
        "Hoop",
        "Gardez la dernière réception. Ne relancez rien sur le réseau."
      ]
    ],
    "welford": [
      [
        "Welford",
        "J’ai trié ce qui tient encore la pression. Le reste, je n’y touche plus."
      ]
    ],
    "powell": [
      [
        "Powell",
        "Il y a un retour de courant dans la galerie auxiliaire. Coupez-le à la vanne, pas depuis le pupitre."
      ]
    ],
    "kasyanov": [
      [
        "Kasyanov",
        "Je garde la commande de l’unité ici. Si le pupitre vous demande autre chose, prévenez-moi."
      ]
    ],
    "garcia": [
      [
        "Garcia",
        "Les trousses sont prêtes. Je préférerais les remettre dans l’armoire."
      ]
    ],
    "sneddon": [
      [
        "Sneddon",
        "Nous avançons parce que rester ici ne nous protège pas. Regardez derrière, pas seulement devant."
      ]
    ],
    "lachance": [
      [
        "Lachance",
        "Je peux piloter sans leur assistance. J’ai besoin des attaches, du courant et d’un signal clair."
      ]
    ],
    "hoop": [
      [
        "Hoop",
        "On garde une sortie. Même si elle nous oblige à revenir sur nos pas."
      ]
    ],
    "ripley": [
      [
        "Ripley",
        "Ne comptez pas sur le bruit pour savoir où elle est. Comptez les sorties."
      ]
    ]
  },
  "storyEvents": [
    {
      "at": 3,
      "id": "local",
      "speaker": "Baxter",
      "text": "Le relais tient. Il n’y a toujours personne au bout de la ligne.",
      "effect": "relay"
    },
    {
      "at": 5,
      "id": "impact",
      "speaker": "Hoop",
      "text": "La Delilah a frappé. La passerelle ne répond plus. Jordan ne répond plus.",
      "lost": [
        "jordan"
      ],
      "effect": "impact"
    },
    {
      "at": 9,
      "id": "wake",
      "speaker": "Ripley",
      "text": "Avant de repartir, montrez-moi tous les accès de cette navette.",
      "effect": "wake"
    },
    {
      "at": 14,
      "id": "garcia",
      "speaker": "Kasyanov",
      "text": "Welford et Powell ne répondent plus dans le vestibule. Garcia manque elle aussi à l’appel. Repliez-vous.",
      "lost": [
        "garcia",
        "welford",
        "powell"
      ],
      "effect": "seal"
    },
    {
      "at": 20,
      "id": "lift",
      "speaker": "Hoop",
      "text": "Cette cage ne remontera pas. Le second puits est notre seule sortie.",
      "effect": "lift"
    },
    {
      "at": 27,
      "id": "bones",
      "speaker": "Ripley",
      "text": "Ces restes n’étaient pas humains. Nous devons quitter cette chambre.",
      "effect": "reveal"
    },
    {
      "at": 30,
      "id": "wounded",
      "speaker": "Hoop",
      "text": "Kasyanov a le bras touché. Sneddon ne tient plus debout. On remonte ensemble.",
      "injured": [
        "kasyanov",
        "ripley",
        "baxter"
      ],
      "effect": "wounded"
    },
    {
      "at": 31,
      "id": "baxter",
      "speaker": "Hoop",
      "text": "Baxter ! ... La cage continue de monter. Il n’est plus avec nous.",
      "lost": [
        "baxter"
      ],
      "effect": "lift"
    },
    {
      "at": 37,
      "id": "lachance",
      "speaker": "Hoop",
      "text": "Lachance vient de tomber. La présence nous a suivis jusqu’au quai.",
      "lost": [
        "lachance"
      ],
      "effect": "impact"
    },
    {
      "at": 39,
      "id": "sneddon",
      "speaker": "Hoop",
      "text": "Sneddon a condamné la soute de l’intérieur. Après l’éclair, plus aucun mouvement.",
      "lost": [
        "sneddon"
      ],
      "effect": "blast"
    },
    {
      "at": 41,
      "id": "consent",
      "speaker": "Ripley",
      "text": "Faites cesser ces images. Je ne veux plus revoir cet endroit.",
      "effect": "medpod"
    },
    {
      "at": 42,
      "id": "medpod",
      "speaker": "Hoop",
      "text": "La commande vient de changer toute seule. Kasyanov ne répond plus. Je ramène Ripley au Narcissus.",
      "lost": [
        "kasyanov"
      ],
      "effect": "medpod"
    },
    {
      "at": 44,
      "id": "ash",
      "speaker": "Hoop",
      "text": "La copie a disparu. Mais les attaches automatiques sont mortes avec elle. Je dois revenir au quai.",
      "effect": "purge"
    },
    {
      "at": 46,
      "id": "goodbye",
      "speaker": "Hoop",
      "text": "Le collier est ouvert. Le Narcissus s’éloigne.",
      "effect": "release"
    }
  ],
  "workOrders": {
    "oth-c01-o2": {
      "type": "routing",
      "title": "Dérivation locale",
      "target": [
        1,
        2,
        1
      ],
      "initial": [
        0,
        0,
        2
      ],
      "labels": [
        "Entrée",
        "Relais",
        "Sortie"
      ],
      "hint": "Réglez les trois commutateurs sur la combinaison de la plaque locale, puis engagez le contacteur."
    },
    "oth-c03-o1": {
      "type": "routing",
      "title": "Dérivation locale",
      "target": [
        2,
        1,
        0
      ],
      "initial": [
        0,
        2,
        1
      ],
      "labels": [
        "Entrée",
        "Relais",
        "Sortie"
      ],
      "hint": "Réglez les trois commutateurs sur la combinaison de la plaque locale, puis engagez le contacteur."
    },
    "oth-c05-o3": {
      "type": "routing",
      "title": "Dérivation locale",
      "target": [
        1,
        0,
        2
      ],
      "initial": [
        2,
        1,
        0
      ],
      "labels": [
        "Entrée",
        "Relais",
        "Sortie"
      ],
      "hint": "Réglez les trois commutateurs sur la combinaison de la plaque locale, puis engagez le contacteur."
    },
    "oth-c06-o3": {
      "type": "routing",
      "title": "Dérivation locale",
      "target": [
        2,
        2,
        1
      ],
      "initial": [
        0,
        1,
        0
      ],
      "labels": [
        "Entrée",
        "Relais",
        "Sortie"
      ],
      "hint": "Réglez les trois commutateurs sur la combinaison de la plaque locale, puis engagez le contacteur."
    },
    "oth-c07-o3": {
      "type": "routing",
      "title": "Dérivation locale",
      "target": [
        0,
        2,
        2
      ],
      "initial": [
        1,
        0,
        1
      ],
      "labels": [
        "Entrée",
        "Relais",
        "Sortie"
      ],
      "hint": "Réglez les trois commutateurs sur la combinaison de la plaque locale, puis engagez le contacteur."
    },
    "oth-c01-o3": {
      "type": "sequence",
      "title": "Bus de secours",
      "sequence": [
        "isolate",
        "lock",
        "connect",
        "test"
      ],
      "hint": "Suivez l’ordre de la plaque de maintenance. Une commande hors séquence ne valide aucune étape."
    },
    "oth-c04-o1": {
      "type": "sequence",
      "title": "Préparation du chalumeau",
      "sequence": [
        "isolate",
        "connect",
        "test"
      ],
      "hint": "Suivez l’ordre de la plaque de maintenance. Une commande hors séquence ne valide aucune étape."
    },
    "oth-c07-o1": {
      "type": "sequence",
      "title": "Frein de cage",
      "sequence": [
        "lock",
        "connect",
        "test"
      ],
      "hint": "Suivez l’ordre de la plaque de maintenance. Une commande hors séquence ne valide aucune étape."
    },
    "oth-c08-o3": {
      "type": "sequence",
      "title": "Bras de la foreuse",
      "sequence": [
        "isolate",
        "lock",
        "test"
      ],
      "hint": "Suivez l’ordre de la plaque de maintenance. Une commande hors séquence ne valide aucune étape."
    },
    "oth-c11-o1": {
      "type": "sequence",
      "title": "Cage secondaire",
      "sequence": [
        "lock",
        "connect",
        "test"
      ],
      "hint": "Suivez l’ordre de la plaque de maintenance. Une commande hors séquence ne valide aucune étape."
    },
    "oth-c14-o1": {
      "type": "sequence",
      "title": "Unité médicale — alimentation",
      "sequence": [
        "isolate",
        "connect",
        "test"
      ],
      "hint": "Suivez l’ordre de la plaque de maintenance. Une commande hors séquence ne valide aucune étape."
    },
    "oth-c02-o1": {
      "type": "pressure",
      "title": "Collecteur du quai",
      "initial": 85,
      "target": 35,
      "tolerance": 5,
      "hint": "Réglez la pression dans la zone repérée, puis verrouillez le circuit."
    },
    "oth-c08-o1": {
      "type": "pressure",
      "title": "Purge du collecteur",
      "initial": 90,
      "target": 40,
      "tolerance": 5,
      "hint": "Réglez la pression dans la zone repérée, puis verrouillez le circuit."
    },
    "oth-c14-o2": {
      "type": "sequence",
      "title": "Unité médicale — programme de bord",
      "sequence": [
        "local",
        "consent",
        "scan",
        "stasis"
      ],
      "hint": "Le programme est fictionnel : commande locale, accord de Ripley, lecture du moniteur, puis stase."
    },
    "oth-c15-o2": {
      "type": "sequence",
      "title": "Purge de la copie",
      "sequence": [
        "isolate",
        "local",
        "purge",
        "test"
      ],
      "hint": "Isolez le réseau avant la purge. Sinon une copie pourrait être réintroduite."
    },
    "oth-c16-o3": {
      "type": "tuning",
      "title": "Appel de détresse",
      "initial": 20,
      "target": 65,
      "tolerance": 3,
      "hint": "Accordez la porteuse sur le repère 65, puis transmettez. Aucune réception n’est garantie."
    }
  },
  "releaseName": "Le Marion, pièce par pièce",
  "companions": [
    {
      "id": "baxter-refuge",
      "character": "baxter",
      "name": "Baxter",
      "start": 22,
      "end": 24,
      "room": "refuge",
      "x": 650,
      "y": 105,
      "speed": 177,
      "radio": "Je reste sur vos pas. Ne refermez rien avant mon passage.",
      "purpose": "Trajet refuge → front de taille. Le relais suivant reste scénarisé."
    },
    {
      "id": "hoop-derelict",
      "character": "hoop",
      "name": "Hoop",
      "start": 24,
      "end": 30,
      "room": "vestibule",
      "x": 990,
      "y": 105,
      "speed": 197,
      "radio": "Les accès sont étroits. Faites-moi signe avant de repartir.",
      "purpose": "Ripley mène dans l’épave. Fin de l’accompagnement avant le changement de personnage."
    },
    {
      "id": "ripley-return",
      "character": "ripley",
      "name": "Ripley",
      "start": 31,
      "end": 36,
      "room": "stores",
      "x": 960,
      "y": 105,
      "speed": 165,
      "radio": "Je peux marcher. Prévenez-moi avant de quitter cette pièce.",
      "purpose": "Retour des réserves au Samson. La scène médicale et le portage ultérieurs restent distincts."
    }
  ],
  "pursuitRules": {
    "edges": [
      "e19",
      "e20",
      "e22",
      "e23",
      "e24",
      "e25",
      "e26",
      "e27",
      "e32",
      "oth-annex-drain-0",
      "oth-annex-drain-1",
      "oth-annex-alcove-0",
      "oth-annex-alcove-1",
      "service-mine",
      "v07-haul-return",
      "v07-return-exchange",
      "v07-exchange-vein"
    ],
    "memory": 18,
    "crossingTime": 1.4,
    "maxAdultsPerRoom": 2,
    "safeRooms": [
      "bridge",
      "medical",
      "refuge",
      "narcissus",
      "cockpit",
      "stores",
      "landing",
      "lift_east"
    ],
    "purpose": "Un adulte ne suit que la dernière sortie vue ou entendue. Aucun chemin calculé vers le joueur hors champ ; aucune apparition supplémentaire."
  },
  "bulkheads": [
    {
      "edge": "e03",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Coursive / distribution"
    },
    {
      "edge": "e08",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Distribution / atelier"
    },
    {
      "edge": "e19",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Pied de puits / roulage"
    },
    {
      "edge": "e20",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Roulage / pompage"
    },
    {
      "edge": "e22",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Roulage / front de taille"
    },
    {
      "edge": "e32",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Pompage / front de taille"
    },
    {
      "edge": "oth-annex-drain-0",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Roulage / décantation"
    },
    {
      "edge": "oth-annex-drain-1",
      "holdSeconds": 14,
      "breakSeconds": 5.5,
      "jamSeconds": 35,
      "label": "Pompage / décantation"
    }
  ],
  "acoustics": {
    "edges": [
      "e19",
      "e20",
      "e22",
      "e23",
      "e24",
      "e25",
      "e26",
      "e27",
      "e32",
      "oth-annex-drain-0",
      "oth-annex-drain-1",
      "oth-annex-alcove-0",
      "oth-annex-alcove-1",
      "service-mine",
      "v07-haul-return",
      "v07-return-exchange",
      "v07-exchange-vein"
    ],
    "range": 980,
    "memory": 12,
    "pulseInterval": 2,
    "listenRange": 780,
    "sealedTransmission": 0.18,
    "maskRadius": 540,
    "decoyMemorySeconds": 80,
    "decoyInspectSeconds": 0.75,
    "decoySameAreaLimit": 2,
    "maxResiduesPerRoom": 12,
    "maxLures": 6
  },
  "maintenance": {
    "repairs": [
      {
        "id": "repair-medical",
        "edge": "service-medical",
        "a": "rec",
        "b": "medical",
        "xA": 925,
        "xB": 1530,
        "title": "Coursive sanitaire",
        "minChapter": 0,
        "cost": 3,
        "description": "Remettre en service le passage du carré de repos vers l’infirmerie. Le pont médical reste accessible par la coursive principale.",
        "stages": [
          {
            "label": "Déposer le capot",
            "hold": 1.1,
            "cost": 0
          },
          {
            "label": "Remplacer les connecteurs",
            "hold": 2,
            "cost": 3
          },
          {
            "label": "Tester le retour de porte",
            "hold": 1.6,
            "cost": 0
          }
        ]
      },
      {
        "id": "repair-cargo",
        "edge": "service-cargo",
        "a": "workshop",
        "b": "hangar",
        "xA": 630,
        "xB": 390,
        "title": "Liaison de manutention",
        "minChapter": 3,
        "cost": 3,
        "description": "Raccorder l’atelier au hangar par la desserte des chariots. Les sas et les étapes de campagne restent inchangés.",
        "stages": [
          {
            "label": "Déposer le capot",
            "hold": 1.1,
            "cost": 0
          },
          {
            "label": "Remplacer les connecteurs",
            "hold": 2,
            "cost": 3
          },
          {
            "label": "Tester le retour de porte",
            "hold": 1.6,
            "cost": 0
          }
        ]
      },
      {
        "id": "repair-mine",
        "edge": "service-mine",
        "a": "drain",
        "b": "vein",
        "xA": 395,
        "xB": 370,
        "title": "Traverse de décantation",
        "minChapter": 7,
        "cost": 3,
        "description": "Réouvrir la traverse vers le front de trimonite. Un adulte peut emprunter cette liaison ouverte ; elle n’est pas un refuge.",
        "stages": [
          {
            "label": "Déposer le capot",
            "hold": 1.1,
            "cost": 0
          },
          {
            "label": "Remplacer les connecteurs",
            "hold": 2,
            "cost": 3
          },
          {
            "label": "Tester le retour de porte",
            "hold": 1.6,
            "cost": 0
          }
        ]
      }
    ],
    "maxParts": 30,
    "salvageAmount": 3,
    "recipes": [
      {
        "id": "decoy",
        "title": "Boîtier sonore",
        "cost": 2,
        "resource": "decoys",
        "amount": 1,
        "limit": 12,
        "description": "Un leurre portatif. Même durée, même efficacité que les boîtiers trouvés."
      },
      {
        "id": "fuel",
        "title": "Cartouche de chalumeau",
        "cost": 3,
        "resource": "fuel",
        "amount": 27,
        "limit": 100,
        "description": "27 unités de carburant. La cartouche n’autorise pas l’usage du chalumeau avant sa préparation."
      },
      {
        "id": "kit",
        "title": "Réassort de secours",
        "cost": 4,
        "resource": "kits",
        "amount": 1,
        "limit": 5,
        "description": "Un kit de secours prêt à l’emploi, assemblé à partir du matériel récupéré."
      }
    ]
  },
  "excursion": {
    "id": "archives-noyees",
    "title": "Les archives noyées",
    "minChapter": 7,
    "rooms": [
      "return_gallery",
      "exchanger",
      "survey",
      "specimen_store"
    ],
    "pumpSeconds": 18,
    "ops": [
      {
        "id": "isolate",
        "room": "return_gallery",
        "x": 440,
        "y": 130,
        "hold": 1.1,
        "title": "Fermer l’arrivée rompue",
        "visual": "valve",
        "after": "L’arrivée est fermée. La conduite de retour doit encore être ouverte."
      },
      {
        "id": "bypass",
        "room": "exchanger",
        "x": 590,
        "y": 88,
        "hold": 1.3,
        "title": "Ouvrir la dérivation de retour",
        "visual": "valve",
        "after": "Le circuit dispose maintenant d’une sortie. Le démarreur des pompes est prêt."
      },
      {
        "id": "prime",
        "room": "exchanger",
        "x": 1200,
        "y": 88,
        "hold": 1.5,
        "title": "Démarrer le cycle de pompage",
        "visual": "pump",
        "after": "Les pompes tournent. Le niveau descend ; elles continuent si vous quittez la salle."
      },
      {
        "id": "unlock",
        "room": "specimen_store",
        "x": 440,
        "y": 88,
        "hold": 1.1,
        "title": "Déverrouiller l’armoire sèche",
        "visual": "cabinet",
        "after": "Le verrou de l’armoire s’efface. L’enregistreur attend dans son berceau."
      },
      {
        "id": "recover",
        "room": "specimen_store",
        "x": 870,
        "y": 88,
        "hold": 1,
        "title": "Sangler l’enregistreur",
        "visual": "recorder",
        "after": "Le boîtier est sanglé au dos. Le lecteur du poste de relevé permettra de l’ouvrir."
      },
      {
        "id": "dock",
        "room": "survey",
        "x": 570,
        "y": 88,
        "hold": 1,
        "title": "Brancher l’enregistreur au lecteur",
        "visual": "reader",
        "after": "Le lecteur reconnaît le boîtier. Réglez le déphasage sur la console suivante."
      },
      {
        "id": "calibrate",
        "room": "survey",
        "x": 1080,
        "y": 88,
        "hold": 2,
        "title": "Rétablir la synchronisation",
        "visual": "console",
        "after": "La chronologie tient. Il reste à copier le relevé dans le carnet."
      },
      {
        "id": "transmit",
        "room": "survey",
        "x": 1470,
        "y": 88,
        "hold": 1.4,
        "title": "Copier le relevé de la concession",
        "visual": "terminal",
        "after": "Les relevés de pompage sont conservés. Aucun appel de détresse extérieur n’a été émis."
      }
    ],
    "floods": [
      {
        "room": "return_gallery",
        "left": 260,
        "right": 1720,
        "front": 105
      },
      {
        "room": "exchanger",
        "left": 230,
        "right": 2000,
        "front": 108
      }
    ],
    "rewardRecord": "v07-pump-record"
  },
  "sequences": [
    {
      "id": "marion",
      "at": 0,
      "title": "Avant le silence",
      "room": "bridge",
      "effect": "establish",
      "shots": [
        {
          "speaker": "CARNET DU MARION",
          "text": "La mine ne répond plus. Le travail commence par une liaison à rétablir, pas par une arme à charger.",
          "x": 750,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "HOOP",
          "text": "On vérifie les lignes une par une. Personne ne descend seul.",
          "x": 1100,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "REPRISE",
          "text": "Rejoignez la console de transmission. Les commandes du terrain restent celles de la chronique.",
          "x": 500,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "delilah",
      "at": 5,
      "title": "La Delilah",
      "room": "breach",
      "effect": "impact",
      "shots": [
        {
          "speaker": "HOOP",
          "text": "La Delilah a frappé. La passerelle ne répond plus. Jordan ne répond plus.",
          "x": 850,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "CARNET",
          "text": "Derrière les tôles disjointes, les voyants de secours remplacent les appels de la passerelle.",
          "x": 1200,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "HOOP",
          "text": "Il reste une voie dans les conduites. Ne touchez pas les bords de la brèche.",
          "x": 520,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "ripley",
      "at": 9,
      "title": "Une survivante",
      "room": "narcissus",
      "effect": "arrival",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "L’écoutille du Narcissus est ouverte. Le silence de sa cabine ne ressemble pas à celui du Marion.",
          "x": 650,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "RIPLEY",
          "text": "Avant de repartir, montrez-moi tous les accès de cette navette.",
          "x": 1050,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "HOOP",
          "text": "Nous commençons par l’atelier. Le matériel doit fonctionner sans le réseau.",
          "x": 1350,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "descent",
      "at": 16,
      "title": "La route sous les nuages",
      "room": "cockpit",
      "effect": "flight",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "La commande de descente répond. Les balises de la concession deviennent les seuls repères.",
          "x": 800,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "HOOP",
          "text": "Gardez cette fréquence. Nous en aurons besoin pour retrouver le retour.",
          "x": 1200,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "CARNET",
          "text": "Le transfert reste à effectuer par le passage de la navette. Cette séquence ne déplace pas le joueur.",
          "x": 600,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "cage",
      "at": 20,
      "title": "Le puits ne répond plus",
      "room": "lift_bottom",
      "effect": "lift",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "La cage termine sa course dans un bruit de métal. Le câble se tend, puis ne répond plus.",
          "x": 950,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "HOOP",
          "text": "Cette cage ne remontera pas. Le second puits est notre seule sortie.",
          "x": 1200,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "CARNET",
          "text": "Le parcours de retour change. Le balisage minier reste à remettre en service.",
          "x": 450,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "bones",
      "at": 27,
      "title": "Ce qui était là avant",
      "room": "fossils",
      "effect": "fossils",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "Les faisceaux quittent la roche pour suivre des formes que la concession n’a pas construites.",
          "x": 950,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "RIPLEY",
          "text": "Ces restes n’étaient pas humains. Nous devons quitter cette chambre.",
          "x": 1420,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "HOOP",
          "text": "Gardez la route de la mine derrière vous. Ne vous dispersez pas entre les nervures.",
          "x": 500,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "baxter",
      "at": 31,
      "title": "La seconde cage",
      "room": "lift_east",
      "effect": "loss",
      "shots": [
        {
          "speaker": "HOOP",
          "text": "Baxter ! ... La cage continue de monter. Il n’est plus avec nous.",
          "x": 1050,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "CARNET",
          "text": "Le nom reste dans le registre. L’emplacement près de la grille reste vide.",
          "x": 720,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "HOOP",
          "text": "Il faut encore la cellule de retour. Elle est dans le magasin.",
          "x": 450,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "sneddon",
      "at": 39,
      "title": "La dernière cloison",
      "room": "hold",
      "effect": "blast",
      "shots": [
        {
          "speaker": "HOOP",
          "text": "Sneddon a condamné la soute de l’intérieur. Après l’éclair, plus aucun mouvement.",
          "x": 1000,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "CARNET",
          "text": "La quarantaine reste fermée. Les silhouettes cessent de se découper derrière le métal.",
          "x": 650,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "HOOP",
          "text": "L’infirmerie est encore accessible. On continue par là.",
          "x": 1350,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "medical",
      "at": 42,
      "title": "La commande détournée",
      "room": "medical",
      "effect": "medical",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "Le programme de l’unité est terminé. Ripley ne se réveille pas.",
          "x": 1150,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "HOOP",
          "text": "La commande vient de changer toute seule. Kasyanov ne répond plus. Je ramène Ripley au Narcissus.",
          "x": 700,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "CARNET",
          "text": "Ripley doit être portée jusqu’à la navette. Cette évacuation se joue sur le terrain.",
          "x": 1400,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "ash",
      "at": 44,
      "title": "La copie effacée",
      "room": "narcissus",
      "effect": "purge",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "La liaison extérieure est isolée. La purge locale ne reçoit plus de nouvelle copie.",
          "x": 1000,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "HOOP",
          "text": "La copie a disparu. Mais les attaches automatiques sont mortes avec elle. Je dois revenir au quai.",
          "x": 550,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "CARNET",
          "text": "Le terminal ne répond plus aux ordres distants. Les verrous mécaniques attendent encore une main.",
          "x": 1350,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "release",
      "at": 46,
      "title": "Le collier s’ouvre",
      "room": "dock",
      "effect": "release",
      "shots": [
        {
          "speaker": "HOOP",
          "text": "Le collier est ouvert. Le Narcissus s’éloigne.",
          "x": 1100,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "CARNET",
          "text": "Ripley et Jones restent à bord de la navette libérée. Le quai ne retient plus que ses attaches.",
          "x": 700,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "HOOP",
          "text": "Le Samson. Il faut rejoindre sa radio.",
          "x": 450,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    },
    {
      "id": "signal",
      "at": 48,
      "title": "Aucune réponse",
      "room": "cockpit",
      "effect": "signal",
      "shots": [
        {
          "speaker": "CARNET",
          "text": "L’appel de détresse a été émis. Le journal conserve la transmission.",
          "x": 850,
          "duration": 7,
          "tag": "ÉTABLISSEMENT"
        },
        {
          "speaker": "HOOP",
          "text": "Je répète le message sur la fréquence de secours.",
          "x": 1200,
          "duration": 8,
          "tag": "CONTRECHAMP"
        },
        {
          "speaker": "CARNET",
          "text": "Aucune réponse n’est confirmée. Le récit s’arrête ici ; le silence n’est pas une preuve de sauvetage.",
          "x": 550,
          "duration": 9,
          "tag": "REPRISE"
        }
      ]
    }
  ],
  "presentationRules": {
    "automatic": true,
    "autoAdvance": false,
    "captionScale": 1,
    "scope": "staged-in-engine-original-vignettes-not-official-film",
    "safeRadius": 620
  },
  "handling": {
    "scope": "bounded-manual-kinematic-no-crushing-no-remote-reset",
    "pushSpeed": 62,
    "pullSpeed": 46,
    "gripRadius": 31,
    "handleOffset": 19,
    "pointClearance": 26,
    "soundInterval": 1.25,
    "carts": [
      {
        "id": "workshop-cart",
        "room": "workshop",
        "propId": "workshop:prop:1",
        "type": "serviceTrolley",
        "x": 1438,
        "y": 142,
        "label": "Servante de l’atelier",
        "bay": {
          "left": 1350,
          "right": 1540,
          "back": 50,
          "front": 150
        },
        "sourceStatus": "original-gameplay-v09"
      },
      {
        "id": "stores-cart",
        "room": "stores",
        "propId": "stores:prop:5",
        "type": "serviceTrolley",
        "x": 2080,
        "y": 143,
        "label": "Servante des réserves",
        "bay": {
          "left": 2020,
          "right": 2130,
          "back": 45,
          "front": 150
        },
        "sourceStatus": "original-gameplay-v09"
      },
      {
        "id": "haul-cart",
        "room": "haul",
        "propId": "haul:prop:0",
        "type": "oreTrolley",
        "x": 790,
        "y": 143,
        "label": "Benne de roulage",
        "bay": {
          "left": 755,
          "right": 880,
          "back": 47,
          "front": 155
        },
        "sourceStatus": "original-gameplay-v09"
      },
      {
        "id": "pump-cart",
        "room": "pump",
        "propId": "v09-pump-cart",
        "type": "serviceTrolley",
        "x": 785,
        "y": 75,
        "label": "Servante de pompage",
        "bay": {
          "left": 680,
          "right": 850,
          "back": 45,
          "front": 142
        },
        "sourceStatus": "original-gameplay-v09"
      },
      {
        "id": "exchanger-cart",
        "room": "exchanger",
        "propId": "v09-exchanger-cart",
        "type": "oreTrolley",
        "x": 1350,
        "y": 135,
        "label": "Benne des échangeurs",
        "bay": {
          "left": 1290,
          "right": 1440,
          "back": 65,
          "front": 142
        },
        "sourceStatus": "original-gameplay-v09"
      },
      {
        "id": "hold-cart",
        "room": "hold",
        "propId": "hold:prop:2",
        "type": "oreTrolley",
        "x": 1080,
        "y": 143,
        "label": "Benne de quarantaine",
        "bay": {
          "left": 960,
          "right": 1140,
          "back": 38,
          "front": 150
        },
        "sourceStatus": "original-gameplay-v09"
      }
    ]
  },
  "fidelity": {
    "sources": [
      {
        "id": "F01",
        "title": "Titan Books — présentation officielle",
        "url": "https://titanbooks.com/7683-alien-out-of-the-shadows-book-1/",
        "level": "primaire",
        "supports": "Marion, LV-178, trimonite, Hoop et Ripley. Aucun plan coté."
      },
      {
        "id": "F02",
        "title": "Tim Lebbon — extrait autorisé publié par JoBlo",
        "url": "https://www.joblo.com/exclusive-excerpt-from-alien-out-of-the-shadows/",
        "level": "primaire",
        "supports": "Vestibule, sas, bras d’amarrage et Samson ; torche, pic, filet métallique et charge thumper. Pas de plans ou de fiches de modèle."
      },
      {
        "id": "F03",
        "title": "AVPGalaxy — critique du roman",
        "url": "https://www.avpgalaxy.net/literature/reviews/alien-out-of-the-shadows/",
        "level": "secondaire",
        "supports": "Confirmation secondaire du matériel minier, du projecteur d’acide et des explosifs. Vérification directe encore requise."
      },
      {
        "id": "F04",
        "title": "Audible France — édition dramatique",
        "url": "https://www.audible.fr/series/Alien-La-sortie-des-profondeurs-Livres-Audio/B01MYA46WJ",
        "level": "primaire éditoriale",
        "supports": "Identité de la dramatique. Une distribution vocale n’est pas une référence de visage."
      }
    ],
    "scope": "Extrait autorisé et sources éditoriales, pas relecture intégrale du roman ou de la dramatique. Aucune certification 1:1.",
    "missing": [
      {
        "area": "Carte complète",
        "status": "à vérifier",
        "detail": "Les plans sont des reconstructions. Les niveaux miniers non décrits dans les sources examinées, les quartiers de tout l’équipage et la totalité des systèmes de l’épave ne sont pas reconstitués."
      },
      {
        "area": "Rencontre du vestibule",
        "status": "partielle",
        "detail": "Le lieu et les quatre familles d’armes sont corrigés. La chorégraphie de quatre adultes simultanés, les fenêtres rompues et la décompression intégrale restent à mettre en scène."
      },
      {
        "area": "Armes et outils",
        "status": "partielle",
        "detail": "Cinq outils utilisables sont inventoriés, avec provenance. Les explosifs sont contextuels ; aucun inventaire exhaustif du roman complet n’est certifié."
      },
      {
        "area": "Apparences de l’équipage",
        "status": "provisoire",
        "detail": "Rôles civils et identités séparées ; coupes, tailles, teints et couleurs non attestés sont des choix de production, pas des descriptions officielles. Pas de copie des visages des comédiens de doublage."
      },
      {
        "area": "Xénobiologie de l’épave",
        "status": "partielle",
        "detail": "Vestiges non humains représentés ; morphologie précise et architecture extraterrestre non authentifiées. Ne pas confondre automatiquement les occupants avec les Ingénieurs."
      },
      {
        "area": "Roman et dramatique",
        "status": "à distinguer",
        "detail": "Les variantes de mise en scène, de dialogues et d’Ash ne sont pas fusionnées sous une revendication de reproduction exacte."
      }
    ]
  },
  "appearance": {
    "hoop": {
      "suit": "#6d7b65",
      "skin": "#b69679",
      "hair": "#63554a",
      "cut": "short",
      "sx": 1.09,
      "sy": 1.05,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "ripley": {
      "suit": "#83969e",
      "skin": "#c4a78c",
      "hair": "#42362f",
      "cut": "curly",
      "sx": 1.02,
      "sy": 1,
      "status": "interprétation visuelle provisoire",
      "note": "Cheveux foncés bouclés et tenue civile évoquent la continuité visuelle Alien ; costume exact de cette séquence du roman non authentifié."
    },
    "kasyanov": {
      "suit": "#abbcb7",
      "skin": "#cfb093",
      "hair": "#655047",
      "cut": "tied",
      "sx": 0.96,
      "sy": 1.01,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "garcia": {
      "suit": "#d0c5b3",
      "skin": "#a98468",
      "hair": "#493930",
      "cut": "short",
      "sx": 0.92,
      "sy": 0.96,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "baxter": {
      "suit": "#918166",
      "skin": "#b69b81",
      "hair": "#9b8b72",
      "cut": "balding",
      "sx": 1.06,
      "sy": 1.02,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "lachance": {
      "suit": "#71818d",
      "skin": "#aa886f",
      "hair": "#3c332c",
      "cut": "short",
      "sx": 1.01,
      "sy": 1.04,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "sneddon": {
      "suit": "#8c9f91",
      "skin": "#c4aa8b",
      "hair": "#73564a",
      "cut": "tied",
      "sx": 0.95,
      "sy": 1.01,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "jordan": {
      "suit": "#758794",
      "skin": "#bda28c",
      "hair": "#4b433b",
      "cut": "tied",
      "sx": 1.0,
      "sy": 1.04,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "welford": {
      "suit": "#9a946d",
      "skin": "#b99a7d",
      "hair": "#716351",
      "cut": "short",
      "sx": 1.04,
      "sy": 1.0,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    },
    "powell": {
      "suit": "#818c79",
      "skin": "#a3846c",
      "hair": "#403b36",
      "cut": "short",
      "sx": 1.02,
      "sy": 1.04,
      "status": "interprétation visuelle provisoire",
      "note": "Identité civile ; coupe, morphologie et couleurs non certifiées par les extraits examinés. Aucun visage de comédien vocal employé."
    }
  },
  "armament": [
    {
      "id": "torch",
      "key": "1",
      "name": "Torche à plasma",
      "source": "F02",
      "evidence": "primaire",
      "mode": "flamme",
      "range": 250,
      "damage": 24,
      "ammo": "fuel",
      "cost": 9,
      "capacity": 100,
      "description": "Repousse et brûle à courte portée. Préparation narrative à l’atelier conservée. Puissance et réserve : équilibrage original."
    },
    {
      "id": "pick",
      "key": "2",
      "name": "Pic à sable",
      "source": "F02",
      "evidence": "primaire",
      "mode": "contact",
      "range": 112,
      "damage": 38,
      "ammo": null,
      "cost": 0,
      "capacity": 1,
      "description": "Long outil de taille : frappe devant soi. Très près d’un adulte, le sang acide rend la riposte dangereuse."
    },
    {
      "id": "thumper",
      "key": "3",
      "name": "Charge thumper",
      "source": "F02",
      "evidence": "primaire",
      "mode": "charge",
      "range": 630,
      "damage": 48,
      "ammo": "charges",
      "cost": 1,
      "capacity": 6,
      "description": "Outil minier bruyant. Trois impacts peuvent abattre un adulte dans cet équilibrage ; ni cadence ni munitions ne sont des valeurs officielles."
    },
    {
      "id": "net",
      "key": "4",
      "name": "Filet à âme métallique",
      "source": "F02",
      "evidence": "primaire",
      "mode": "filet",
      "range": 240,
      "damage": 0,
      "ammo": "nets",
      "cost": 1,
      "capacity": 2,
      "description": "Enveloppe une cible proche pendant quatre secondes. Le lancer individuel est une adaptation du grand filet fixé dans le récit, pas sa reproduction 1:1."
    },
    {
      "id": "acid",
      "key": "5",
      "name": "Projecteur d’acide minier",
      "source": "F03",
      "evidence": "secondaire",
      "mode": "jet",
      "range": 220,
      "damage": 60,
      "ammo": "acid",
      "cost": 1,
      "capacity": 3,
      "description": "Jet de courte portée. Présence signalée par une critique ; mécanisme, portée et dommages restent originaux. Aucun mélange ou procédé réel décrit."
    }
  ],
  "equipmentRegistry": [
    {
      "id": "torch",
      "name": "Torche à plasma",
      "status": "utilisable",
      "input": "F / 1",
      "evidence": "primaire",
      "source": "F02",
      "note": "Repousse et brûle à courte portée. Préparation narrative à l’atelier conservée. Puissance et réserve : équilibrage original."
    },
    {
      "id": "pick",
      "name": "Pic à sable",
      "status": "utilisable",
      "input": "F / 2",
      "evidence": "primaire",
      "source": "F02",
      "note": "Long outil de taille : frappe devant soi. Très près d’un adulte, le sang acide rend la riposte dangereuse."
    },
    {
      "id": "thumper",
      "name": "Charge thumper",
      "status": "utilisable",
      "input": "F / 3",
      "evidence": "primaire",
      "source": "F02",
      "note": "Outil minier bruyant. Trois impacts peuvent abattre un adulte dans cet équilibrage ; ni cadence ni munitions ne sont des valeurs officielles."
    },
    {
      "id": "net",
      "name": "Filet à âme métallique",
      "status": "utilisable",
      "input": "F / 4",
      "evidence": "primaire",
      "source": "F02",
      "note": "Enveloppe une cible proche pendant quatre secondes. Le lancer individuel est une adaptation du grand filet fixé dans le récit, pas sa reproduction 1:1."
    },
    {
      "id": "acid",
      "name": "Projecteur d’acide minier",
      "status": "utilisable",
      "input": "F / 5",
      "evidence": "secondaire",
      "source": "F03",
      "note": "Jet de courte portée. Présence signalée par une critique ; mécanisme, portée et dommages restent originaux. Aucun mélange ou procédé réel décrit."
    },
    {
      "id": "lamp",
      "name": "Lampe portative",
      "status": "utilisable",
      "input": "L",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Éclairage et détection, visuel attaché au personnage. Modèle non authentifié."
    },
    {
      "id": "decoy",
      "name": "Leurre sonore portatif",
      "status": "utilisable",
      "input": "R",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Ajout de gameplay, non certifié comme matériel du roman."
    },
    {
      "id": "kit",
      "name": "Consommable de secours",
      "status": "utilisable",
      "input": "H",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Ressource de jeu abstraite ; aucun protocole médical réel."
    },
    {
      "id": "components",
      "name": "Composants électriques",
      "status": "utilisable",
      "input": "E / I",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Trois chantiers et deux établis ; économie originale au jeu."
    },
    {
      "id": "return-cell",
      "name": "Cellule de retour",
      "status": "portage / installation",
      "input": "E",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Objectifs physiques conservés, capacité et forme reconstruites."
    },
    {
      "id": "recorder",
      "name": "Enregistreur des échangeurs",
      "status": "portage / dépôt",
      "input": "E / T",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Annexe originale, pas nouvel objet canonique déclaré."
    },
    {
      "id": "medical",
      "name": "Unité médicale / stase",
      "status": "interaction narrative",
      "input": "E",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Procédure condensée de fiction ; appareil non reproduit 1:1."
    },
    {
      "id": "radio",
      "name": "Relais radio et terminaux",
      "status": "interaction narrative",
      "input": "E",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Transmissions au cours des objectifs ; pas de radio portable sélectionnable."
    },
    {
      "id": "explosives",
      "name": "Explosifs miniers",
      "status": "contextuel",
      "input": "Événement de campagne",
      "evidence": "secondaire",
      "source": "F03",
      "note": "Mention secondaire F03 ; pas d’explosif portable utilisable dans cette livraison."
    },
    {
      "id": "rigging",
      "name": "Sangles, treuils et attaches",
      "status": "décor / commandes",
      "input": "E selon objectif",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Présents dans les navettes et quais ; pas de simulation de toutes les sangles."
    },
    {
      "id": "cart",
      "name": "Servantes et bennes",
      "status": "utilisable",
      "input": "X + directions",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Six objets physiques ; dispositifs et plans originaux."
    },
    {
      "id": "suit",
      "name": "Tenue de travail civile",
      "status": "portée",
      "input": "passif",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Rôles différenciés, couleurs et morphologies provisoires."
    },
    {
      "id": "pressure-suit",
      "name": "Combinaison pressurisée détaillée",
      "status": "à vérifier / non simulée",
      "input": "aucune",
      "evidence": "reconstruction / à vérifier",
      "source": null,
      "note": "Les sources retenues ne permettent pas de certifier modèle et emploi exacts ; pas de simulation de réserve respirable annoncée."
    }
  ]
};
