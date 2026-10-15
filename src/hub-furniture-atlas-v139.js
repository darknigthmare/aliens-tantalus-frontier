const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

/** Original measured furniture elevations. Feet and useful surfaces are
 * relative to each crop, so scale follows adult capacity/worktop height.
 * Unreviewed oblique candidates are deliberately unavailable to rendering. */
export const HUB_FURNITURE_ATLAS_V139 = freeze({
  "asset": "/assets/openai/hub/props/v139/furniture-atlas.png",
  "width": 1254,
  "height": 1254,
  "sha256": "457f93fb84215263e4a2969c7a6de8697f723870cd2f306a4bbd34095779cfd4",
  "sourceStatus": "reviewed-original-furniture-elevations",
  "alphaPolicy": "original-rgba-unchanged",
  "cropPolicy": "measured-silhouette-alpha16-with-two-pixel-padding",
  "footPolicy": "opaque-alpha192-contact-bottom-relative-to-crop",
  "unadmittedViews": [
    "medical-bed-oblique",
    "dining-table-oblique",
    "workbench-oblique"
  ],
  "unadmittedReason": "Candidate oblique pixels do not establish the room depth-vector geometry; only the six reviewed frontal elevations are sampled.",
  "cells": {
    "medical-bed-side": {
      "id": "medical-bed-side",
      "source": {
        "x": 29,
        "y": 116,
        "w": 396,
        "h": 261
      },
      "footSourceY": 258,
      "usefulSurfaceSource": {
        "x": 12,
        "y": 122,
        "w": 330,
        "h": 3,
        "kind": "mattress"
      },
      "width": 142,
      "height": 93.5909090909091,
      "projection": "strict-side-elevation",
      "mount": "floor",
      "interactive": false,
      "collidable": false
    },
    "dining-table-side": {
      "id": "dining-table-side",
      "source": {
        "x": 443,
        "y": 227,
        "w": 376,
        "h": 150
      },
      "footSourceY": 147,
      "usefulSurfaceSource": {
        "x": 12,
        "y": 28,
        "w": 352,
        "h": 3,
        "kind": "worktop"
      },
      "width": 126,
      "height": 50.265957446808514,
      "projection": "strict-side-elevation",
      "mount": "floor",
      "interactive": false,
      "collidable": false,
      "occupiedSource": [
        {
          "x": 44,
          "y": 7,
          "w": 30,
          "h": 23
        },
        {
          "x": 170,
          "y": 7,
          "w": 30,
          "h": 23
        },
        {
          "x": 294,
          "y": 7,
          "w": 30,
          "h": 23
        }
      ]
    },
    "workbench-side": {
      "id": "workbench-side",
      "source": {
        "x": 848,
        "y": 138,
        "w": 377,
        "h": 239
      },
      "footSourceY": 236,
      "usefulSurfaceSource": {
        "x": 8,
        "y": 117,
        "w": 359,
        "h": 3,
        "kind": "worktop"
      },
      "width": 146,
      "height": 92.55702917771883,
      "projection": "strict-side-elevation",
      "mount": "floor",
      "interactive": false,
      "collidable": false,
      "occupiedSource": [
        {
          "x": 310,
          "y": 40,
          "w": 60,
          "h": 81
        }
      ]
    },
    "seat-side": {
      "id": "seat-side",
      "source": {
        "x": 114,
        "y": 876,
        "w": 214,
        "h": 305
      },
      "footSourceY": 302,
      "usefulSurfaceSource": {
        "x": 10,
        "y": 169,
        "w": 125,
        "h": 3,
        "kind": "seat"
      },
      "width": 40,
      "height": 57.00934579439252,
      "projection": "strict-side-elevation",
      "mount": "floor",
      "interactive": false,
      "collidable": false
    },
    "wall-handwash": {
      "id": "wall-handwash",
      "source": {
        "x": 529,
        "y": 883,
        "w": 194,
        "h": 257
      },
      "footSourceY": 252,
      "usefulSurfaceSource": {
        "x": 12,
        "y": 142,
        "w": 166,
        "h": 3,
        "kind": "basin"
      },
      "width": 50,
      "height": 66.23711340206185,
      "projection": "strict-side-elevation",
      "mount": "rear-wall",
      "interactive": false,
      "collidable": false
    },
    "service-sink": {
      "id": "service-sink",
      "source": {
        "x": 878,
        "y": 885,
        "w": 320,
        "h": 296
      },
      "footSourceY": 293,
      "usefulSurfaceSource": {
        "x": 10,
        "y": 96,
        "w": 294,
        "h": 3,
        "kind": "basin"
      },
      "width": 75,
      "height": 69.375,
      "projection": "strict-side-elevation",
      "mount": "floor",
      "interactive": false,
      "collidable": false
    }
  }
});

export function getHubFurnitureCellV139(id) {
  return Object.hasOwn(HUB_FURNITURE_ATLAS_V139.cells, id) ? HUB_FURNITURE_ATLAS_V139.cells[id] : null;
}
