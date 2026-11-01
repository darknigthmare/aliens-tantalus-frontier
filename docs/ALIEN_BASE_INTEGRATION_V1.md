# Passerelle `alien_base` v1 — Tantalus

Ce dépôt consomme un **snapshot autonome** du registre privé `darknigthmare/alien_base` au commit `3f124325` (PR #4). Le module `src/alien-base-bridge-v1.js` contient des identités minimales et les correspondances exactes de sauvegardes ; il ne transporte ni références privées d'autres dépôts, ni statistiques de combat, ni assets licenciés.

**Points d'entrée :** `resolveAlienBaseIdentityV1(group, localId)` et `summarizeAlienBaseCoverageV1()` sont réexportés par `src/content.js`. Le statut `sharedEntityId` enrichit `getEnemyCatalogPolicyV105` sans supprimer les anciens IDs, références d'animations ou classifications.

**Groupes :** enemies (568 variants historiques + 3 dossiers), weapons (base + distincts), equipment, vehicles, factions, crew, afe2Roster, personnelReference. Les variantes de finition, qualité, âge ou équipement sont identifiées comme **variantes de gameplay**, jamais une nouvelle espèce attestée. Les modèles AFE2 Siren/Gasbag/Wey-Yu Worker sont explicitement non résolus.

**QA :** `npm run test:alien-base`. Les modèles append-only ne sont disponibles en mission que si leurs gates d'admission/visuels locaux l'autorisent ; être dans le registre ne les débloque pas. La logique de sauvegarde et l'équilibrage du jeu ne changent pas.

**Sync :** depuis un clone autorisé de `alien_base`, utiliser `scripts/export-snapshot.mjs aliens-tantalus-frontier`, revoir le delta et réémettre le module. Éviter les imports distants depuis le navigateur, `alien_base` est privé.
