# Contrôle navigateur public V76

Le 8 septembre 2026, les pilotes `tests/browser-hub-dialogue-v76.mjs` et `tests/browser-enemies-v75.mjs` ont été exécutés avec `APP_URL=https://aliens-tantalus-frontier.vercel.app/` dans des contextes Chrome isolés. Les modules runtime et les images provenaient de cette origine publique. Aucun code source du pilote ou du jeu n'a été modifié pour cette exécution.

Résultat : les deux pilotes PASS, aucune exception JavaScript ni erreur console. Titre réellement chargé : `ALIENS: TANTALUS FRONTIER v76`.

- Hub : station et PNJ à six choix, 1280×720 / 390×844 / 844×390, portraits visibles, focus et défilement, Maj+Tab vers Annuler visible, fermeture et reprise.
- Ennemis : deux atlas HTTP200 avec SHA-256 exacts, 32 cellules uniques chacun, 128 rendus de production réussis dans les deux sens. Géométrie Prowler96×88 et Ceto156×100. Un seul Ceto dans le bassin du template planète de Ceto, corps contenu.

Les deux rapports JSON et les captures adjacentes constituent les preuves de cette exécution publique. La capture du bassin est un JPEG ; aucun doublon PNG lourd n'a été produit. Les preuves locales antérieures restent séparées.

La portée reste celle des pilotes : rendu et bassin contrôlés, sans revendication de parcours complet de campagne Abysse, de nage libre marine ou de direction artistique finale du niveau.
