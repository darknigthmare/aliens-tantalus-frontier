# Données de régression et génération V9

`base-v8.json` est le contenu complet V8 avant extension. `make_data_v9.mjs` le lit, ajoute les huit sentinelles et trente règles sans modifier les objets rooms, chapters, links, characters, creatures ou investigations.

Les anciens base-v1…v7 et exports de test sont conservés pour les tests de migration et de non-régression. Ils ne sont pas les données chargées par le jeu. Le runtime utilise `src/alien-earth-data.js`, produit avec `npm run data` puis incorporé au HTML par `npm run build`.

Les exports historiques sont des profils de QA, pas la progression personnelle de l’utilisateur.
