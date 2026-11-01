# Alien_base ↔ Tantalus Frontier : statut d'intégration

Le snapshot `src/alien-base-bridge-v1.js` regroupe 1 217 ID historiques, 252 identités (sous-ensemble de `darknigthmare/alien_base` PR #4, commit 3f124325), sans dégâts, PV ni contenu privé des autres dépôts.

**Statut : librairie de correspondance intégrée au dépôt, non branchée sur l'import principal.** Le jeu est protégé par une succession de reçus de contrôle SHA-256 pour ses fichiers runtime (V156-V178). Cette PR ne réécrit aucun reçu historique et **n'active pas** la dépendance dans le gameplay public ; une PR ultérieure de maintenance devra ajouter un successeur de réception propre et audité avant de relier `src/content.js`, la taxonomie et le service worker.

Validation indépendante via `node --test .github/alien-base-contract.mjs`. Les anciens identifiants de sauvegarde et fichiers de sortie restent inchangés. Les entrées Siren, Gasbag, Wey-Yu Worker sont non résolues et non jouables par simple import.
