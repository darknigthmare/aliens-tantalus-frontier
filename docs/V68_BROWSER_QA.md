# V68 — QA navigateur de sortie

Date : 2026-09-04

Cible : `ALIENS: TANTALUS FRONTIER v68`

Navigateur : Chromium, bureau 1280 × 720, DPR 1

## Parcours utilisateur vérifié

- Écran-titre V68 chargé, puis menu principal ouvert.
- Entrée réelle dans le hub USS Tantalus : le joueur arrive sur le niveau Canvas, pas sur une grille de boutons.
- Retour au centre de commandement, puis ouverture de l'onglet Archives.
- État initial Archives conforme : terminal vide, quatre preuves annoncées comme manquantes et aucun faux document injecté.
- Aucun identifiant DOM dupliqué et aucune référence `aria-labelledby`, `aria-describedby` ou `aria-controls` cassée dans les deux lecteurs d'archives.
- Onglet Opérations conforme : 19 conversations recensées, deux lots jouables et la directive Archives narratives marquée `PARTIELLE · LOT JOUABLE`.
- Planification de `special-narrative-qz17`, puis déploiement Echo-9 depuis le bouton opérationnel.
- Séquence d'insertion franchie par ses commandes réelles : briefing, préparation, déploiement et prise de contrôle.
- Runtime atteint sur le Canvas `Mission Metroidvania jouable`, avec Motion Tracker et Medkit disponibles.

## QZ-17 — contrôle indépendant

- Les quatre objets se récupèrent physiquement et une seule fois, à portée du personnage.
- L'ouverture des Archives met réellement le moteur en pause, rend les autres surfaces inertes et piège correctement le focus au clavier.
- La fermeture restaure l'état de pause antérieur et le focus du Canvas sans arrêter le moteur.
- L'extraction reste refusée tant que les quatre preuves et un verdict cohérent ne sont pas persistés.
- Route maintenance : cloison arrière fermée et unique passage de maintenance ouvert.
- Route quarantaine : cloison arrière ouverte et tous les conduits verrouillés.
- Les événements génériques ne peuvent pas annuler le choix et une reprise falsifiée est rejetée.
- Le bonus de cinq points d'intel est transféré une seule fois vers la recherche stratégique.
- Matrice ciblée du contre-audit : 54 tests réussis sur 54, aucun défaut P0/P1 restant.

## Accessibilité et console

- Audit axe-core du runtime à 1280 × 720 : 5 règles réussies, 0 incomplète, 0 violation WCAG 2 A/AA.
- Console Chromium : 0 message d'erreur.
- Erreurs page : 0.

## Ressources HTTP vérifiées

Toutes les cibles suivantes répondent `200` avec leur type MIME attendu :

- `/`
- `/src/narrative-collectables-v68.js`
- `/src/narrative-collectables-runtime-v68.js`
- `/src/narrative-archives-ui-v68.js`
- `/assets/openai/sprites/normalized/props/qz17-narrative-collectables-atlas-v68.png`
- `/manifest.webmanifest`
- les quatre icônes PWA V68 `192`, `512`, `maskable-192` et `maskable-512`

## Verdict

Le sous-lot QZ-17 est jouable, sauvegardable, accessible au clavier et prêt à être publié. La promesse globale « Archives narratives étendues » reste volontairement `partial` tant que les autres chaînes et les médias audio/vidéo réels n'ont pas été produits.
