# Raccordement Alien_base — Tantalus Frontier

La base centrale commune (`darknigthmare/alien_base`) fournit **88 identités** et **22 sources** via un snapshot versionné sous `vendor/alien-base/catalog.mjs`. Le jeu référence 15 identifiants Tantalus explicites (12 profils du roster AFE2 et trois véhicules de référence).

- `src/alien-base.js` : index et recherche par identifiants.
- `src/afe2-roster-v110.js` : ajout purement descriptif de `alienBaseId` sur chaque ligne.
- Les variantes AFE2 manquantes ou interprétées ne deviennent pas des espèces canoniques.
- Les HP, dégâts, vitesses, statuts `missing`, admissions d'illustrations, sauvegardes et capacités d'IA restent inchangés.
- Le build distribue le catalogue `vendor/` et le service worker le garde en cache hors ligne.

Vérifier : `npm run test:alien-base`, puis `npm run build` et `npm run check`.

Le catalogue n'est pas exhaustif : les milliers de profils procéduraux et les 129 propositions RESEARCH_ONLY du registre d'armes ne deviennent pas du canon ou des équipements jouables sans sources et contrôles individuels.
