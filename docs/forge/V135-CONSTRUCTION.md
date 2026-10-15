# Frontier Forge V135 — Construction paramétrique

Cette passe étend l’éditeur publié V134 (`fd8c8d3b1fd0dab06300482dc3b78a4b64f3b245`). Elle ne change aucun moteur de campagne, asset de personnage ni compilateur natif. Le module V131/V132 historique reste hors de cette branche : les liaisons sont des données d’édition et le bouton natif teste encore la salle active.

## Construire

L’atelier **Construction** crée des salles sous forme de blocs schema 3, immédiatement modifiables avec les outils existants. Il ne s’agit ni d’un nouveau mode de jeu, ni de reproductions d’architectures de films.

Huit programmes : coursive technique, réception de transit, laboratoire de confinement, quartiers de relève, hangar logistique, salle des machines, maintenance et conduits, puits et passerelles. Les programmes organisent les terminaux, les emplacements et les repères ; ils ne créent pas un réacteur, des lits ou des comptoirs fonctionnels. Deux terminaux sont proposés dans les programmes Laboratoire et Salle des machines ; Maintenance dispose de deux conduits. Les éléments décoratifs sont des repères symboliques et sans collision.

Quatre silhouettes : rectangle, aile haute en L, deux ailes hautes et plafond en gradins. Le chemin bas reste continu entre insertion et objectif. Les plafonds, jambages supportés, sols, passerelles et échelles utilisent les types existants. Les puits d’échelle traversent les passerelles sans cellule de plateforme concurrente. Les emplacements d’entrée/sortie restent en bordure ; leur espace de tête est contrôlé dans la grille.

Paramètres : nom, 16–64 colonnes, 12–36 lignes, 1–3 niveaux, insertion à gauche ou droite, variante entière de 0 à 999999, quatre densités de repères décoratifs et 0–6 marqueurs de menace. L’emplacement véhicule est facultatif, réservé au Hangar en Mission. Le Vaisseau le refuse explicitement. Des combinaisons trop petites ou trop denses sont refusées, jamais silencieusement simplifiées.

**Variante suivante** change le numéro reproductible. La variante fait varier les positions des repères et des menaces demandées, pas la silhouette structurelle. À version du générateur, mode et paramètres identiques, les données produites sont identiques.

Cliquer **Prévisualiser** ne modifie ni les salles, ni l’historique, ni la sauvegarde. L’aperçu séparé montre la géométrie et les compteurs physiques, avec un compteur distinct pour les repères décoratifs. **Construire** réalise toute l’opération en une commande annulable. Échap annule l’aperçu sans fermer la Forge ; une modification du document, des paramètres ou des calques invalide l’aperçu.

## Ajouter, relier ou reconstruire

**Nouvelle salle** conserve toutes les salles existantes et génère de nouveaux identifiants. On peut choisir un sas physique libre comme départ ; la création ajoute en même temps une liaison aller-retour vers l’entrée du nouveau secteur. Le sas de départ est vérifié à nouveau au moment de construire : existence, type physique, disponibilité, visibilité et verrouillage.

**Remplacer la salle active** conserve son identifiant et demande confirmation lorsqu’elle contient des blocs. Les sas déjà reliés ne sont conservés que si le nouveau plan contient un sas aux mêmes coordonnées : leur identifiant est alors réutilisé, sans déplacer ni supprimer la connexion. Une incompatibilité refuse tout le remplacement. Les autres blocs reçoivent de nouveaux identifiants. Les autres salles restent inchangées.

Tout bloc verrouillé concerné ou tout calque concerné masqué/verrouillé interdit l’opération. Les limites globales du modèle restent appliquées (32 salles, budgets de blocs et de JSON). Le plan complet est validé avant mutation et recalculé depuis la recette lors de l’application ; un candidat d’aperçu altéré ne peut pas injecter ses cellules dans le projet.

L’éditeur emploie son circuit de sauvegarde habituel. Un secteur peut être construit en mémoire alors qu’une écriture échoue : le statut de sauvegarde reste la référence pour savoir s’il a été enregistré. Exporter avant de quitter en cas de quota ou de conflit.

## Recettes

**Exporter la recette** produit un JSON `format: frontier-forge-recipe`, `version: 1`, avec les paramètres normalisés. Ce fichier n’est pas un projet, ne contient pas toutes les salles et ne sauvegarde pas une session de test. Pour conserver le niveau édité, utiliser l’export de projet habituel.

L’import de recette est limité à 16 Kio, contrôle le format et toutes les valeurs, ne conserve aucun champ exécutable et ne construit rien. Une lecture devenue obsolète après modification de l’atelier ou changement de projet est refusée. Une recette avec véhicule n’est pas importée dans un projet Vaisseau.

## Fiabilité et maintenance

Le diagramme V134 ignore désormais les connexions dont un secteur a temporairement disparu d’un brouillon, au lieu de lever une exception. Le nombre de liaisons invalides non tracées est affiché. Le préchargement du service worker inclut les deux modules de construction et leur CSS ; son identifiant de cache a été renouvelé.

Les tests historiques vérifient la présence de chaque atelier existant au lieu d’exiger arbitrairement exactement cinq onglets. L’étape CI native affiche explicitement qu’aucun adaptateur V131/V132 n’est inclus lorsqu’il est absent ; son exécution vide n’est pas une validation native.

## Reproduire les vérifications

```sh
npm run test:forge
python scripts/verify-forge-browser-v135.py --output /tmp/forge-v135-http
python scripts/verify-forge-browser-v135.py --offline --output /tmp/forge-v135-offline
FORGE_QA_OUTPUT=/tmp/forge-v135-app python scripts/verify-forge-shell-v135.py
```

Les tests Node comprennent les grilles, le déterminisme, les paramètres invalides, les plafonds/échelles, les identifiants, la conservation des liaisons, les permissions, les aperçus obsolètes, les recettes et le passage par le vrai gestionnaire de projets. Les contrôles Chromium utilisent le panneau natif de l’éditeur et ses événements. Le mode HTTP utilise le stockage d’origine de Chromium ; le mode local hors réseau utilise explicitement un stockage mémoire. Le test de l’application charge ses vrais modules et CSS mais substitue l’hôte, le stockage et les médias absents.

**Limites :** aucune simulation des sauts, navigation physique ou validation artistique intégrale ; aucun choix d’espèce de menace, les marqueurs utilisent le catalogue natif ; aucun pilotage de véhicule dans HubGame ; pas de scripting de missions/dialogues, ni de cloud Forge. Augmenter le nombre de cases ne change pas automatiquement les dimensions physiques du monde natif. La PWA complète, le build avec tous les médias et les régressions globales restent à vérifier.
