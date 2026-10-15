/** Original admitted frontal native stations. Crops follow real separated
 * silhouettes, including the wide autopsy bay, rather than a theoretical grid.
 * Feet, physical tops and mattress capacity use source pixels before uniform
 * runtime fitting. The generated RGBA bytes remain unchanged. */
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const HUB_ANNEX_STATION_ATLAS_V139=freeze({
  "asset": "/assets/openai/hub/props/v139/annex-stations-front-atlas.png",
  "admitted": true,
  "width": 1254,
  "height": 1254,
  "sha256": "14c64464e0f310da5f7052ec79c84963bbe45e2701be050508def6a3454405f2",
  "projection": "strict-side-elevation",
  "sourceStatus": "reviewed-original-frontal-native-annex-stations",
  "alphaPolicy": "original-rgba-no-pixel-editing",
  "cropPolicy": "measured-alpha16-silhouettes-in-real-gutter-regions",
  "footPolicy": "opaque-alpha192-contact-bottom-relative-to-crop",
  "cells": {
    "arrival-airlock": {
      "id": "arrival-airlock",
      "source": {
        "x": 37,
        "y": 65,
        "w": 358,
        "h": 228
      },
      "footSourceY": 227,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 0,
        "y": 0,
        "w": 430,
        "h": 324
      },
      "collisionTopSource": {
        "x": 1,
        "y": 1,
        "w": 355
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "logistics": {
      "id": "logistics",
      "source": {
        "x": 465,
        "y": 67,
        "w": 324,
        "h": 226
      },
      "footSourceY": 225,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 430,
        "y": 0,
        "w": 405,
        "h": 324
      },
      "collisionTopSource": {
        "x": 1,
        "y": 2,
        "w": 322
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "mire-archives": {
      "id": "mire-archives",
      "source": {
        "x": 862,
        "y": 71,
        "w": 358,
        "h": 220
      },
      "footSourceY": 219,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 835,
        "y": 0,
        "w": 419,
        "h": 324
      },
      "collisionTopSource": {
        "x": 1,
        "y": 1,
        "w": 356
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "synthetic-bay": {
      "id": "synthetic-bay",
      "source": {
        "x": 36,
        "y": 361,
        "w": 355,
        "h": 238
      },
      "footSourceY": 237,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 0,
        "y": 324,
        "w": 430,
        "h": 292
      },
      "collisionTopSource": {
        "x": 1,
        "y": 1,
        "w": 353
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "cctv": {
      "id": "cctv",
      "source": {
        "x": 458,
        "y": 356,
        "w": 338,
        "h": 239
      },
      "footSourceY": 238,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 430,
        "y": 324,
        "w": 405,
        "h": 292
      },
      "collisionTopSource": {
        "x": 1,
        "y": 1,
        "w": 336
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "proving-ground": {
      "id": "proving-ground",
      "source": {
        "x": 865,
        "y": 355,
        "w": 355,
        "h": 245
      },
      "footSourceY": 244,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 835,
        "y": 324,
        "w": 419,
        "h": 292
      },
      "collisionTopSource": {
        "x": 1,
        "y": 2,
        "w": 353
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "morgue": {
      "id": "morgue",
      "source": {
        "x": 35,
        "y": 651,
        "w": 465,
        "h": 253
      },
      "footSourceY": 252,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 0,
        "y": 616,
        "w": 520,
        "h": 314
      },
      "collisionTopSource": {
        "x": 25,
        "y": 90,
        "w": 366
      },
      "collisionPolicy": "measured-mattress-top",
      "usefulSurfaceSource": {
        "x": 25,
        "y": 90,
        "w": 366,
        "h": 3,
        "kind": "mattress"
      },
      "capacity": "lying-adult",
      "minimumUsableLength": 110
    },
    "escape-pods": {
      "id": "escape-pods",
      "source": {
        "x": 538,
        "y": 678,
        "w": 336,
        "h": 222
      },
      "footSourceY": 221,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 520,
        "y": 616,
        "w": 380,
        "h": 314
      },
      "collisionTopSource": {
        "x": 2,
        "y": 2,
        "w": 332
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "durandal": {
      "id": "durandal",
      "source": {
        "x": 923,
        "y": 635,
        "w": 300,
        "h": 265
      },
      "footSourceY": 264,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 900,
        "y": 616,
        "w": 354,
        "h": 314
      },
      "collisionTopSource": {
        "x": 1,
        "y": 2,
        "w": 298
      },
      "collisionPolicy": "one-way-object-top-bounds"
    },
    "bioforge": {
      "id": "bioforge",
      "source": {
        "x": 41,
        "y": 947,
        "w": 398,
        "h": 245
      },
      "footSourceY": 244,
      "projection": "strict-side-elevation",
      "sourceTile": {
        "x": 0,
        "y": 930,
        "w": 1254,
        "h": 324
      },
      "collisionTopSource": {
        "x": 1,
        "y": 2,
        "w": 396
      },
      "collisionPolicy": "one-way-object-top-bounds"
    }
  }
});

export function getHubAnnexStationCellV139(id){
  return Object.hasOwn(HUB_ANNEX_STATION_ATLAS_V139.cells,id)?HUB_ANNEX_STATION_ATLAS_V139.cells[id]:null;
}
