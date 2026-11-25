# Lire les preuves — V0.9

`RESULTATS_QA_V09.json` est l’agrégat courant. Dix suites Node et huit suites Chromium : leurs numéros historiques désignent la mécanique testée, pas la version du moteur exécuté. Les schémas attendus pour les exports nouveaux visent 9 ; les fixtures historiques gardent leurs véritables schémas.

`results-v09.json` comporte les contrôles de manutention et deux campagnes complètes supplémentaires. `playthrough-handling-normal.json` et `playthrough-handling-assisted.json` enregistrent six manipulations, avec positions avant/après, à partir d’une nouvelle partie. Le pilote utilise les chemins publics du moteur, les entrées de direction et X, les portes et interactions ; il n’injecte ni objectif terminé, ni composant, ni déplacement de chariot. Il connaît les routes et les solutions et choisit automatiquement ses défenses : ce n’est pas un playtest humain.

Les tests unitaires et de navigateur utilisent également des états préparés pour isoler les cas limites. Les captures identifient cette préparation. La situation d’écrasement prépare un adulte immobilisé uniquement pour tester la collision ; ce n’est pas un état de rencontre normal.

Les vérifications Chromium tentent la navigation native. Après `ERR_BLOCKED_BY_ADMINISTRATOR`, elles chargent le document par `set_content` avec un double mémoire explicite du stockage. Cela vérifie l’exécution du code et les commandes, pas la persistance native après fermeture. Les exports/imports sont de vrais fichiers JSON. Les contacts tactiles V0.9 sont injectés via CDP et passent par les vrais événements de pointeur. L’annulation du toucher est également testée.

Un sélecteur de chapitre ambigu a été corrigé dans le test, ainsi qu’un appui F de durée nulle qui pouvait tomber entre deux images : le test maintient F 100 ms. Le bouton X a réellement été déplacé après détection d’un chevauchement avec Écouter. La marge de collision du joueur a été alignée avec celle du graphe de navigation. Ces corrections ne sont pas masquées par la suppression d’assertions.

`PROVENANCE_BASE_V08.json` authentifie la base et les sources modifiées. `fixtures/legacy-v08-provenance.json` contient les quatre instantanés extraits de l’archive V0.8. Les autres fichiers de provenance concernent les bases historiques. Les 32 snapshots sont conservés tels qu’extraits ; les résultats de migrations sont produits par le moteur courant.

L’audit `document-audit-v09.json` est distinct des tests de jeu. Il vérifie plans, coordonnées, légendes, liens, décodage des images et mise en page réelle. Les aperçus sont sous `document-previews-v09` et ne sont pas comptés comme captures de gameplay.

L’audit d’archive extérieur au ZIP contrôle les CRC et toutes les empreintes. Le projet n’a pas été publié et son moteur n’est pas fusionné à l’hôte Tantalus complet.
