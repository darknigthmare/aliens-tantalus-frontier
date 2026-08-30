# V63 — audit PNG, alpha, halo et grilles

## Verdict

L'audit reproductible V63 couvre **402 PNG destinés au rendu** parmi 651 PNG découverts. Il distingue les sprites et calques à transparence obligatoire des scènes opaques plein cadre.

- 0 erreur de production confirmée ;
- 192 plaques normalisées conformes à leur grille ;
- 0 fond quasi blanc opaque connecté au bord ;
- 0 erreur alpha sur les assets composites ;
- 13 candidats halo à revoir visuellement, sans les déclarer automatiquement fautifs ;
- 230 masters bruts exclus parce que le runtime consomme leurs dérivés normalisés ou nettoyés.

Le rapport machine complet est `docs/references/V63_PNG_ALPHA_AUDIT.json`.

## Nouvelle plaque V63

`assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png` est auditée comme sprite RGBA 1 024 × 1 024 : 82,9189 % de pixels transparents, aucune composante blanche de bord, aucune anomalie de grille et aucun candidat halo. La gate spécialisée vérifie en plus les gardes, les coutures et l'absence de résidu magenta.

## Candidats halo conservés pour revue

Les 13 candidats restent ceux de V62 : baie véhicule, terminal bridge, workbench, entrée de conduit, huit outils et Ripper Acid Projector. Ils doivent être comparés sur fonds clair et sombre avant toute retouche ; une lampe ou une bordure métallique claire n'est pas corrigée automatiquement.

## Reproduction

```powershell
py scripts/audit-png-alpha-v63.py --fail-on error
```

La gate échoue sur toute erreur confirmée. `--fail-on review` reste volontairement disponible pour une passe manuelle stricte.
