# AVP (2004) — Sources de sprites de reliefs, lot V0.01

Date : 26 novembre 2026. Suivi de la [PR #55](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/55), sur la branche cumulative `claude/nifty-shannon-qpy1hl` (base `b0df1877a058f0818f96437fdfdea3f21ba7f415`).

Le premier lot de trois PNG individuels a été généré à partir de photographies d’accessoires de tournage publiées par Propstore : un panneau mural rituel, une dalle au motif de serpent et la dalle au masque située à gauche sur la photographie de la paire. Le [manifeste](manifest.json) conserve les dimensions, tailles, SHA256, SHA Git, références exactes, empreintes des photographies consultées, prompts complets et résultats du contrôle alpha. La [galerie](GALLERY.md) permet la revue.

## Correspondance avec le DLC

Le catalogue existant `scripts/dlc/avp-2004/web/fidelity-catalog.js` emploie l’asset vectoriel `relief` pour `AVP2004-159` (panneaux hiéroglyphiques) et `AVP2004-249` (ornements rituels). Les cinq fichiers de ce lot sont des candidats à l’enrichissement de ces décors. Ils ne constituent pas une traduction des inscriptions de `AVP2004-140` et ne remplacent pas automatiquement l’asset générique partagé par ces entrées.

## Statut de fidélité et de livraison

- **Généré : oui**, cinq objets séparés, avec canal alpha RGBA.
- **Conservé et traçable : oui**, fichiers originaux du générateur sans retouche, empreintes et instructions dans le manifeste.
- **Fidélité 1:1 certifiée : non.** L’examen visuel retrouve les compositions de référence ; les microreliefs, proportions fines, perçages et textures peuvent différer et demandent une comparaison supplémentaire.
- **Détourage validé pour le jeu : non.** L’alpha médian des pixels non nuls varie de 252 à 253/255 selon le fichier. Des pixels très faibles existent au-delà de la silhouette principale ; les boîtes au seuil128 restent à l’intérieur du canevas. Le manifeste expose ces mesures sans les confondre avec une validation d’intégration.
- **Intégré au moteur ou aux animations : non.** Ce lot reste une source candidate. Aucun changement des scènes, sauvegardes, collisions, rendu ou traductions de glyphes.

Les photographies externes ne sont pas recopiées dans le dépôt. Leurs URL et empreintes identifient exactement les références consultées. Les nouveaux PNG ne doivent pas servir à reconstruire une information du film absente de ces références.

## Suite nécessaire

Valider les formes sur des plans du film, corriger le détourage, puis vérifier l’échelle, les points d’ancrage et la lisibilité dans les salles concernées avant toute admission dans le runtime. Le chenillé `AVP2004-115` reste à faire : la vue du film retrouvée ne suffit pas à certifier sa géométrie latérale. La photo des dalles est une référence frontale ; aucune face arrière n’a été inventée.

## Deuxième passe — deux motifs complémentaires

Deux nouveaux PNG individuels complètent les motifs de la collection photographiée : une dalle au visage couronné et une dalle au visage coiffé. Dans chaque cas, la dalle de gauche sert de référence, sans importer les dégâts ou variantes de celle de droite. Ce complément représente **6 947 550 octets**, pour **5 PNG et 17 995 777 octets au total**. Les trois premières images et leurs entrées de manifeste sont conservées à l’identique.

Les deux sources sont en RGBA, 1254 × 1254 pixels. Le contrôle visuel reconnaît la composition générale, mais ne valide pas chaque relief. Le contrôle alpha retrouve un fond transparent et une silhouette principale contenue dans l’image ; il relève aussi des pixels très faibles en périphérie et un alpha intérieur médian de 252/255 ou 253/255. La consigne de détourage parfaitement net n’est donc pas considérée comme satisfaite. Aucun raccord runtime ni certification 1:1 n’est ajouté.
