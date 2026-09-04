# QA art V70 — Systèmes de survie Alien

Date : 5 septembre 2026.

## Périmètre

Cette fiche documente l’atlas dédié aux systèmes physiques de l’opération `special-alien-survival-systems`. Elle ne constitue pas, à elle seule, une validation de la mission complète ni de la publication V70.

## Source OpenAI ImageGen

`assets/openai/sprites/frames/v70/alien-survival-systems-atlas-openai-v70.png`

- création originale OpenAI ImageGen pour le projet ;
- source RGB `1 774 × 887 px` ;
- SHA-256 source : `433bc47f2806b774add9e36ff90132a4e1db11b2911359bcdf5755e51e1f4c22` ;
- pipeline déclaré : `OpenAI ImageGen master + deterministic checker cleanup` ;
- aucun sprite officiel extrait ou redistribué ; `canonExact: false`.

La recette complète est conservée dans `assets/openai/sprites/metadata/v70/alien-survival-systems-v70.json` sous le contrat `alien-survival-systems-atlas-v70`.

## Atlas runtime

`assets/openai/sprites/normalized/props/alien-survival-systems-atlas-v70.png`

- traitement reproductible : `py scripts/process-alien-survival-art-v70.py` ;
- PNG RGBA `1 024 × 512 px` ;
- grille `4 × 2`, cellules `256 × 256 px`, garde de `8 px` ;
- `46,221 %` de pixels transparents après retrait de `747 368` pixels du damier source ;
- SHA-256 runtime verrouillé : `6f3d8d37c38d6528609e870adb815f550c4d98f998379e42dc49a4046a8ce366`.

Les huit cellules, dans l’ordre du registre, sont :

1. `power-distributor-off` ;
2. `life-support-powered` ;
3. `security-powered` ;
4. `cctv-powered` ;
5. `pressure-valve` ;
6. `cctv-console` ;
7. `airlock-welding` ;
8. `self-destruct-armed`.

## Réemplois assumés

V70 ne duplique pas les bitmaps déjà disponibles pour le kit de soudure, la batterie portable, la tenue pressurisée, le sas `pressure-airlock` V58 et le danger d’acide au sol. Le registre `src/alien-survival-visuals-v70.js` les référence explicitement avec leur rôle gameplay. Ces réemplois ne sont pas comptés parmi les huit cellules du nouvel atlas.

## Décision et gates

Le contrat, la provenance, le chemin de metadata et le hash sont épinglés dans le registre avec `originalProjectAsset: true` et `canonExact: false`.

- test art strict : **RÉUSSI**, dimensions, alpha, huit occupations et hash vérifiés ;
- build/PWA : **RÉUSSI**, atlas normalisé inclus, master et metadata exclus ;
- production Vercel : **RÉUSSIE**, atlas runtime en 200 ; master et metadata de production en 404 ;
- inspection directe de l’atlas : **RÉUSSIE**, huit silhouettes système distinctes, perspective industrielle et marges de cellule cohérentes ;
- inspection en jeu 1280 × 720 : **RÉUSSIE**, consoles posées sur leurs surfaces et atlas chargé par le vrai moteur ;
- contrôle mobile 390 × 844 : **RÉUSSI**, dock défilable sans masquer définitivement les commandes avancées.

L’atlas valide donc la production artistique de ce lot précis. Il ne transforme pas les autres conversations `partial` ou `missing` en contenu achevé.
