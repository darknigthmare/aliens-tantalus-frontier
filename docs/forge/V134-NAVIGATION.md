# Frontier Forge V134 — explorer, disposer et préserver les projets

Base : PR #7 à `b5eb12e9aaec05226551de0b05ab264c92814966`. Cette passe continue les outils V133 de la branche publiée. Elle ne publie pas le compilateur ou les transitions natifs V131/V132 restés dans la cumulative locale précédente. Le test natif de cette branche reste limité à la salle active.

## Disposition avec aperçu

Dans Outils, ouvrir **Aligner, espacer et cadrer**. Les neuf commandes permettent l’alignement gauche/centre/droite, haut/centre/bas, l’espacement horizontal/vertical et l’alignement sur un pas de 1 à 16 cases. Choisir comme cadre la sélection ou la salle entière.

Par défaut, les blocs sélectionnés qui se touchent orthogonalement sont regroupés ; deux couches sur une même case appartiennent au même groupe. Les diagonales ne réunissent pas les groupes. Le mode « Chaque bloc séparément » traite chaque case seule. Ce sont des regroupements calculés, pas des objets persistants ni des assemblages liés.

**Prévisualiser** ne déplace rien et n’enregistre rien. L’aperçu montre les destinations et les conflits. **Appliquer** vérifie à nouveau la sélection, les limites, les cases occupées, les chevauchements physiques et les verrous. Une seule annulation rétablit toute la disposition ; aucun écrasement partiel. Une modification du document, un changement de projet ou de sélection invalide l’aperçu. Échap l’annule sans fermer la Forge.

L’espacement exige au moins trois groupes. Les écarts sont arrondis à la grille et peuvent différer d’une case. Le regroupement préserve la disposition interne, mais ne déduit pas de fonction architecturale : sélectionner un sol continu avec tout son mobilier peut produire un seul groupe. Délimiter les éléments à déplacer avant d’aligner.

**Home** cadre la sélection lorsque le canvas a le focus. Le bouton « Cadrer les blocs » cadre tous les blocs visibles de la salle. Ces commandes ne modifient ni le document ni son historique.

## Explorateur

Le cinquième atelier recherche dans la salle active ou tout le projet. Filtres combinables : texte, type, calque, verrouillage et sas physiques non reliés. Le texte recherche les noms de salle, repères, identifiants et noms français des types ; accents et majuscules sont ignorés. Un résultat ouvre la bonne salle et cadre le bloc. Les labels sont échappés dans le DOM, jamais interprétés comme HTML.

L’affichage est limité à **50 résultats par page**. L’export JSON contient tous les résultats, et non seulement la page visible. Le rapport n’est pas un fichier de projet réimportable. Les cases cochées persistent entre les pages du document, pas entre différents projets. « Sélectionner dans le plan » exige que tous les blocs cochés appartiennent à une seule salle.

Le détail « Numéroter les repères cochés » applique un préfixe et un numéro croissant sur une ou plusieurs salles. Ordre : salles dans l’ordre du document, puis ligne, colonne et calque. Exemple : `Console 007`, `Console 008`. Identifiants, types et liaisons restent intacts. Un bloc ciblé verrouillé/masqué refuse toute l’opération. Confirmation et annulation sont disponibles.

## Réseau des salles

Le réseau possède un diagramme automatique de cartes et flèches, utilisable à la souris ou avec Tab/Entrée. La salle active est soulignée ; les salles non accessibles depuis elle ont une bordure pointillée. Le placement utilise la distance logique en nombre de liaisons, pas des coordonnées de monde. Le diagramme peut défiler sans agrandir la page mobile.

Il affiche au plus 160 tracés de liaison pour borner le rendu ; le nombre de tracés omis est annoncé et les listes détaillées conservent les connexions. Ce schéma ne calcule ni les sauts, ni les clés, ni la validité physique des portes. Aucun déplacement graphique d’une carte ne modifie la géométrie du niveau : les cartes servent uniquement à naviguer.

## Préservation des données

Le magasin par défaut passe à **`atf-frontier-forge-workspace-v134`**, schema de workspace 1. La clé historique **`atf-v62-frontier-forge-workspace`** est copiée une seule fois si le nouvel espace n’existe pas et si tous ses projets sont valides. Les octets historiques ne sont ni modifiés ni supprimés. Les projets restent au schema 3 et l’import schema 1/2 reste disponible.

Une fois la nouvelle copie enregistrée, rouvrir une ancienne version ne peut plus aplatir les nouvelles salles : elle ne connaît que l’ancienne clé. En contrepartie, les éditions réalisées ensuite dans une ancienne version ne sont pas synchronisées automatiquement. Exporter/importer explicitement les projets pour les récupérer.

La clé exportée sous le nom historique `FORGE_SAVE_KEY_V62` suit le magasin par défaut ; `FORGE_LEGACY_SAVE_KEY_V62` donne la valeur historique, et `FORGE_SAVE_KEY_V134` le nouveau nom explicite. Les stockages de campagne et d’assemblages restent inchangés. Les clés personnalisées passées explicitement au constructeur conservent leur comportement.

Une migration échouée par quota laisse la source intacte et conserve la copie en mémoire, sans annoncer de succès. Un espace canonique corrompu ne provoque jamais de retour silencieux à l’ancienne copie. Un ancien fichier corrompu est exportable en données originales et n’est pas écrasé automatiquement. Exporter les projets avant un retour de version ; ne pas effacer toutes les données du site.

Le chargement initial reconnaît le document enregistré que lui fournit l’application et ouvre un historique vide, sans notification d’écriture du contrôleur. **Annuler immédiatement après rechargement ne remplace plus le projet par le plan vide de construction.** L’import volontaire d’un JSON reste annulable dans le projet courant.

## Calculs et cache hors ligne

La validation est mémorisée par identité du document validé dans le contrôleur. Les gestes en cours ne réutilisent pas ce cache ; les diagnostics retournés sont copiés pour empêcher leur modification par un appelant. Il ne s’agit pas d’une réécriture complète des performances du workspace : la sauvegarde et certaines recherches parcourent encore tout le projet.

Le service worker change de version et inclut les modules et styles de la Forge dans son préchargement. Un test contrôle la présence de la fermeture des imports locaux et des trois feuilles CSS. Ce contrôle statique **ne certifie pas** l’installation PWA complète avec tous les médias.

## Vérifications

- `npm run test:forge` : 204 tests Node réussis localement (139 historiques + 65 nouveaux).
- Suites Chromium locales : 39 contrôles V130, 56 V133, 44 V134 réussis, en hôte hors réseau et stockage mémoire.
- Application complète : 36 contrôles locaux réussis avec ses modules et CSS, stockage mémoire et médias manquants substitués. Les captures de démonstration utilisent des salles créées par le modèle.
- La suite HTTP locale a rencontré `ERR_BLOCKED_BY_ADMINISTRATOR` ; les scripts HTTP restent dans le workflow GitHub pour vérifier le vrai localStorage de Chromium.
- Le script de l’application complète n’est pas une validation artistique ni une campagne parcourue manuellement. Le build complet, les médias, la PWA réelle, les lecteurs d’écran et les conflits simultanés entre onglets restent à contrôler.

Consulter les résultats GitHub du commit publié pour distinguer ces résultats locaux des exécutions CI. Les tests V134 natifs de transitions n’existent pas dans cette branche, car le moteur V132 n’y a pas été publié.
