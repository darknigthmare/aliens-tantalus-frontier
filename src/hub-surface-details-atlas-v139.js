const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

/** Small original details rest on measured useful surfaces, never on an
 * invented floor inside the image. Source pixels and alpha are unchanged. */
export const HUB_SURFACE_DETAILS_ATLAS_V139 = freeze({
  "asset": "/assets/openai/hub/props/v139/surface-details-atlas.png",
  "width": 1254,
  "height": 1254,
  "sha256": "e508e966a02de6bcd9d410ebce29e5f4b7cee4c97c694d6d2bd232c0575af75f",
  "sourceStatus": "reviewed-original-frontal-surface-details",
  "alphaPolicy": "original-rgba-unchanged",
  "cropPolicy": "measured-silhouette-alpha16-with-two-pixel-padding",
  "footPolicy": "opaque-alpha192-contact-bottom-relative-to-crop",
  "cells": {
    "meal-tray": {
      "id": "meal-tray",
      "source": {
        "x": 35,
        "y": 138,
        "w": 381,
        "h": 150
      },
      "footSourceY": 146,
      "width": 26,
      "height": 10.236220472440944,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "sterile-instrument-tray": {
      "id": "sterile-instrument-tray",
      "source": {
        "x": 446,
        "y": 179,
        "w": 401,
        "h": 110
      },
      "footSourceY": 106,
      "width": 28,
      "height": 7.6807980049875315,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "folded-linen": {
      "id": "folded-linen",
      "source": {
        "x": 908,
        "y": 143,
        "w": 299,
        "h": 153
      },
      "footSourceY": 149,
      "width": 26,
      "height": 13.304347826086957,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "sample-tube-rack": {
      "id": "sample-tube-rack",
      "source": {
        "x": 42,
        "y": 397,
        "w": 379,
        "h": 199
      },
      "footSourceY": 195,
      "width": 24,
      "height": 12.601583113456464,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "sealed-specimen-set": {
      "id": "sealed-specimen-set",
      "source": {
        "x": 461,
        "y": 436,
        "w": 392,
        "h": 159
      },
      "footSourceY": 156,
      "width": 26,
      "height": 10.545918367346939,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "document-binders": {
      "id": "document-binders",
      "source": {
        "x": 901,
        "y": 367,
        "w": 301,
        "h": 229
      },
      "footSourceY": 225,
      "width": 30,
      "height": 22.823920265780732,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "tool-roll": {
      "id": "tool-roll",
      "source": {
        "x": 41,
        "y": 689,
        "w": 408,
        "h": 217
      },
      "footSourceY": 213,
      "width": 30,
      "height": 15.955882352941176,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "electronic-test-meter": {
      "id": "electronic-test-meter",
      "source": {
        "x": 471,
        "y": 682,
        "w": 354,
        "h": 224
      },
      "footSourceY": 220,
      "width": 20,
      "height": 12.655367231638419,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "filter-cartridges": {
      "id": "filter-cartridges",
      "source": {
        "x": 885,
        "y": 714,
        "w": 317,
        "h": 192
      },
      "footSourceY": 188,
      "width": 26,
      "height": 15.74763406940063,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "soap-towel-set": {
      "id": "soap-towel-set",
      "source": {
        "x": 42,
        "y": 967,
        "w": 383,
        "h": 227
      },
      "footSourceY": 224,
      "width": 24,
      "height": 14.224543080939947,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "book-and-mug": {
      "id": "book-and-mug",
      "source": {
        "x": 514,
        "y": 958,
        "w": 244,
        "h": 236
      },
      "footSourceY": 233,
      "width": 28,
      "height": 27.081967213114755,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    },
    "spare-fittings-tray": {
      "id": "spare-fittings-tray",
      "source": {
        "x": 811,
        "y": 1077,
        "w": 424,
        "h": 117
      },
      "footSourceY": 114,
      "width": 28,
      "height": 7.726415094339623,
      "projection": "strict-side-elevation",
      "support": "authored-horizontal-surface",
      "interactive": false,
      "collidable": false
    }
  }

});

export function getHubSurfaceDetailCellV139(id) {
  return Object.hasOwn(HUB_SURFACE_DETAILS_ATLAS_V139.cells, id) ? HUB_SURFACE_DETAILS_ATLAS_V139.cells[id] : null;
}
