# QA navigateur V76 / sprites V75

Vérifié le 8 septembre 2026 avec Chrome local via CDP, contexte de stockage isolé.

## Dialogue du hub

`node tests/browser-hub-dialogue-v76.mjs` : PASS.

Tailles contrôlées : 1280×720, 390×844 et 844×390. Le test ouvre le dialogue court de l'armurerie puis le véritable dialogue de Mara Vega à six choix. Il vérifie la couche modale hors du shell transformé, le hit-test, le focus initial, Tab/Maj+Tab, Échap, le clic de fermeture, la reprise du hub, le portrait illustré et la cellule PNJ 4×4.

Défauts reproduits puis corrigés :

- Paysage : le dialogue PNJ avait une hauteur de contenu de 1452px pour 324px disponibles, avec overflow:hidden. Annuler se trouvait entre y928 et y965 dans une fenêtre de 390px. La capture `alien-tantalus-hub-dialogue-v76-npc-landscape-before.png` conserve cet état.
- Le portrait sprite était dimensionné par toute la hauteur du panneau et partiellement hors cadre. Il utilise désormais une cellule carrée entière, centrée, extraite visuellement de la grille 4×4. Dimensions réellement mesurées : environ 323px sur desktop, 285px en portrait et 219px en paysage.
- Après le correctif de défilement, Maj+Tab pouvait encore placer le focus sur Annuler hors champ. Le focus interne défile désormais vers le contrôle le plus proche ; la restauration du focus externe conserve preventScroll. Le contrôle est visible entre y794 et y831 en portrait et entre y312 et y349 en paysage.

Les captures `*-scrolled.png` suivent un véritable événement de molette si un défilement est nécessaire puis un clic de fermeture. `hub-dialogue-report.json` conserve les mesures et les neuf captures finales. Zéro exception JavaScript ou erreur console durant la séquence.

## Prowler015 et Ceto051

`node tests/browser-enemies-v75.mjs` : PASS.

- Deux fichiers atlas servis HTTP200 et SHA-256 conformes aux octets revus.
- Chaque atlas : 1024×2048px, grille 4×8, 32 cellules décodées uniques et non vides.
- Rendu effectif par le moteur : 32 poses dans chacun des deux sens pour chaque profil, soit 128 appels de rendu réussis. Aucune autre identité de plaque dans les échantillons.
- Géométrie runtime : Prowler96×88, Ceto156×100.
- Démarrage contrôlé du véritable moteur sur planète Ceto / template planet-exterior : exactement un prédateur dans son bassin, corps contenu dans les limites.
- Captures du rendu d'attaque, images1/3/5/8 dans les deux directions, et du bassin réel. Zéro erreur console/exception.

Le rapport complet est `enemies-v75-browser-report.json`. Les captures de poses constituent un banc de rendu en navigateur, pas un niveau supplémentaire. Le contrôle du bassin n'est pas un parcours complet de la campagne Abysse et ne démontre ni nage libre marine ni refonte artistique complète du décor. Le bassin conserve l'agencement actuel de plateformes du template planète.

## Exécution

Serveur : `PORT=4176 node scripts/dev.mjs` depuis la racine du dépôt. Chrome utilise le port CDP9226. Les scripts acceptent `APP_URL` et `CDP_ENDPOINT`. Le test ennemis accepte `QA_OUTPUT`; le test hub écrit ses captures dans TEMP et son rapport dans `REPORT_PATH`. Chaque script détruit le contexte navigateur créé.
