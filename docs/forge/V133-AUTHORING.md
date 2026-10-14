# Frontier Forge V133 — ateliers de création

## Périmètre et version

Cette extension porte sur les outils de l’éditeur V130 de la PR #7, au-dessus de la référence `dfc1caf5bce7e5afbd643ccd65feeedb64a68be2`. Elle ne contient pas le compilateur ni les transitions natives V131/V132, restés dans l’archive locale livrée précédemment. Sur la branche publiée, le test reste donc celui de la salle active. Le numéro V133 décrit la passe d’édition, pas une publication cumulative du runtime V132.

Les fichiers `forge-editor-base.js` et `forge-save-v62-base.js` reprennent exactement les anciens modules de la référence. Les adaptateurs conservent les noms exportés utilisés par l’application. Les champs transitoires `forgeProjectIdV133` et `forgeProjectNameV133` corrigent le callback V130 qui remplaçait le nom et changeait parfois l’identité au changement de mode. Ils sont produits par le contrôleur, retirés des fichiers importés par le parseur, et ne sont pas stockés dans le document canonique.

## Quatre ateliers

**Outils** : sélection du calque actif ou de tous les calques visibles ; Maj + rectangle ajoute, Ctrl/Cmd + rectangle retire. Rectangle creux, rotation de groupe à 90°, verrouillage/déverrouillage collectif, remplacement de type et transfert entre calques. Répétition de 1 à 12 copies selon les décalages X/Y ; Ctrl/Cmd + D crée une copie à droite du groupe. Toutes les copies sont validées dans une seule transaction : une collision, un débordement ou un calque indisponible annule toute l’opération. Un sas relié doit être délié avant conversion en décor ou changement de type. Les huit dernières commandes sont affichées. Export PNG : vue actuelle du canvas, pas toutes les salles.

**Assemblages** : dix modules de blocs fournis (coursive, sas, terminal, passerelle, échelle, poste de mission, conduits, rencontre, insertion, balcon). Une sélection peut être nommée et enregistrée dans une bibliothèque personnelle. Rotation et miroir de la disposition, aperçu de pose vert/rouge, placement répété par clic, Échap pour quitter. Les identifiants sont recréés et les verrous individuels retirés à chaque copie. Les liens externes de sas ne sont jamais clonés implicitement. Une pose ne remplace aucun bloc existant.

Les assemblages ne sont pas des instances liées : modifier le module n’actualise pas les copies déjà placées. La rotation transforme les positions des cases ; elle ne tourne pas le sprite ou le comportement natif d’un personnage, d’une échelle ou d’un sas. Les modules sont des éléments de construction à adapter et valider dans leur salle, pas des salles promises jouables à toutes les échelles.

**Projets** : création Mission/Vaisseau, recherche, ouverture, renommage, copie, sauvegarde explicite, suppression après confirmation. Les noms et identités restent stables au changement de mode. Chaque ouverture repart avec un historique indépendant ; les annulations ne traversent pas les projets. L’export de l’espace de travail contient tous les projets et les modifications courantes, y compris celles encore en mémoire après une erreur de stockage. L’import ajoute des copies avec de nouveaux identifiants, sans remplacer les projets existants.

La récupération graphique lit la dernière copie de secours du workspace V130. Sa restauration exige confirmation et une écriture réussie ; une copie ayant changé depuis la lecture est refusée. Exporter les projets et l’original sauvegardé AVANT de confirmer un remplacement. La copie de secours est best-effort et ne remplace pas les exports manuels. Les erreurs de quota ou conflits bloquent le changement de projet, sans effacer le document ouvert.

**Réseau des salles** : cartes de secteurs, liaisons dirigées, salles inaccessibles depuis la salle active, sas non reliés et accès direct au secteur ou au sas sélectionné. C’est un schéma logique, pas une carte de positionnement dans le monde et pas une preuve physique de navigabilité. La possibilité de traverser une liaison dépend du runtime installé.

## Données et budgets

Le document de niveau reste au schema 3, le workspace au schema 1 dans `atf-v62-frontier-forge-workspace`. La bibliothèque d’assemblages est indépendante : `atf-forge-assemblies-v133`, schema 1, 64 entrées personnelles maximum, 1 024 blocs par entrée, 8 192 blocs au total et 2 Mio. L’import d’un workspace est limité à 16 Mio et 256 projets. Les exports peuvent échouer si le navigateur manque de mémoire : aucune garantie de quota universel n’est donnée.

Les données originales d’une bibliothèque illisible restent exportables ; elle n’est pas écrasée automatiquement. La restauration graphique concerne le workspace, pas une migration automatique d’une bibliothèque d’assemblages corrompue. Aucune clé de campagne n’est écrite par ces opérations. Les détections de modifications entre instances sont optimistes, pas un verrou atomique entre plusieurs onglets.

## Vérifications

```sh
npm run test:forge
npm run test:forge:authoring
python scripts/verify-forge-browser-v130.py --output /tmp/forge-v130
python scripts/verify-forge-browser-v133.py --output /tmp/forge-v133
```

Localement : 139 tests Node (86 historiques + 53 nouveaux), 39 contrôles navigateur historiques et 56 nouveaux. La navigation HTTP locale étant refusée dans l’environnement de travail, les contrôles locaux ont été relancés avec `--offline` : vrais modules ES, vrai DOM/Canvas, stockage en mémoire injecté. Le script HTTP conservé est exécuté par le workflow GitHub, avec origine et localStorage du navigateur. Vérifier son résultat sur le commit de la PR : les succès locaux ne remplacent pas ce résultat.

La copie cumulative locale V132 + outils V133 a aussi été contrôlée : 181 tests d’édition/compilation, 34 tests de moteur Mission/Vaisseau, les mêmes suites navigateur 39 + 56, et 15 contrôles du shell complet avec médias partiels et stockage substitué. Ces résultats ne signifient PAS que la V132 est publiée dans cette PR.

Non certifiés dans cette passe : build complet avec tous les médias, PWA après installation à froid et ancien cache, lecteurs d’écran, toutes les courses entre onglets, sauvegarde cloud, rendu final de toutes les salles et parcours physique de chaque saut. Les assemblages, le réseau et la bibliothèque ne créent aucun script de mission ou de dialogue.
