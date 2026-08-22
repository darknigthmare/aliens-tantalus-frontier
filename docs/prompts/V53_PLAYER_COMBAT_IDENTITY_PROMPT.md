# V53 — Régénération identity-preserve du joueur

## Statut vérifié au 22 août 2026

- `generationStatus`: `blocked-before-generation`
- `identityVerified`: `false`
- `outputAsset`: `none`
- Deux appels au générateur d’images OpenAI intégré ont échoué avant génération à cause des ACL Windows sur les images de référence.
- Aucun PNG n’a donc été produit, remplacé ou normalisé.
- Le runtime met en quarantaine la plaque combat actuelle : elle ne peut plus afficher un autre personnage pendant le tir, le rechargement, les dégâts ou la mort.

## Références imposées

1. `assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png` — maître absolu de l’identité visuelle.
2. `assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png` — référence de découpage des actions uniquement; son identité différente doit être rejetée.

## Prompt exact soumis à ImageGen

> Use case: identity-preserve. Production 2D side-view metroidvania 4x4 combat sprite sheet. Image 1 is the absolute identity master: preserve exactly the same adult Echo-9 marine, face, body proportions, brown and dark-olive armor, helmet, equipment, rifle, palette, scale and lighting. Image 2 is action-layout reference only; reject its different character design. Exactly sixteen isolated full-body frames in equal cells, transparent background, all facing right. Row 1 aim/ready; row 2 fire/recoil; row 3 reload; row 4 hurt, stagger, fall, final dead pose locked on floor with no recovery. Consistent baseline and 16px safe gutters. One identical person only. No alternate armor, helmet, face, weapon or palette; no text, UI, logo, watermark, scenery, grid lines, extra limbs, clipping, overlap or duplicated anatomy.

## Gate de réintégration

La plaque combat ne pourra repasser à `identityVerified: true` qu’après :

1. génération OpenAI réellement terminée avec provenance conservée;
2. vérification de la même identité sur les seize cellules;
3. orientation source droite et découpage 4 × 4 conforme;
4. normalisation RGBA 1024 × 1024 avec garde transparente de 16 px;
5. contrôle visuel en jeu de la continuité locomotion → tir → rechargement → dégâts → mort.
