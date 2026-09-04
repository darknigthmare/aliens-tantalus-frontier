# QA navigateur V67 — Registre ChatGPT et Cargo Brutal

Date : 4 septembre 2026.

Base testée : `http://127.0.0.1:4174/`, build local `67.0.0`.

## Parcours utilisateur vérifié

1. l’écran titre affiche `ALIENS: TANTALUS FRONTIER v67` et `VERSION 67.0.0` ;
2. `APPUYER POUR COMMENCER` ouvre le menu ;
3. `ENTRER SUR LE TANTALUS` ouvre le niveau physique du hub ;
4. `QUITTER VERS COMMANDEMENT`, puis `03 Opérations`, ouvre la planification ;
5. le registre affiche exactement 19 cartes : 1 boucle jouable, 9 partielles, 9 manquantes ;
6. seul `CARGO BRUTAL` propose `PLANIFIER` ; les 18 autres statuts restent désactivés ;
7. le plan annonce explicitement `Insertion à pied` et le `P-5000 ... fourni dans la zone de mission` ;
8. les étapes Briefing, Préparation, Approche, Déploiement et Prise de contrôle aboutissent au canvas de mission ;
9. le moteur démarre `special-cargo-brutal` en phase `restore-power` ;
10. le joueur est à pied, le P-5000 existe et reste inoccupé, et l’objectif affiché est `RÉTABLIR LA PUISSANCE DE SOUTE`.

## Contrôles runtime

- canvas CSS visible : largeur observée `1006.21875 px` pour un buffer `1280 × 720` ;
- échantillonnage de 527 pixels du canvas : 128 couleurs distinctes et aucun pixel transparent, ce qui exclut un canvas vide ;
- overlay d’erreur : absent ;
- console navigateur : aucune entrée ;
- erreurs de page : aucune entrée ;
- chargement HTTP `200` confirmé pour `cargo-brutal-runtime-v67.js`, `cargo-brutal-visuals-v67.js`, l’atlas des props et la planche de Shaw/Ruiz/Kessler.

## Accessibilité

L’audit axe-core 4.12.1 initial a identifié :

- un filtre `#campaign-mode` sans nom accessible ;
- trois blocs du bandeau hors landmark.

La correction V67 ajoute le nom explicite du filtre et de la recherche, ainsi que `role="banner"` au bandeau. La réexécution sur toute la vue Opérations donne :

- `0` violation ;
- `19` règles réussies ;
- `1` contrôle incomplet : le contraste de 211 nœuds ne peut pas être calculé automatiquement à travers les dégradés CSS et reste à contrôler visuellement.

Le registre `.special-operations-registry` n’avait déjà aucune violation isolée.

## Limite de la preuve

Cette QA valide l’accès, le lancement, le premier état jouable et le chargement réel des deux planches dédiées acceptées. La boucle complète jusqu’à l’extraction, ses échecs et sa reprise sont validés par `tests/cargo-brutal-v67.test.mjs`. Seule la candidate Matriarche reste exclue : ses appendices franchissaient les cellules et empêchaient une normalisation professionnelle, conformément à `docs/V67_CARGO_BRUTAL_ART_QA.md`.
