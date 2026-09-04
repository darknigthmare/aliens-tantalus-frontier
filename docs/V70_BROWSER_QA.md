# QA navigateur V70 — Systèmes de survie Alien

Date : 5 septembre 2026.

## Périmètre

Parcours exécuté dans le vrai shell `ALIENS: TANTALUS FRONTIER v70`, avec la campagne `special-alien-survival-systems`, le niveau `ship-interior-vertical` et le runtime de production. Les captures de travail restent hors dépôt ; les mesures ci-dessous proviennent du navigateur automatisé et des APIs publiques du moteur.

## Défauts détectés puis corrigés

1. Des contacts et flaques restaurés pouvaient apparaître dans la zone d’insertion et tuer le joueur avant qu’il puisse agir. La reprise conserve les menaces mais les replace sur des surfaces physiques derrière la zone sûre et supprime les projectiles hostiles proches.
2. L’objectif générique `escape the quarantine` appliquait encore sa limite de 105 secondes avant même l’armement. V70 laisse désormais ce délai générique inactif ; le seul délai létal est l’autodestruction démarrée après les deux clés physiques.
3. La topologie pression associait mal les deux portes arrière. `aft-bulkhead` sépare maintenant passerelle et extraction ; `outer-airlock` relie la chambre d’extraction au vide extérieur sans créer une salle jouable fictive.
4. Le dock ne suivait la proximité qu’après certains événements. Son rafraîchissement borné à 8 Hz suit maintenant déplacement, salle, pression, prompts et disponibilité des commandes.
5. Les deux autorisations pouvaient rester valides après coupure sécurité. L’armement revérifie le circuit au moment de l’action.

## Bureau 1280 × 720

- écran titre chargé, registre V70 visible et opération active ouvrable ;
- checkpoint repris avec `Entrée`, joueur vivant à 55 PV ;
- mission restée `active` alors que le temps générique dépassait 105 secondes ;
- rapport d’insertion : rayon 760, trois contacts déplacés, aucune menace restante dans le rayon ;
- déplacement réel `D`, puis `D + Espace` : position 159 → 602 → 1 125 px ;
- passage physique de `ship-docking` à `ship-cargo` sans mutation directe de coordonnées ;
- HUD automatiquement passé de 100 kPa / 100 % O₂ à 88 kPa / 86 % O₂ ;
- danger `ship-decompression` déclenché et acide visible dans la salle cargo ;
- rendu du niveau, couches industrielles, plateformes, personnages et dock sans écran de défaite résiduel.

## Mobile 390 × 844

- canvas, journal et dix commandes tactiles visibles ;
- corps du dock : 190 px affichés pour 385 px de contenu, défilement maximal atteint à 195 px ;
- commandes CCTV et autodestruction atteignables après défilement ;
- appui tactile maintenu sur `→` : déplacement réel de 158 px, mission restée active et joueur à 55 PV.

## Console et accessibilité

- erreurs navigateur : 0 ;
- messages console problématiques : 0 ;
- axe-core 4.12.1 : 35 règles réussies, 0 violation ;
- 1 contrôle incomplet : contraste non calculable automatiquement sur 18 nœuds placés sur gradients ou partiellement masqués, sans violation confirmée ;
- absence d’overlay Vite/Webpack/Next et contenu non vide.

## Gates automatisées associées

- V70 ciblé : 46/46 ;
- suite complète : 887 réussites, 1 skip Windows attendu, 0 échec sur 888 ;
- lint : 268 modules ;
- build : v70.0.0, 3 450 entrées catalogue ;
- sortie publique locale : CSS, runtime et atlas normalisé présents ; master ImageGen et metadata absents.

La vérification HTTP de la cible Vercel est renseignée dans l’historique V70 après publication.
